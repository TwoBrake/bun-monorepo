// Resources
import {
  intro,
  isCancel,
  log,
  outro,
  path,
  spinner,
  text,
} from "@clack/prompts";
import { ActionAbortedError } from "@repo/utility/errors";
import type { PackageJson as Package } from "type-fest";
import { downloadTemplate } from "giget";

/** The default package configuration to use for the cloned template. */
const DEFAULT_PACKAGE: Partial<Package> = {
  version: "0.0.1",
};

/** The package name and scope to be cloned to the user's file system. */
const PACKAGE_NAME = "TwoBrake/bun-monorepo";

/**
 * Ensures the provided value is a proper package.
 *
 * @param value The package to validate.
 *
 * @returns The determination that the value is a proper package.
 */
const isValidPackage = (value: unknown): value is Package =>
  typeof value === "object" && value !== null && "name" in value;

/**
 * Ensures the provided prompt is cancelled.
 *
 * @param prompt The prompt.
 *
 * @returns A boolean representing if the prompt was cancelled or not.
 */
const isCancelled = (prompt: unknown): prompt is symbol => isCancel(prompt);

/**
 * Wrapper for creating prompts to handle aborts.
 *
 * @param prompt A function that returns the prompt result.
 *
 * @returns The prompt result.
 */
const createPrompt = async <TPrompt>(
  prompt: () => Promise<TPrompt | symbol>,
): Promise<TPrompt> => {
  const result = await prompt();

  if (isCancelled(result)) {
    throw new ActionAbortedError("PROMPT");
  }

  return result;
};

/** Invokes the installation helper. */
const main = async (): Promise<void> => {
  try {
    intro("bun-monorepo");

    /* Ask the user for their name. */
    const authorName = await createPrompt(async () =>
      text({
        message: "What is your name?",
        placeholder: "Lucas Stranks",
        validate: (name) =>
          name !== undefined && name.length < 3
            ? "Must be at least 3 characters long."
            : undefined,
      }),
    );

    const authorEmail = await createPrompt(async () =>
      text({
        message: "What is your email address?",
        placeholder: "name@domain.com",
        validate: (email) =>
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/u.test(
            String(email),
          )
            ? undefined
            : "Not a valid email address.",
      }),
    );

    const projectName = await createPrompt(async () =>
      text({
        message: "What would you like to call your project?",
        placeholder: "cool-project",
        validate: (name) => {
          if (name === undefined || name.length < 3) {
            return "The name must be at least 3 characters long.";
          }

          if (name !== name.toLowerCase()) {
            return "The name must be all lower case.";
          }

          if (name.includes(" ")) {
            return "The name must not have any whitespace.";
          }

          // oxlint-disable-next-line unicorn/no-useless-undefined
          return undefined;
        },
      }),
    );

    /* Ask the user the path to set the project up at. */
    const targetDirectory = await createPrompt(async () =>
      path({
        directory: true,
        message: "Where do you want to create this project at?",
      }),
    );

    const pulling = spinner();
    pulling.start("Installing template from GitHub.");

    const { dir: clonedDirectory } = await downloadTemplate(
      `gh:${PACKAGE_NAME}`,
      {
        dir: String(targetDirectory),
      },
    );
    pulling.stop("Installed template from GitHub.");

    /* Ensure we have proper package. */
    const clonedPackage = (await Bun.file(
      `${clonedDirectory}/package.json`,
    ).json()) as unknown;
    if (!isValidPackage(clonedPackage)) {
      log.error("Invalid package.");

      process.exitCode = 1;
      return;
    }

    /* Assign default package configuration. */
    Object.assign(clonedPackage, DEFAULT_PACKAGE);
    log.info("Successfully applied default options.");

    /* Assign author information. */
    clonedPackage.author = {
      email: String(authorEmail),
      name: String(authorName),
    };

    /* Assign project name. */
    clonedPackage.name = String(projectName);

    /* Update cloned file. */
    await Bun.write(
      `${clonedDirectory}/package.json`,
      JSON.stringify(clonedPackage, undefined, 2),
    );
    log.info("Successfully applied configured options.");

    outro(`You're project was successfully created at: ${clonedDirectory}`);
  } catch (error: unknown) {
    if (error instanceof ActionAbortedError) {
      log.error("Installation was aborted.");
    } else {
      log.error("Something went wrong, please try again.");
    }

    process.exitCode = 1;
  }
};

await main();
