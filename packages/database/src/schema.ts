// Resources
import { integer } from "drizzle-orm/pg-core/columns";
import { pgTable } from "drizzle-orm/pg-core/table";

/** The users table in the database. */
export const users = pgTable("users", {
  id: integer("user_id").primaryKey().generatedAlwaysAsIdentity()
});
