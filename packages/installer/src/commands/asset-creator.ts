// Resources
import { createPrompt, createReadableError, createReadableZodError, createTitle } from "../lib";
import { intro, log, outro, path, select, tasks, text } from "@clack/prompts";
import type { Dirent } from "node:fs";
// oxlint-disable-next-line sort-imports
import { cp, readdir } from "node:fs/promises";
import { InternalError } from "@repo/utility/errors";
import { z } from "zod";

/** The asset creator  */
const assetCreator = async (): Promise<void> => {
  try {
    intro(createTitle("Asset Creator"));
    log.message("A helper for creating new assets under an already constructed Bun monorepo setup.");

    /** The path of the Bun monorepo. */
    const projectPath = await createPrompt(async () =>
      path({ directory: true, message: "Where is your current project at?" })
    );

    const projectRootRawContents = await readdir(projectPath, { withFileTypes: true });
    const projectRootContents = new Set<string>(projectRootRawContents.map((file: Readonly<Dirent>) => file.name));

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

    await tasks([
      {
        task: async (): Promise<void> => {
          const clonedPath = `${projectPath}/packages/${assetName}`;
          await cp(`${projectPath}/packages/config`, clonedPath);

          const clonedDirectory = await readdir(clonedPath, { withFileTypes: true });
          const clonedDirectoryContents = clonedDirectory.map((file: Readonly<Dirent>) => file.name);

          log.info(clonedDirectoryContents.join(", "));
        },
        title: "Clone configuration package template."
      }
    ]);

    log.info(assetName);

    outro(`Successfully created new ${assetType}.`);
  } catch (error) {
    log.error(createReadableError(error));
    process.exitCode = 1;
  }
};

export default assetCreator;
