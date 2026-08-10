// Resources
import z from "zod";

/** The schema for creating a user. */
export const CREATE_USER = z.object({
  name: z.string()
});
