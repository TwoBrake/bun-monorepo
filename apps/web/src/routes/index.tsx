// Resources
import type { JSX } from "react";
import { createFileRoute } from "@tanstack/react-router";

// Components
import Button from "@/components/ui/button";

/** The page that is mounted at the root. */
const Home = (): JSX.Element => (
  <div className={"w-full h-screen mx-auto flex justify-center items-center"}>
    <Button as={"a"} href={"https://github.com/twobrake/bun-monorepo"} target={"_blank"}>
      {"View GitHub"}
    </Button>
  </div>
);

/** The route for the file. */
export const Route = createFileRoute("/")({
  component: Home,
});
