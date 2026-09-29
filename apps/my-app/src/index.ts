// Resources
import "dotenv/config";
import configuration from "@repo/config";
import { logger } from "./lib/utility";

logger.info("Hello world!");
logger.info(configuration);
logger.info(`Server will start on port {port}.`, { port: configuration.port });
