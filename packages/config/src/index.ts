// Resources
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/** The repository's base configuration. */
const configuration = {
  logScopes: ["my-app", "web"],
  port: 3000
} as const;

/** The repository's environment variables. */
export const environment = createEnv({
  client: {},

  clientPrefix: "PUBLIC_",

  emptyStringAsUndefined: true,

  runtimeEnv: process.env,

  server: {
    DATABASE_URL: z.string(),
    FORCE_COLOR: z.number().optional().default(1),
    NODE_ENV: z.enum(["production", "development"]).optional().default("development")
  }
});

export default configuration;
