// Resources
import { createPrompt, createTitle } from "./lib";
import { intro, log, path } from "@clack/prompts";
import type { Dirent } from "node:fs";
import { InternalError } from "@repo/utility/errors";
import { readdir } from "node:fs/promises";

const assetCreator = async (): Promise<void> => {
  try {
    intro(createTitle("Asset Creator"));

    const projectPath = await createPrompt(async () =>
      path({ directory: true, message: "Where is your current project at?" })
    );

    const projectRootRawContents = await readdir(projectPath, { withFileTypes: true });
    const projectRootContents = new Set<string>(projectRootRawContents.map((file: Readonly<Dirent>) => file.name));

    log.warn(JSON.stringify(projectRootContents.entries()));

    if (!projectRootContents.has("apps") || !projectRootContents.has("packages")) {
      throw new InternalError("This is not a monorepo.");
    }
  } catch {
    log.error("whoops!");
  }
};

await assetCreator();
