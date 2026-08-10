// Resources
import { drizzle } from "drizzle-orm/node-postgres";
import { environment } from "@repo/config";

/** The primary database of the repository. */
const database = drizzle(environment.DATABASE_URL);

export default database;
