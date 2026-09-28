// Resources
import "dotenv/config";
import configuration from "@repo/config";
import { logger } from "@repo/utility";

logger.info("Hello world!");
logger.info(configuration);
