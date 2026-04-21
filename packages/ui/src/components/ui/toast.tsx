"use client";

import { Portal } from "@ark-ui/react/portal";
import {
  createToaster,
  Toaster,
  Toast as ToastPrimitive,
} from "@ark-ui/react/toast";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  LoaderIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export type ToastProps = ToastPrimitive.RootProps;
export type ToastTitleProps = ToastPrimitive.TitleProps;
export type ToastDescriptionProps = ToastPrimitive.DescriptionProps;
export type ToastActionTriggerProps = ToastPrimitive.ActionTriggerProps;
export type ToastCloseTriggerProps = ToastPrimitive.CloseTriggerProps;
export type ToastProviderProps = Omit<
  ComponentProps<typeof Toaster>,
  "toaster" | "children"
>;
export type AnchoredToastProviderProps = Omit<
  ComponentProps<typeof Toaster>,
  "toaster" | "children"
>;

const ICON_MAP = {
  success: CircleCheckIcon,
  error: CircleAlertIcon,
  warning: TriangleAlertIcon,
  info: InfoIcon,
  loading: LoaderIcon,
} as const;

const isToastIconType = (type: string): type is keyof typeof ICON_MAP => {
  return type in ICON_MAP;
};

const ICON_COLOR_MAP: Record<string, string> = {
  success: "text-success-foreground",
  error: "text-destructive",
  warning: "text-warning-foreground",
  info: "text-info-foreground",
  loading: "text-muted-foreground",
};

export const ToastRoot = ({ className, ...props }: ToastProps) => (
  <ToastPrimitive.Root
    className={cn(
      "group pointer-events-auto relative flex w-full flex-col gap-1 overflow-hidden rounded-lg border border-border/80 bg-popover p-4 pe-10 text-popover-foreground shadow-lg",
      "data-[placement=bottom]:mx-auto data-[placement=top]:mx-auto",
      "data-[placement=bottom]:w-fit data-[placement=top]:w-fit",
      "data-[placement=bottom]:max-w-[min(26rem,calc(100vw-2rem))] data-[placement=top]:max-w-[min(26rem,calc(100vw-2rem))]",
      "will-change-transform",
      "data-[state=open]:fade-in data-[state=open]:animate-in data-[state=open]:duration-300 data-[state=open]:ease-out",
      "data-[state=closed]:fade-out data-[state=closed]:animate-out data-[state=closed]:duration-250 data-[state=closed]:ease-in",
      "data-[placement^=top]:data-[state=open]:slide-in-from-top-2 data-[placement^=bottom]:data-[state=open]:slide-in-from-bottom-2",
      "data-[placement^=top]:data-[state=closed]:slide-out-to-top-2 data-[placement^=bottom]:data-[state=closed]:slide-out-to-bottom-2",
      className,
    )}
    data-slot="toast"
    {...props}
  />
);

export const ToastTitle = ({ className, ...props }: ToastTitleProps) => (
  <ToastPrimitive.Title
    className={cn("flex items-center gap-2 font-semibold text-sm", className)}
    data-slot="toast-title"
    {...props}
  />
);

export const ToastDescription = ({
  className,
  ...props
}: ToastDescriptionProps) => (
  <ToastPrimitive.Description
    className={cn("text-muted-foreground text-sm", className)}
    data-slot="toast-description"
    {...props}
  />
);

export const ToastActionTrigger = ({
  className,
  ...props
}: ToastActionTriggerProps) => (
  <ToastPrimitive.ActionTrigger
    className={cn(
      "mt-1 inline-flex h-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border/80 bg-transparent px-3 font-medium text-xs transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    data-slot="toast-action"
    {...props}
  />
);

export const ToastCloseTrigger = ({
  className,
  ...props
}: ToastCloseTriggerProps) => (
  <ToastPrimitive.CloseTrigger
    className={cn(
      "absolute top-2 right-2 cursor-pointer rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring group-hover:opacity-100",
      className,
    )}
    data-slot="toast-close"
    {...props}
  >
    <XIcon className="size-4" />
  </ToastPrimitive.CloseTrigger>
);

export const ToastIndicator = ({
  type,
  className,
}: {
  type?: string;
  className?: string;
}) => {
  if (!type || !isToastIconType(type)) return null;
  const Icon = ICON_MAP[type];
  return (
    <Icon
      className={cn(
        "size-4 shrink-0",
        ICON_COLOR_MAP[type] ?? "text-muted-foreground",
        type === "loading" && "animate-spin",
        className,
      )}
    />
  );
};

export const toaster = createToaster({
  placement: "bottom-end",
  overlap: true,
  gap: 16,
  max: 5,
});
type ToasterProps = Omit<
  ComponentProps<typeof Toaster>,
  "toaster" | "children"
>;

export const ToastProvider = ({ className, ...props }: ToasterProps) => (
  <Portal>
    <Toaster
      toaster={toaster}
      className={cn(
        "fixed! z-100 flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-105",
        className,
      )}
      data-slot="toast-provider"
      {...props}
    >
      {(toast) => (
        <ToastRoot key={toast.id}>
          <ToastTitle>
            <ToastIndicator type={toast.type} />
            {toast.title}
          </ToastTitle>
          {toast.description && (
            <ToastDescription>{toast.description}</ToastDescription>
          )}
          {toast.action && (
            <ToastActionTrigger>{toast.action.label}</ToastActionTrigger>
          )}
          <ToastCloseTrigger />
        </ToastRoot>
      )}
    </Toaster>
  </Portal>
);

export const ToastContext = ToastPrimitive.Context;

export { createToaster, Toaster } from "@ark-ui/react/toast";
