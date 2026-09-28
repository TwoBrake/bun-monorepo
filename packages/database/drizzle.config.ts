// Resources
import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { environment } from "@repo/config";

/* Define the configuration for the ORM. */
const configuration = defineConfig({
  dbCredentials: {
    url: environment.DATABASE_URL
  },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./schema.ts"
});

export default configuration;
