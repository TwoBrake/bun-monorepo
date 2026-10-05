// Resources
import {
  DEFAULT_COMMAND_PREFIXES,
  checkAssetConflicts,
  createPrompt,
  createReadableError,
  createReadableZodError,
  createTitle,
  execute,
  frameworkSelect,
  isValidPackage
} from "../lib";
import { type Task, confirm, intro, log, outro, path as promptPath, select, tasks, text } from "@clack/prompts";
import type { Dirent } from "node:fs";
import path from "node:path";
// oxlint-disable-next-line sort-imports
import { cp, lstat, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { z } from "zod";

/** Creates an application or package without overwriting existing assets. */
const assetCreator = async (): Promise<void> => {
  try {
    intro(createTitle("Asset Creator"));
    log.message("Create an application or package in an existing Bun monorepo.");

    /** The path of the Bun monorepo. */
    const projectPath = await createPrompt(async () =>
      promptPath({ directory: true, message: "Where is your monorepo located?" })
    );

    const projectRootRawContents = await readdir(projectPath, { withFileTypes: true });
    const projectRootContents = new Set<string>(
      projectRootRawContents
        .filter((file: Readonly<Dirent>) => file.isDirectory())
        .map((file: Readonly<Dirent>) => file.name)
    );

    const rootPackageRaw = await readFile(`${projectPath}/package.json`, "utf8");
    const rootPackage = JSON.parse(rootPackageRaw) as unknown;

    if (!isValidPackage(rootPackage)) {
      throw new Error(`Invalid root manifest at "${path.join(projectPath, "package.json")}": expected a package name.`);
    }

    if (typeof rootPackage.name !== "string" || !/^[a-z0-9][a-z0-9_-]*$/u.test(rootPackage.name)) {
      throw new Error(
        "The root package name must be an unscoped name using lowercase letters, numbers, hyphens, or underscores."
      );
    }

    /* If the project isn't a valid monorepo, don't continue with creation. */
    if (!projectRootContents.has("apps") || !projectRootContents.has("packages")) {
      throw new Error(`Invalid monorepo at "${projectPath}": expected apps/ and packages/ directories.`);
    }

    /** The type of asset to create. */
    const assetType = await createPrompt(async () =>
      select({
        message: "What type of asset would you like to create?",
        options: [
          {
            label: "Application",
            value: "app"
          },
          {
            label: "Package",
            value: "package"
          }
        ]
      })
    );

    /** The name of the asset. */
    const assetName = await createPrompt(async () =>
      text({
        initialValue: "",
        message: `What would you like to call your ${assetType}?`,
        placeholder: "database",
        validate: name =>
          createReadableZodError(
            z.safeParse(
              z
                .string()
                .min(3, "Use at least 3 characters.")
                .regex(
                  /^[a-z0-9][a-z0-9_-]*$/u,
                  "Start with a lowercase letter or number; use only lowercase letters, numbers, hyphens, or underscores."
                ),
              name
            )
          )
      })
    );

    const packageName = `@${rootPackage.name}/${assetName}`;
    const clonedPath = path.join(projectPath, assetType === "app" ? "apps" : "packages", assetName);

    await checkAssetConflicts(projectPath, assetName, packageName);

    /* Validate the template before creating any files. */
    const templatePath = path.join(projectPath, "packages", "config");
    const templateManifestPath = path.join(templatePath, "package.json");
    const templatePackage: unknown = JSON.parse(await readFile(templateManifestPath, "utf8"));
    if (!isValidPackage(templatePackage) || typeof templatePackage.name !== "string" || !templatePackage.name) {
      throw new Error(`Invalid template manifest at "${templateManifestPath}": expected a nonempty package name.`);
    }
    const templateSourcePath = path.join(templatePath, "src");
    const templateSource = await lstat(templateSourcePath);
    if (!templateSource.isDirectory()) {
      throw new Error(`Invalid template: "${templateSourcePath}" must be a directory.`);
    }
    templatePackage.name = packageName;
    delete templatePackage.dependencies;
    delete templatePackage.exports;

    /** The package manager used to run formatting. */
    const frameworkType = await createPrompt(async () => frameworkSelect("bun"));

    /** Whether or not a format should take place once finished. */
    const shouldFormat = await createPrompt(async () =>
      confirm({ initialValue: true, message: "Run the project formatter after creating the asset?" })
    );

    /** The tasks that need to complete for the asset to be created. */
    const assetTasks: Task[] = [
      {
        task: async (): Promise<void> => {
          /* Creating the directory fails for any existing destination, including dangling symlinks. */
          await mkdir(clonedPath);
          try {
            await cp(templatePath, clonedPath, {
              errorOnExist: true,
              filter: file => path.basename(file) !== "node_modules",
              force: false,
              recursive: true
            });
            // Reject copied symlinks before writing through them.
            await Promise.all(
              [path.join(clonedPath, "package.json"), path.join(clonedPath, "src", "index.ts")].map(async target => {
                const targetInfo = await lstat(target).catch((error: unknown) => {
                  if (error instanceof Error && "code" in error && error.code === "ENOENT") {
                    return;
                  }
                  throw error;
                });
                if (targetInfo && targetInfo.isSymbolicLink()) {
                  throw new Error(`Invalid template: "${target}" must not be a symbolic link.`);
                }
              })
            );
            await writeFile(
              path.join(clonedPath, "package.json"),
              `${JSON.stringify(templatePackage, undefined, 2)}\n`,
              "utf8"
            );
            await writeFile(path.join(clonedPath, "src", "index.ts"), "// TODO: Put asset code here!\n", "utf8");
          } catch (error) {
            await rm(clonedPath, { force: true, recursive: true });
            throw error;
          }
        },
        title: "Creating asset from the configuration template."
      }
    ];

    if (shouldFormat) {
      assetTasks.push({
        task: async () => {
          try {
            await execute(`${DEFAULT_COMMAND_PREFIXES[frameworkType]} run format`, { cwd: projectPath });
          } catch (error) {
            throw new Error(
              `Asset created at "${clonedPath}", but formatting failed. Run the project format command to retry.`,
              { cause: error }
            );
          }
        },
        title: "Formatting project."
      });
    }

    await tasks(assetTasks);

    outro(`Created ${assetType} "${packageName}" at "${clonedPath}".`);
  } catch (error) {
    log.error(error instanceof Error ? error.message : createReadableError(error));
    process.exitCode = 1;
  }
};

export default assetCreator;
