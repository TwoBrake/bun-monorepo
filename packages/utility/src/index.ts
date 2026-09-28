// Resources
import { type Logger, type LoggerConfig, configure, getConsoleSink, getLogger } from "@logtape/logtape";
import configuration from "@repo/config";

/* Configure LogTape globally across the application. */
await configure({
  loggers: [
    ...configuration.logScopes.map(
      scope =>
        ({
          category: [scope],
          lowestLevel: "debug",
          sinks: ["console"]
        }) satisfies LoggerConfig<string, string>
    ),
    {
      category: ["logtape", "meta"],
      lowestLevel: "warning",
      sinks: ["console"]
    }
  ],
  sinks: {
    console: getConsoleSink()
  }
});

/**
 * Constructs a new logger instance.
 *
 * @param category The logger category to use.
 *
 * @returns The logger instance.
 */
export const createLogger = (category: (typeof configuration)["logScopes"][number]): Logger => getLogger(category);

/* Export internal data. */
export * from "./errors";
export type * from "./types";
