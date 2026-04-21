"use client";

import { Checkbox as CheckboxPrimitive } from "@ark-ui/react/checkbox";
import { cn } from "@e-service/ui/lib/utils";
import { CheckIcon, MinusIcon } from "lucide-react";

export const CheckboxRoot = ({
  children,
  className,
  ...props
}: CheckboxPrimitive.RootProps) => {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      {...props}
      className={cn("flex items-center gap-2", className)}
    >
      {children}
      <CheckboxPrimitive.HiddenInput />
    </CheckboxPrimitive.Root>
  );
};
export const Checkbox = ({
  className,
  ...props
}: CheckboxPrimitive.ControlProps) => {
  return (
    <CheckboxPrimitive.Control
      className={cn(
        "peer relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded border border-input outline-none transition-colors after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 group-has-disabled/field:opacity-50 data-invalid:data-[state='checked']:border-primary data-[state='checked']:border-primary data-invalid:border-destructive data-[state='checked']:bg-primary data-[state='checked']:text-primary-foreground data-invalid:ring-3 data-invalid:ring-destructive/20 dark:bg-input/30 dark:data-invalid:border-destructive/50 dark:data-[state='checked']:bg-primary dark:data-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Context>
        {({ checked, indeterminate }) => {
          return (
            <CheckboxPrimitive.Indicator
              data-slot="checkbox-indicator"
              className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
              indeterminate={indeterminate}
            >
              {checked ? <CheckIcon /> : indeterminate ? <MinusIcon /> : null}
            </CheckboxPrimitive.Indicator>
          );
        }}
      </CheckboxPrimitive.Context>
    </CheckboxPrimitive.Control>
  );
};

export const CheckboxLabel = ({
  className,
  ...props
}: CheckboxPrimitive.LabelProps) => (
  <CheckboxPrimitive.Label
    data-slot="checkbox-label"
    className={cn(
      "select-none font-medium text-foreground text-sm data-invalid:text-destructive data-disabled:opacity-50",
      className,
    )}
    {...props}
  />
);

export const CheckboxGroup = ({
  className,
  ...props
}: CheckboxPrimitive.GroupProps) => {
  return <CheckboxPrimitive.Group className={cn(className)} {...props} />;
};

export const CheckboxContext = CheckboxPrimitive.Context;
