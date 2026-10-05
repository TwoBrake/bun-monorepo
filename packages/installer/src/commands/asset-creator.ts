// Resources
import {
  DEFAULT_COMMAND_PREFIXES,
  type ReadonlyDirent,
  createPrompt,
  createReadableError,
  createReadableZodError,
  createTitle,
  deepReadDirectory,
  execute,
  frameworkSelect,
  isValidPackage
} from "../lib";
import { type Task, confirm, intro, log, outro, path as promptPath, select, tasks, text } from "@clack/prompts";
import type { Dirent } from "node:fs";
import path from "node:path";
// oxlint-disable-next-line sort-imports
import { cp, readdir, readFile, writeFile } from "node:fs/promises";
import { InternalError } from "@repo/utility/errors";
import { z } from "zod";

/** The asset creator  */
const assetCreator = async (): Promise<void> => {
  try {
    intro(createTitle("Asset Creator"));
    log.message("A helper for creating new assets under an already constructed Bun monorepo setup.");

    /** The path of the Bun monorepo. */
    const projectPath = await createPrompt(async () =>
      promptPath({ directory: true, message: "Where is your current project at?" })
    );

    const projectRootRawContents = await readdir(projectPath, { withFileTypes: true });
    const projectRootContents = new Set<string>(projectRootRawContents.map((file: Readonly<Dirent>) => file.name));

    const rootPackageRaw = await readFile(`${projectPath}/package.json`, "utf8");
    const rootPackage = JSON.parse(rootPackageRaw) as unknown;

    if (!isValidPackage(rootPackage)) {
      throw new InternalError("Invalid root package.");
    }

    /* If the project isn't a valid monorepo, don't continue with creation. */
    if (!projectRootContents.has("apps") || !projectRootContents.has("packages")) {
      throw new InternalError("This is not a monorepo.");
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
              z.string().min(3, "Must be at least 3 characters long.").lowercase("Must be all lowercase."),
              name
            )
          )
      })
    );

    /* Load all package's in monorepo. */
    const projectContents = await deepReadDirectory(projectPath, ["node_modules"]);
    const projectPackageConfigs = projectContents.filter((file: ReadonlyDirent) => file.name === "package.json");

    /* Ensure a folder doesn't exist with the same name to prevent overlap. */
    if (projectPackageConfigs.some(config => path.basename(config.parentPath) === assetName)) {
      throw new InternalError("There is already an asset's folder with the provided name.");
    }

    /* Information about all packages. */
    const projectPackageRawContents = await Promise.all(
      projectPackageConfigs.map(async (file: ReadonlyDirent) => {
        const fileRaw = await readFile(path.join(file.parentPath, file.name), "utf8");
        return JSON.parse(fileRaw) as unknown;
      })
    );
    const projectPackageContents = projectPackageRawContents.filter((json: unknown) => isValidPackage(json));

    /* Ensure that there isn't already an asset with the configured name. */
    // oxlint-disable-next-line typescript/prefer-readonly-parameter-types
    if (projectPackageContents.some(pack => pack.name === `@${rootPackage.name}/${assetName}`)) {
      throw new InternalError("An asset with the provided name already exists.");
    }

    /** The framework the user is using. */
    const frameworkType = await createPrompt(async () => frameworkSelect("bun"));

    /** Whether or not a format should take place once finished. */
    const shouldFormat = await createPrompt(async () =>
      confirm({ initialValue: true, message: "Would you like me to run the formatting framework after?" })
    );

    /** The tasks that need to complete for the asset to be created. */
    const assetTasks: Task[] = [
      {
        task: async (): Promise<void> => {
          const clonedPath = `${projectPath}/${assetType === "app" ? "apps" : "packages"}/${assetName}`;
          await cp(`${projectPath}/packages/config`, clonedPath, {
            filter: file => path.basename(file) !== "node_modules",
            recursive: true
          });

          const clonedPackageRaw = await readFile(`${clonedPath}/package.json`, "utf8");
          const clonedPackage = JSON.parse(clonedPackageRaw) as unknown;

          if (!isValidPackage(clonedPackage)) {
            throw new InternalError("Invalid asset package.");
          }

          clonedPackage.name = `@${rootPackage.name}/${assetName}`;

          delete clonedPackage.dependencies;
          delete clonedPackage.exports;

          await writeFile(`${clonedPath}/package.json`, JSON.stringify(clonedPackage), "utf8");
          await writeFile(`${clonedPath}/src/index.ts`, "// TODO: Put asset code here!", "utf8");
        },
        title: "Clone configuration package template and configure."
      }
    ];

    if (shouldFormat) {
      assetTasks.push({
        task: async () => {
          await execute(`${DEFAULT_COMMAND_PREFIXES[frameworkType]} run format`, { cwd: projectPath });
        },
        title: "Running linting framework."
      });
    }

    await tasks(assetTasks);

    outro(
      `Successfully created new ${assetType} at '${projectPath}/${assetType === "app" ? "apps" : "packages"}/${assetName}'.`
    );
  } catch (error) {
    log.error(String(error));
    log.error(createReadableError(error));
    process.exitCode = 1;
  }
};

export default assetCreator;
