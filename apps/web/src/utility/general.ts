// Resources
import { createLogger } from "@repo/utility";
import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Formats Tailwind class names from an array format.
 *
 * @param inputs The class names to combine.
 *
 * @returns The combined lass names.
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

/** The base logger for the website application. */
export const logger = createLogger("web");
