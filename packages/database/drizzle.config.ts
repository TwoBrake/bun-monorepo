// Resources
import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { environment } from "@repo/config";

/* Define the configuration for the ORM. */
export default defineConfig({
  out: "./drizzle",
  schema: "./schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: environment.DATABASE_URL
  }
});
