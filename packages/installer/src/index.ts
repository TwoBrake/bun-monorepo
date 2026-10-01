// Resources
import { intro, log, outro, text } from "@clack/prompts";
import type { Package } from "@repo/utility";

/**
 * Ensures the provided value is a proper package.
 *
 * @param value The package to validate.
 *
 * @returns The determination that the value is a proper package.
 */
const isValidPackage = (value: unknown): value is Package =>
  typeof value === "object" && value !== null && "name" in value;

/** Invokes the installation helper. */
const main = async (): Promise<void> => {
  try {
    intro("bun-monorepo");

    /* Ensure we have proper package. */
    const rootPackage = (await Bun.file("package.json").json()) as unknown;
    if (!isValidPackage(rootPackage)) {
      log.error("Invalid package.");

      process.exitCode = 1;
      return;
    }

    log.info(rootPackage.name);

    const name = await text({ message: "What is your name?" });

    outro(`We're all done here, ${String(name)}!`);
  } catch {
    log.error("Something went wrong, please try again.");
    process.exitCode = 1;
  }
};

await main();
