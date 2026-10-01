// Resources
import { intro, isCancel, log, outro, spinner, text } from "@clack/prompts";
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
    throw new Error("Prompt aborted.");
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
        validate: (name) =>
          name !== undefined && name.length < 3
            ? "Must be at least 3 characters long."
            : undefined,
      }),
    );

    const pulling = spinner();
    pulling.start("Installing template from GitHub.");

    const { dir: clonedDirectory } = await downloadTemplate(
      `gh:${PACKAGE_NAME}`,
      {
        dir: "../../.tmp/cloned-template",
      },
    );
    pulling.stop("Installed template from GitHub.");

    log.warn(clonedDirectory);

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

    log.info(clonedPackage.name ?? "N/A");

    outro(`We're all done here, ${String(authorName)}!`);
  } catch {
    log.error("Something went wrong, please try again.");
    process.exitCode = 1;
  }
};

await main();
