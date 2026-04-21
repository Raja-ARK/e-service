/** biome-ignore-all lint/a11y/noLabelWithoutControl: Suppressing this rule for the label component */

"use client";

import { ark } from "@ark-ui/react/factory";
import { cn } from "@e-service/ui/lib/utils";
import type { ComponentProps } from "react";

export const Label = ({
  className,
  ...props
}: ComponentProps<typeof ark.label>) => {
  return (
    <ark.label
      className={cn(
        "inline-flex items-center gap-2 font-medium text-base/4.5 text-foreground sm:text-sm/4",
        className,
      )}
      {...props}
    />
  );
};
