// Resources
import "dotenv/config";
import configuration from "@repo/config";
import { logger } from "./lib/utility";

logger.info("Hello world!");
logger.info(configuration);
