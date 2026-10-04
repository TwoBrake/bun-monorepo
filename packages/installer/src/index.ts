// Resources
import { COMMAND_ARGUMENTS } from "./lib";

// Commands
import assetCreator from "./commands/asset-creator";
import initializer from "./commands/initializer";

const main = async (): Promise<void> => {
  const [command] = COMMAND_ARGUMENTS.positionals;

  switch (command) {
    case undefined: {
      await initializer();
      break;
    }
    case "asset": {
      await assetCreator();
      break;
    }
    default: {
      throw new Error("Invalid command");
    }
  }
};

await main();
