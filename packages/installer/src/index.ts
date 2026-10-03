// Resources
import {
  DEFAULT_INSTALL_COMMANDS,
  DEFAULT_PACKAGE,
  EXCLUDED_PACKAGE_SCRIPTS,
  IGNORE_PATH_LIST,
  PACKAGE_NAME,
  type RootPackageScript,
  createPrompt,
  execute,
  isValidPackage,
  replaceOccurrences
} from "./lib";
import { type Task, confirm, intro, log, outro, path, select, tasks, text } from "@clack/prompts";
import { readFile, writeFile } from "node:fs/promises";
// oxlint-disable-next-line sort-imports
import { ActionAbortedError, InternalError } from "@repo/utility/errors";
import { downloadTemplate } from "giget";
import installerPackage from "../package.json";
import { z } from "zod";

/** Invokes the installation helper. */
const main = async (): Promise<void> => {
  try {
    intro(`bun-monorepo (${installerPackage.version})`);

    /** The name to use for the author. */
    const authorName = await createPrompt(async () =>
      text({
        message: "What is your name?",
        placeholder: "Lucas Stranks",
        validate: name =>
          z.safeParse(z.string().min(3), name).success ? undefined : "Must be at least 3 characters long."
      })
    );

    /** The email address to use for the author. */
    const authorEmail = await createPrompt(async () =>
      text({
        message: "What is your email address?",
        placeholder: "name@domain.com",
        validate: email => (z.safeParse(z.email(), email).success ? undefined : "Not a valid email address.")
      })
    );

    /** The name to set for the project. */
    const projectName = await createPrompt(async () =>
      text({
        message: "What would you like to call your project?",
        placeholder: "cool-project",
        validate: name => {
          const result = z.safeParse(
            z
              .string()
              .min(3, "Must be at least 3 characters long.")
              .lowercase("Must be all lowercase.")
              .refine(value => !value.includes(" "), "Must not have any whitespace."),
            name
          );

          // oxlint-disable-next-line oxc/no-optional-chaining
          return result.success ? undefined : (result.error.issues[0]?.message ?? "Unknown error.");
        }
      })
    );

    /** The path to create the project at. */
    const targetDirectory = await createPrompt(async () =>
      path({
        directory: true,
        message: "Where do you want to create this project at?"
      })
    );

    /** The type of framework to use for installing dependencies. */
    const frameworkType = await createPrompt(async () =>
      select<keyof typeof DEFAULT_INSTALL_COMMANDS>({
        message: "What framework would you like to use for the project?",
        options: [
          { label: "Bun (Recommended)", value: "bun" },
          { label: "NPM", value: "npm" },
          { label: "PNPM", value: "pnpm" }
        ]
      })
    );

    /** Whether the dependencies should be installed at the newly created project. */
    const shouldInstallDependencies = await createPrompt(async () =>
      confirm({
        message: "Once the template is ready, would you like me to install my dependencies?"
      })
    );

    let clonedDirectory: string | undefined = undefined;
    const installationTasks: Task[] = [
      {
        task: async () => {
          const { dir } = await downloadTemplate(`gh:${PACKAGE_NAME}`, {
            dir: targetDirectory,
            ignore: IGNORE_PATH_LIST
          });

          clonedDirectory = dir;
        },
        title: "Pulling most recent version from GitHub."
      },
      {
        task: async () => {
          if (clonedDirectory === undefined) {
            throw new InternalError("Failed to clone.");
          }

          /** The raw contents of the 'package.json' of the cloned project. */
          const clonedPackageContents = await readFile(`${clonedDirectory}/package.json`, "utf8");

          /** The JSON contents of the project. */
          const clonedPackage = JSON.parse(clonedPackageContents) as unknown;
          if (!isValidPackage(clonedPackage)) {
            throw new InternalError("Invalid package.");
          }

          /* Assign default package configuration. */
          Object.assign(clonedPackage, DEFAULT_PACKAGE);

          /* Assign author information. */
          clonedPackage.author = {
            email: authorEmail,
            name: authorName
          };

          /* Assign project name. */
          clonedPackage.name = projectName;

          /* Exclude the excluded package scripts. */
          if (clonedPackage.scripts) {
            clonedPackage.scripts = Object.fromEntries(
              Object.entries(clonedPackage.scripts).filter(
                // oxlint-disable-next-line typescript/no-unsafe-type-assertion typescript/prefer-readonly-parameter-types
                ([script]) => !EXCLUDED_PACKAGE_SCRIPTS.has(script as RootPackageScript)
              )
            );
          }

          /* Update cloned file. */
          await writeFile(`${clonedDirectory}/package.json`, JSON.stringify(clonedPackage, undefined, 2));

          /* Update imported dependencies. */
          await replaceOccurrences({
            cwd: clonedDirectory,
            extensions: ["ts", "tsx", "json"],
            queries: [
              {
                query: `"@repo/`,
                replaceWith: `"@${projectName}/`
              },
              {
                query: "'@repo/",
                replaceWith: `'@${projectName}/`
              }
            ]
          });
        },
        title: "Applying configured options to template."
      }
    ];

    if (shouldInstallDependencies) {
      installationTasks.push({
        task: async () => {
          await execute(DEFAULT_INSTALL_COMMANDS[frameworkType], {
            cwd: clonedDirectory
          });
        },
        title: "Installing dependencies."
      });
    }

    await tasks(installationTasks);

    outro(`Your project was successfully created at: ${clonedDirectory}`);
  } catch (error: unknown) {
    if (error instanceof ActionAbortedError) {
      log.error("Installation was aborted.");
    } else if (error instanceof InternalError) {
      log.error(error.message);
    } else {
      log.error("Something went wrong, please try again.");
    }

    process.exitCode = 1;
  }
};

await main();
