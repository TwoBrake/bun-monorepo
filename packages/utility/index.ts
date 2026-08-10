// Resources
import { createConsola } from "consola";

/** Primary logging instance for the repository. */
export const logger = createConsola({});

/* Export internal data. */
export * from "./errors";
export * from "./types";
