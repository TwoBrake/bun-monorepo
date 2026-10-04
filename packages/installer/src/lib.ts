// Resources
import { ActionAbortedError, InternalError } from "@repo/utility/errors";
import type { Dirent } from "node:fs";
import type { PackageJson as Package } from "type-fest";
// oxlint-disable-next-line sort-imports
import { readFile, readdir, writeFile } from "node:fs/promises";
import { exec } from "node:child_process";
import installerPackage from "../package.json";
import { isCancel } from "@clack/prompts";
import path from "node:path";
// oxlint-disable-next-line sort-imports
import { parseArgs, promisify } from "node:util";
import type { ZodSafeParseResult } from "zod";
import type rootPackage from "../../../package.json";

/** The data required to replace a set of content in all files. */
export interface ReplaceOccurrencesParameters {
  readonly cwd: string;
  readonly extensions: readonly string[];
  readonly queries: readonly Readonly<ReplaceOccurrenceQuery>[];
}

/** An entry for a query. */
export interface ReplaceOccurrenceQuery {
  readonly query: string;
  readonly replaceWith: string;
}

/** Scripts that are configured in the root package. */
export type RootPackageScript = keyof (typeof rootPackage)["scripts"];

/** An optional set of command arguments that can be passed to the installer to input preset values. */
export const COMMAND_ARGUMENTS = parseArgs({
  options: {
    directory: {
      short: "d",
      type: "string"
    },
    email: {
      short: "e",
      type: "string"
    },
    finalize: {
      short: "y",
      type: "boolean"
    },
    framework: {
      short: "f",
      type: "string"
    },
    installDependencies: {
      short: "i",
      type: "boolean"
    },
    name: {
      short: "n",
      type: "string"
    },
    projectName: {
      short: "p",
      type: "string"
    }
  }
});

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
export const EXCLUDED_PACKAGE_SCRIPTS = new Set<RootPackageScript>(["installer:build", "installer:publish"]);

/** The paths to ignore when pulling source from remote. */
export const IGNORE_PATH_LIST: string[] = [
  "packages/installer",
  "packages/installer/**",
  "README.md",
  ".github/images",
  ".github/images/**",
  ".github/workflows/publish-installer.yml",
  ".github/dependabot.yml"
];

/**
 * Constructs a title to be used in CLI introductions.
 *
 * @param page The custom sub-page title to use.
 *
 * @returns The constructed title.
 */
export const createTitle = (page?: string): string =>
  `bun-monorepo (${installerPackage.version})${page === undefined ? "" : ` - ${page}`}`;

/**
 * Constructs a readable error from an error instance.
 *
 * @param error The error instance.
 *
 * @returns The readable error.
 */
export const createReadableError = (error: unknown): string => {
  if (error instanceof ActionAbortedError) {
    return "Installation was aborted.";
  } else if (error instanceof InternalError) {
    return error.message;
  }

  return "Something went wrong, please try again.";
};

// oxlint-disable-next-line typescript/prefer-readonly-parameter-types
export const createReadableZodError = (zodResult: ZodSafeParseResult<unknown>): string | undefined =>
  // oxlint-disable-next-line oxc/no-optional-chaining
  zodResult.success ? undefined : (zodResult.error.issues[0]?.message ?? "Unknown error.");

/**
 * Replaces all of the occurrences of a query based on the provided extensions and CWD.
 *
 * @param data The data to include in the operation.
 */
export const replaceOccurrences = async (data: Readonly<ReplaceOccurrencesParameters>): Promise<void> => {
  const { cwd, extensions, queries } = data;
  const directory = await readdir(cwd, { withFileTypes: true });

  await Promise.all(
    directory.map(async (file: Readonly<Dirent>) => {
      const filePath = path.join(cwd, file.name);

      if (file.isDirectory()) {
        await replaceOccurrences({
          cwd: filePath,
          extensions,
          queries
        });

        return;
      }

      if (!extensions.includes(path.extname(file.name).slice(1))) {
        return;
      }

      const raw = await readFile(filePath, "utf8");
      let updated = raw;

      for (const query of queries) {
        updated = updated.replaceAll(query.query, query.replaceWith);
      }

      if (updated === raw) {
        return;
      }

      await writeFile(filePath, updated, "utf8");
    })
  );
};

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
