// Resources
import { type JSX, useCallback, type MouseEventHandler } from "react";
import {
  ErrorComponent,
  type ErrorComponentProps,
  Link,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import { logger } from "../utility/general.ts";

const DefaultCatchBoundary = ({ error }: ErrorComponentProps): JSX.Element => {
  const router = useRouter();
  const isRoot = useLocation({
    select: (location) => location.pathname === "/",
  });

  logger.error(`DefaultCatchBoundary Error: ${String(error)}`);

  const handleRetry = useCallback(() => {
    void router.invalidate();
  }, [router]);

  const handleGoBack = useCallback<MouseEventHandler<HTMLAnchorElement>>((event) => {
    event.preventDefault();
    window.history.back();
  }, []);

  return (
    <div className={"min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6"}>
      <ErrorComponent error={error} />
      <div className={"flex gap-2 items-center flex-wrap"}>
        <button
          type={"button"}
          onClick={handleRetry}
          className={`px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold`}
        >
          {"Try Again"}
        </button>
        {isRoot ? (
          <Link
            to={"/"}
            className={`px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold`}
          >
            {"Home"}
          </Link>
        ) : (
          <Link
            to={"/"}
            className={`px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold`}
            onClick={handleGoBack}
          >
            {"Go Back"}
          </Link>
        )}
      </div>
    </div>
  );
};

export default DefaultCatchBoundary;
