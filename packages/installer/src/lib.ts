// Resources
import { ActionAbortedError } from "@repo/utility/errors";
import type { PackageJson as Package } from "type-fest";
import { exec } from "node:child_process";
import { isCancel } from "@clack/prompts";
import { promisify } from "node:util";
import type rootPackage from "../../../package.json";

/** The data required to replace a set of content in all files. */
export interface ReplaceOccurrencesData {
  cwd: string;
  extensions: string;
  query: string;
  replacer: string;
}

/** Scripts that are configured in the root package. */
export type RootPackageScript = keyof (typeof rootPackage)["scripts"];

/** The default values to apply to a new 'package.json'. */
export const DEFAULT_PACKAGE: Partial<Package> = {
  version: "0.0.1"
} as const;

/** The package name and scope to be cloned to the user's file system. */
export const PACKAGE_NAME = "TwoBrake/bun-monorepo" as const;

/** The default commands that can be used with the framework selection to install dependencies. */
export const DEFAULT_INSTALL_COMMANDS = {
  bun: "bun install",
  npm: "npm install",
  pnpm: "pnpm install"
} as const;

/** The package scripts to remove during the installation process. */
export const EXCLUDED_PACKAGE_SCRIPTS = new Set<RootPackageScript>(["installer:build"]);

/** The paths to ignore when pulling source from remote. */
export const IGNORE_PATH_LIST: string[] = ["packages/installer", "README.md"];

// Export const replaceOccurrences = (data: ReplaceOccurrencesData) => true;

/**
 * Ensures the provided value is a proper package.
 *
 * @param value The package to validate.
 *
 * @returns The determination that the value is a proper package.
 */
export const isValidPackage = (value: unknown): value is Package =>
  typeof value === "object" && value !== null && "name" in value;

/**
 * Ensures the provided prompt is cancelled.
 *
 * @param prompt The prompt.
 *
 * @returns A boolean representing if the prompt was cancelled or not.
 */
export const isCancelled = (prompt: unknown): prompt is symbol => isCancel(prompt);

/**
 * Wrapper for creating prompts to handle aborts.
 *
 * @param prompt A function that returns the prompt result.
 *
 * @returns The prompt result.
 */
export const createPrompt = async <TPrompt>(
  prompt: () => Promise<TPrompt | symbol>
): Promise<Exclude<TPrompt, symbol>> => {
  const result = await prompt();

  if (isCancelled(result)) {
    throw new ActionAbortedError("PROMPT");
  }

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return result as Promise<Exclude<TPrompt, symbol>>;
};

/** The execution API wrapper that allows asynchronous usage. */
// oxlint-disable-next-line typescript/strict-void-return
export const execute = promisify(exec);
