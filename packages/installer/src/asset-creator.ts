// Resources
import { createPrompt, createReadableZodError, createTitle } from "./lib";
import { intro, log, outro, path, select, text } from "@clack/prompts";
import type { Dirent } from "node:fs";
import { InternalError } from "@repo/utility/errors";
import { readdir } from "node:fs/promises";
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

    log.info(assetName);

    outro(`Successfully created new ${assetType}.`);
  } catch {
    log.error("whoops!");
  }
};

await assetCreator();
