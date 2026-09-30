// Resources
import {
  Button as HeadlessButton,
  type ButtonProps as HeadlessButtonProps,
} from "@headlessui/react";
import type { ElementType, JSX } from "react";
import { cn } from "@/utility/general";
import type { ClassName } from "@repo/utility";

/** The properties of a button. */
export type ButtonProps<TTag extends ElementType = "button"> = HeadlessButtonProps<TTag> &
  ClassName & {
    variant?: "primary" | "secondary";
  };

/** A general button. */
const Button = <TTag extends ElementType = "button">({
  className,
  ...props
}: ButtonProps<TTag>): JSX.Element => (
  <HeadlessButton
    {...props}
    className={cn(
      "dark:bg-white dark:text-black rounded-sm px-2 py-1 transition-all hover:scale-105 active:scale-95",
      String(className),
    )}
  />
);

export default Button;
