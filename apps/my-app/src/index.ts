// Resources
import "dotenv/config";
import { logger } from "@repo/utility";
import configuration from "@repo/config";

logger.info("Hello world!");
logger.info(configuration);
