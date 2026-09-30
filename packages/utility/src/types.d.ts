// Resources
import type { ReactNode } from "react";

/** The structure of a components children. */
export type Children<TType = ReactNode, TOptional extends boolean = false> = TOptional extends true
  ? {
      children?: TType;
    }
  : {
      children: TType;
    };
