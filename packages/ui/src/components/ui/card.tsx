"use client";

import { ark } from "@ark-ui/react/factory";
import type { ComponentProps } from "react";

import { cn } from "../../lib/utils";

export const Card = ({
  className,
  ...props
}: ComponentProps<typeof ark.div>) => {
  return (
    <ark.div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card not-dark:bg-clip-padding text-card-foreground shadow-xs/5 before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
        className,
      )}
      data-slot={"card"}
      {...props}
    />
  );
};

export const CardFrame = ({
  className,
  ...props
}: ComponentProps<typeof ark.div>) => {
  return (
    <ark.div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card not-dark:bg-clip-padding text-card-foreground shadow-xs/5 [--clip-bottom:-1rem] [--clip-top:-1rem] before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:bg-muted/72 before:shadow-[0_1px_--theme(--color-black/4%)] has-data-[slot=table-container]:overflow-hidden *:data-[slot=card]:-m-px *:data-[slot=table-container]:-m-px *:data-[slot=table-container]:w-[calc(100%+2px)] *:not-first:data-[slot=card]:rounded-t-xl *:not-last:data-[slot=card]:rounded-b-xl *:data-[slot=card]:bg-clip-padding *:data-[slot=card]:shadow-none *:data-[slot=card]:before:hidden *:not-first:data-[slot=card]:before:rounded-t-[calc(var(--radius-xl)-1px)] *:not-last:data-[slot=card]:before:rounded-b-[calc(var(--radius-xl)-1px)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)] *:data-[slot=card]:[clip-path:inset(var(--clip-top)_1px_var(--clip-bottom)_1px_round_calc(var(--radius-2xl)-1px))] *:data-[slot=card]:last:[--clip-bottom:1px] *:data-[slot=card]:first:[--clip-top:1px]",
        className,
      )}
      data-slot={"card-frame"}
      {...props}
    />
  );
};

export const CardFrameHeader = ({
  className,
  ...props
}: ComponentProps<typeof ark.div>) => {
  return (
    <ark.div
      className={cn(
        "relative grid auto-rows-min grid-rows-[auto_auto] flex-col items-start gap-x-4 px-6 py-4 has-data-[slot=card-frame-action]:grid-cols-[1fr_auto]",
        className,
      )}
      data-slot={"card-frame-header"}
      {...props}
    />
  );
};

export const CardFrameTitle = ({
  className,
  ...props
}: ComponentProps<typeof ark.div>) => {
  return (
    <ark.div
      className={cn("self-center font-semibold text-sm", className)}
      data-slot={"card-frame-title"}
      {...props}
    />
  );
};

export const CardFrameDescription = ({
  className,
  ...props
}: ComponentProps<typeof ark.div>) => {
  return (
    <ark.div
      className={cn("self-center text-muted-foreground text-sm", className)}
      data-slot={"card-frame-description"}
      {...props}
    />
  );
};

export const CardFrameAction = ({
  className,
  ...props
}: ComponentProps<typeof ark.div>) => {
  return (
    <ark.div
      className={cn(
        "col-start-2 nth-3:row-span-2 nth-3:row-start-1 inline-flex self-center justify-self-end",
        className,
      )}
      data-slot={"card-frame-action"}
      {...props}
    />
  );
};

export const CardFrameFooter = ({
  className,
  ...props
}: ComponentProps<typeof ark.div>) => {
  return (
    <ark.div
      className={cn("px-6 py-4", className)}
      data-slot={"card-frame-footer"}
      {...props}
    />
  );
};

export const CardHeader = ({
  className,
  ...props
}: ComponentProps<typeof ark.div>) => {
  return (
    <ark.div
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 p-6 in-[[data-slot=card]:has(>[data-slot=card-panel])]:pb-4 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className,
      )}
      data-slot={"card-header"}
      {...props}
    />
  );
};

export const CardTitle = ({
  className,
  ...props
}: ComponentProps<typeof ark.div>) => {
  return (
    <ark.div
      className={cn("font-semibold text-lg leading-none", className)}
      data-slot={"card-title"}
      {...props}
    />
  );
};

export const CardDescription = ({
  className,
  ...props
}: ComponentProps<typeof ark.div>) => {
  return (
    <ark.div
      className={cn("text-muted-foreground text-sm", className)}
      data-slot={"card-description"}
      {...props}
    />
  );
};

export const CardAction = ({
  className,
  ...props
}: ComponentProps<typeof ark.div>) => {
  return (
    <ark.div
      className={cn(
        "col-start-2 row-span-2 row-start-1 inline-flex self-start justify-self-end",
        className,
      )}
      data-slot={"card-action"}
      {...props}
    />
  );
};

export const CardPanel = ({
  className,
  ...props
}: ComponentProps<typeof ark.div>) => {
  return (
    <ark.div
      className={cn(
        "flex-1 p-6 in-[[data-slot=card]:has(>[data-slot=card-header]:not(.border-b))]:pt-0 in-[[data-slot=card]:has(>[data-slot=card-footer]:not(.border-t))]:pb-0",
        className,
      )}
      data-slot={"card-panel"}
      {...props}
    />
  );
};

export const CardFooter = ({
  className,
  ...props
}: ComponentProps<typeof ark.div>) => {
  return (
    <ark.div
      className={cn(
        "flex items-center p-6 in-[[data-slot=card]:has(>[data-slot=card-panel])]:pt-4",
        className,
      )}
      data-slot={"card-footer"}
      {...props}
    />
  );
};

export { CardPanel as CardContent };
