// Resources
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// Components
import DefaultCatchBoundary from "./components/default-catch-boundary";
import NotFound from "./components/not-found";

// oxlint-disable-next-line typescript/explicit-module-boundary-types typescript/explicit-function-return-type
export const getRouter = () =>
  createRouter({
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
    defaultPreload: "intent",
    routeTree,
    scrollRestoration: true,
  });
