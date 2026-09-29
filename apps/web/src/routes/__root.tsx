/// <reference types="vite/client" />
// Resources
import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { JSX, ReactNode } from "react";
import appCss from "~/styles/app.css?url";
import { seo } from "@/utility/seo";

// Components
import DefaultCatchBoundary from "@/components/default-catch-boundary";
import NotFound from "@/components/not-found";

const RootDocument = ({ children }: { children: ReactNode }): JSX.Element => (
  <html>
    <head>
      <HeadContent />
    </head>
    <body>
      <div className="p-2 flex gap-2 text-lg">
        <Link
          to="/"
          activeProps={{
            className: "font-bold",
          }}
          activeOptions={{ exact: true }}>
          Home
        </Link>
      </div>
      <hr />
      {children}
      <TanStackRouterDevtools position="bottom-right" />
      <Scripts />
    </body>
  </html>
);

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
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
        title:
          "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
      }),
    ],
  }),
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
});
