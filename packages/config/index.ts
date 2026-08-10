// Resources
import { createEnv } from "@t3-oss/env-core";
import z from "zod";

/** The repository's base configuration. */
const configuration = {
  port: 3000
};

/** The repository's environment variables. */
export const environment = createEnv({
  server: {
    DATABASE_URL: z.string()
  },

  clientPrefix: "PUBLIC_",

  client: {},

  runtimeEnv: process.env,

  emptyStringAsUndefined: true
});

export default configuration;
