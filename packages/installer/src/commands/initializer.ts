// Resources
import {
  CLONE_IGNORE_PATH_LIST,
  COMMAND_ARGUMENTS,
  DEFAULT_COMMAND_PREFIXES,
  DEFAULT_PACKAGE,
  EXCLUDED_PACKAGE_SCRIPTS,
  PACKAGE_NAME,
  type RootPackageScript,
  createPrompt,
  createReadableError,
  createReadableZodError,
  createTitle,
  execute,
  frameworkSelect,
  isValidPackage,
  replaceOccurrences
} from "../lib";
import { type Task, confirm, intro, log, outro, path, tasks, text } from "@clack/prompts";
import { readFile, readdir, writeFile } from "node:fs/promises";
// oxlint-disable-next-line sort-imports
import { ActionAbortedError, InternalError } from "@repo/utility/errors";
import type { Possible } from "@repo/utility";
import { downloadTemplate } from "giget";
import installerPackage from "../../package.json";
import { z } from "zod";

/** Invokes the installation helper. */
const initializer = async (): Promise<void> => {
  try {
    intro(createTitle());
    log.message(installerPackage.description);

    const flags = COMMAND_ARGUMENTS.values;

    /** The name to use for the author. */
    const authorName = await createPrompt(async () =>
      text({
        initialValue: flags.name ?? "",
        message: "What is your name?",
        placeholder: "Lucas Stranks",
        validate: name =>
          createReadableZodError(z.safeParse(z.string().min(3, "Must be at least 3 characters long."), name))
      })
    );

    /** The email address to use for the author. */
    const authorEmail = await createPrompt(async () =>
      text({
        initialValue: flags.email ?? "",
        message: "What is your email address?",
        placeholder: "name@domain.com",
        validate: email => createReadableZodError(z.safeParse(z.email("Not a valid email address."), email))
      })
    );

    /** The name to set for the project. */
    const projectName = await createPrompt(async () =>
      text({
        initialValue: flags.projectName ?? "",
        message: "What would you like to call your project?",
        placeholder: "cool-project",
        validate: name =>
          createReadableZodError(
            z.safeParse(
              z
                .string()
                .min(3, "Must be at least 3 characters long.")
                .lowercase("Must be all lowercase.")
                .refine(value => !value.includes(" "), "Must not have any whitespace."),
              name
            )
          )
      })
    );

    /** The path to create the project at. */
    const targetDirectory = await createPrompt(async () =>
      path({
        directory: true,
        initialValue: flags.directory,
        message: "Where do you want to create this project at?"
      })
    );

    /* Ensure the target directory is empty. */
    const targetRaw = await readdir(targetDirectory);
    if (targetRaw.length > 0) {
      throw new InternalError("The directory must be empty.");
    }

    /** The type of framework to use for installing dependencies. */
    const frameworkType = await createPrompt(async () => frameworkSelect("bun"));

    /** Whether the dependencies should be installed at the newly created project. */
    const shouldInstallDependencies = await createPrompt(async () =>
      confirm({
        initialValue: flags.installDependencies,
        message: "Once the template is ready, would you like me to install my dependencies?"
      })
    );

    let clonedDirectory: Possible<string> = undefined;
    const installationTasks: Task[] = [
      {
        task: async () => {
          const { dir } = await downloadTemplate(`gh:${PACKAGE_NAME}`, {
            dir: targetDirectory,
            ignore: [...CLONE_IGNORE_PATH_LIST]
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
          await execute(`${DEFAULT_COMMAND_PREFIXES[frameworkType]} install`, {
            cwd: clonedDirectory
          });
        },
        title: "Installing dependencies."
      });
    }

    /* Output overview of selected options. */
    log.info(
      `Overview:\n\nProject Name: ${projectName}\nAuthor Name: ${authorName}\nAuthor Email: ${authorEmail}\nPath: ${targetDirectory}\nFramework: ${frameworkType}\nInstall Dependencies: ${shouldInstallDependencies ? "Yes" : "No"}`
    );

    /* Warn interruptions may have unintended side-effects. */
    log.warn(
      "Proceeding to the next step will start the installation process. Cancelling during it may cause unintended side-effects."
    );

    const shouldFinalize = await createPrompt(async () =>
      confirm({ initialValue: flags.finalize, message: "Are you sure you want to finalize the installation?" })
    );

    if (!shouldFinalize) {
      throw new ActionAbortedError("User cancelled.");
    }

    await tasks(installationTasks);

    outro(`Your project was successfully created at: ${clonedDirectory}`);
  } catch (error: unknown) {
    log.error(createReadableError(error));
    process.exitCode = 1;
  }
};

export default initializer;
