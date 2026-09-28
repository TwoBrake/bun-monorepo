// Resources
import type { JSX } from "react";
import { createFileRoute } from "@tanstack/react-router";

/** The page that is mounted at the root. */
const Home = (): JSX.Element => (
  <div className="p-2">
    <h3>This is the root route.</h3>
  </div>
);

/** The route for the file. */
export const Route = createFileRoute("/")({
  component: Home,
});
