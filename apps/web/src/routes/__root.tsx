/// <reference types="vite/client" />
// Resources
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import React, { type JSX } from "react";
import appCss from "@/styles/app.css?url";
import { seo } from "@/utility/seo";
import type { Children } from "@repo/utility";

// Components
import DefaultCatchBoundary from "@/components/default-catch-boundary";
import NotFound from "@/components/not-found";

// oxlint-disable-next-line react/only-export-components
/** The root document to render content inside. */
const RootDocument = ({ children }: Children): JSX.Element => (
  <html>
    <head>
      <HeadContent />
    </head>
    <body>
      {children}
      <TanStackRouterDevtools position={"bottom-right"} />
      <Scripts />
    </body>
  </html>
);

/** The root route of teh application. */
export const Route = createRootRoute({
  errorComponent: DefaultCatchBoundary,
  head: () => ({
    links: [
      { href: appCss, rel: "stylesheet" },
      {
        href: "/apple-touch-icon.png",
        rel: "apple-touch-icon",
        sizes: "180x180",
      },
      {
        href: "/favicon-32x32.png",
        rel: "icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        href: "/favicon-16x16.png",
        rel: "icon",
        sizes: "16x16",
        type: "image/png",
      },
      { color: "#fffff", href: "/site.webmanifest", rel: "manifest" },
      { href: "/favicon.ico", rel: "icon" },
    ],
    meta: [
      {
        charSet: "utf8",
      },
      {
        content: "width=device-width, initial-scale=1",
        name: "viewport",
      },
      ...seo({
        description: `A simple monorepo template built on the Bun ecosystem.`,
        title: "Bun Monorepo",
      }),
    ],
  }),
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
});
