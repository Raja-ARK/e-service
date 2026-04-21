"use client";

import {
  Menu as MenuPrimitive,
  useMenu,
  useMenuContext,
  useMenuItemContext,
} from "@ark-ui/react/menu";
import { Portal } from "@ark-ui/react/portal";
import { cn } from "@e-service/ui/lib/utils";

export type MenuProps = MenuPrimitive.RootProps;

export const Menu = ({ positioning, ...props }: MenuProps) => (
  <MenuPrimitive.Root
    data-slot="menu"
    positioning={{ sizeMiddleware: false, ...positioning }}
    {...props}
  />
);

export type MenuTriggerProps = MenuPrimitive.TriggerProps;

export const MenuTrigger = ({ className, ...props }: MenuTriggerProps) => (
  <MenuPrimitive.Trigger
    className={cn(className)}
    data-slot="menu-trigger"
    {...props}
  />
);

export type MenuContextTriggerProps = MenuPrimitive.ContextTriggerProps;

export const MenuContextTrigger = ({
  className,
  ...props
}: MenuContextTriggerProps) => (
  <MenuPrimitive.ContextTrigger
    className={cn(className)}
    data-slot="menu-context-trigger"
    {...props}
  />
);

export type MenuPopupProps = MenuPrimitive.ContentProps & {
  arrowClassName?: string;
  arrowTipClassName?: string;
  disablePortal?: boolean;
  positionerClassName?: string;
  showArrow?: boolean;
};

export const MenuPopup = ({
  arrowClassName,
  arrowTipClassName,
  children,
  className,
  disablePortal,
  positionerClassName,
  showArrow = false,
  ...contentProps
}: MenuPopupProps) => {
  const inner = (
    <MenuPrimitive.Positioner
      className={cn(!disablePortal && "z-50", positionerClassName)}
      data-slot="menu-positioner"
    >
      <MenuPrimitive.Content
        className={cn(
          "relative z-[calc(50+var(--layer-index,0))] min-w-40 rounded-md border border-border/80 bg-popover p-1 text-popover-foreground shadow-md outline-none ring-1 ring-border/20",
          "transition-opacity duration-150 data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
          className,
        )}
        data-slot="menu-content"
        {...contentProps}
      >
        {children}
        {showArrow ? (
          <MenuPrimitive.Arrow
            className={cn(
              "[--arrow-background:var(--popover)] [--arrow-shadow-color:var(--border)] [--arrow-size:10px]",
              arrowClassName,
            )}
            data-slot="menu-arrow"
          >
            <MenuPrimitive.ArrowTip
              className={cn(
                "border-border border-t border-l",
                arrowTipClassName,
              )}
              data-slot="menu-arrow-tip"
            />
          </MenuPrimitive.Arrow>
        ) : null}
      </MenuPrimitive.Content>
    </MenuPrimitive.Positioner>
  );
  return disablePortal ? inner : <Portal>{inner}</Portal>;
};

export const MenuArrow = ({
  className,
  ...props
}: MenuPrimitive.ArrowProps) => (
  <MenuPrimitive.Arrow
    className={cn(
      "[--arrow-background:var(--popover)] [--arrow-shadow-color:var(--border)] [--arrow-size:10px]",
      className,
    )}
    data-slot="menu-arrow-raw"
    {...props}
  />
);

export const MenuArrowTip = ({
  className,
  ...props
}: MenuPrimitive.ArrowTipProps) => (
  <MenuPrimitive.ArrowTip
    className={cn("border-border border-t border-l", className)}
    data-slot="menu-arrow-tip-raw"
    {...props}
  />
);

export const MenuPositioner = ({
  className,
  ...props
}: MenuPrimitive.PositionerProps) => (
  <MenuPrimitive.Positioner
    className={cn(className)}
    data-slot="menu-positioner-raw"
    {...props}
  />
);

export const MenuContent = ({
  className,
  ...props
}: MenuPrimitive.ContentProps) => (
  <MenuPrimitive.Content
    className={cn(className)}
    data-slot="menu-content-raw"
    {...props}
  />
);

export type MenuItemProps = MenuPrimitive.ItemProps;

export const MenuItem = ({ className, ...props }: MenuItemProps) => (
  <MenuPrimitive.Item
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
      "data-disabled:pointer-events-none data-disabled:opacity-50",
      "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
      className,
    )}
    data-slot="menu-item"
    {...props}
  />
);

export type MenuItemContextProps = MenuPrimitive.ItemContextProps;

export const MenuItemContext = (props: MenuItemContextProps) => (
  <MenuPrimitive.ItemContext {...props} />
);

export type MenuItemTextProps = MenuPrimitive.ItemTextProps;

export const MenuItemText = ({ className, ...props }: MenuItemTextProps) => (
  <MenuPrimitive.ItemText
    className={cn("flex-1 truncate", className)}
    data-slot="menu-item-text"
    {...props}
  />
);

export type MenuItemIndicatorProps = MenuPrimitive.ItemIndicatorProps;

export const MenuItemIndicator = ({
  className,
  ...props
}: MenuItemIndicatorProps) => (
  <MenuPrimitive.ItemIndicator
    className={cn(
      "inline-flex size-4 shrink-0 items-center justify-center text-foreground",
      className,
    )}
    data-slot="menu-item-indicator"
    {...props}
  />
);

export type MenuCheckboxItemProps = MenuPrimitive.CheckboxItemProps;

export const MenuCheckboxItem = ({
  className,
  ...props
}: MenuCheckboxItemProps) => (
  <MenuPrimitive.CheckboxItem
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
      "data-disabled:pointer-events-none data-disabled:opacity-50",
      "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
      className,
    )}
    data-slot="menu-checkbox-item"
    {...props}
  />
);

export type MenuRadioItemGroupProps = MenuPrimitive.RadioItemGroupProps;

export const MenuRadioItemGroup = ({
  className,
  ...props
}: MenuRadioItemGroupProps) => (
  <MenuPrimitive.RadioItemGroup
    className={cn("flex flex-col gap-0.5", className)}
    data-slot="menu-radio-item-group"
    {...props}
  />
);

export type MenuRadioItemProps = MenuPrimitive.RadioItemProps;

export const MenuRadioItem = ({ className, ...props }: MenuRadioItemProps) => (
  <MenuPrimitive.RadioItem
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
      "data-disabled:pointer-events-none data-disabled:opacity-50",
      "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
      className,
    )}
    data-slot="menu-radio-item"
    {...props}
  />
);

export type MenuItemGroupProps = MenuPrimitive.ItemGroupProps;

export const MenuItemGroup = ({ className, ...props }: MenuItemGroupProps) => (
  <MenuPrimitive.ItemGroup
    className={cn("flex flex-col gap-0.5", className)}
    data-slot="menu-item-group"
    {...props}
  />
);

export type MenuItemGroupLabelProps = MenuPrimitive.ItemGroupLabelProps;

export const MenuItemGroupLabel = ({
  className,
  ...props
}: MenuItemGroupLabelProps) => (
  <MenuPrimitive.ItemGroupLabel
    className={cn(
      "px-2 py-1.5 font-medium text-muted-foreground text-xs",
      className,
    )}
    data-slot="menu-item-group-label"
    {...props}
  />
);

export type MenuSeparatorProps = MenuPrimitive.SeparatorProps;

export const MenuSeparator = ({ className, ...props }: MenuSeparatorProps) => (
  <MenuPrimitive.Separator
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    data-slot="menu-separator"
    {...props}
  />
);

export type MenuTriggerItemProps = MenuPrimitive.TriggerItemProps;

export const MenuTriggerItem = ({
  className,
  ...props
}: MenuTriggerItemProps) => (
  <MenuPrimitive.TriggerItem
    className={cn(
      "relative flex cursor-pointer select-none items-center justify-between gap-2 rounded-sm py-1.5 pr-1.5 pl-2 text-sm outline-none transition-colors",
      "data-disabled:pointer-events-none data-disabled:opacity-50",
      "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
      className,
    )}
    data-slot="menu-trigger-item"
    {...props}
  />
);

export type MenuIndicatorProps = MenuPrimitive.IndicatorProps;

export const MenuIndicator = ({ className, ...props }: MenuIndicatorProps) => (
  <MenuPrimitive.Indicator
    className={cn(className)}
    data-slot="menu-indicator"
    {...props}
  />
);

export type MenuContextProps = MenuPrimitive.ContextProps;

export const MenuContext = (props: MenuContextProps) => (
  <MenuPrimitive.Context {...props} />
);

export type MenuRootProviderProps = MenuPrimitive.RootProviderProps;

export const MenuRootProvider = (props: MenuRootProviderProps) => (
  <MenuPrimitive.RootProvider data-slot="menu-root-provider" {...props} />
);

export { useMenu, useMenuContext, useMenuItemContext };
