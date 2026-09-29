// Resources
import { configureServerLogger, createLogger } from "@repo/utility";

await configureServerLogger();

export const logger = createLogger("my-app");
