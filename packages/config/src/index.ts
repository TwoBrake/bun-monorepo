// Resources
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/** The repository's base configuration. */
const configuration = {
  port: 3000
} as const;

/** The repository's environment variables. */
export const environment = createEnv({
  client: {},

  clientPrefix: "PUBLIC_",

  emptyStringAsUndefined: true,

  runtimeEnv: process.env,

  server: {
    DATABASE_URL: z.string()
  }
});

export default configuration;
