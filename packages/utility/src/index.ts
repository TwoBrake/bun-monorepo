// Resources
import {
  type Logger,
  type LoggerConfig,
  ansiColorFormatter,
  configure,
  getConsoleSink,
  getLogger
} from "@logtape/logtape";
import configuration, { environment } from "@repo/config";

/** Configure LogTape globally across the application. */
export const configureServerLogger = async (): Promise<void> => {
  await configure({
    loggers: [
      ...configuration.logScopes.map(
        scope =>
          ({
            category: [scope],
            lowestLevel: environment.NODE_ENV === "production" ? "info" : "debug",
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
      console: getConsoleSink({
        formatter: ansiColorFormatter
      })
    }
  });
};

/**
 * Constructs a new logger instance.
 *
 * @param category The logger category to use.
 *
 * @returns The logger instance.
 */
export const createLogger = (category: (typeof configuration)["logScopes"][number]): Logger => getLogger(category);

/* Export internal data. */
export type * from "./types";
