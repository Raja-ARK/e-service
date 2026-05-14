import type { PgColumn } from "@e-service/db/drizzle-core";
import type { SQL } from "@e-service/db/drizzle-orm";
import {
  between,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  ne,
  not,
} from "@e-service/db/drizzle-orm";

export type FilterOperator =
  | "equals"
  | "notEquals"
  | "greater"
  | "greaterOrEquals"
  | "less"
  | "lessOrEquals"
  | "like"
  | "ilike"
  | "notLike"
  | "in"
  | "isNull"
  | "isNotNull"
  | "between"
  | "notBetween";

/** Value shape for `between` / `notBetween` (matches `filterDateRangeSchema`). */
export type DateRangeFilterValue = {
  from: string | number | Date;
  to: string | number | Date;
};

export type FilterCondition = {
  operator: FilterOperator;
  value?:
    | string
    | number
    | boolean
    | Date
    | (string | number | Date)[]
    | DateRangeFilterValue;
};

function parseBoundary(value: unknown): Date | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return undefined;
}

function isDateRangeValue(value: unknown): value is DateRangeFilterValue {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  return (
    "from" in value &&
    "to" in value &&
    typeof (value as DateRangeFilterValue).from !== "undefined" &&
    typeof (value as DateRangeFilterValue).to !== "undefined"
  );
}

export const buildWhereClause = (
  column: PgColumn,
  filterValue:
    | string
    | number
    | boolean
    | Date
    | FilterCondition
    | null
    | undefined,
): SQL | undefined => {
  if (filterValue === undefined || filterValue === null) return undefined;

  // Plain Date / ISO-coerced dates → equality on the column (e.g. announcement timestamp filters).
  if (filterValue instanceof Date && !Number.isNaN(filterValue.getTime())) {
    return eq(column, filterValue);
  }

  // If it's a simple value (backward compatibility), default to equals for exact matches or like for strings
  if (
    typeof filterValue === "string" ||
    typeof filterValue === "number" ||
    typeof filterValue === "boolean"
  ) {
    // For string fields, default to like for backward compatibility
    if (typeof filterValue === "string") {
      return like(column, `%${filterValue}%`);
    }
    // For boolean and enum, use equals
    return eq(column, filterValue);
  }

  // If it's a filter condition object
  const condition = filterValue as FilterCondition;
  const { operator, value } = condition;

  switch (operator) {
    case "equals":
      return value !== undefined ? eq(column, value) : undefined;
    case "notEquals":
      return value !== undefined ? ne(column, value) : undefined;
    case "greater":
      return value !== undefined ? gt(column, value) : undefined;
    case "greaterOrEquals":
      return value !== undefined ? gte(column, value) : undefined;
    case "less":
      return value !== undefined ? lt(column, value) : undefined;
    case "lessOrEquals":
      return value !== undefined ? lte(column, value) : undefined;
    case "between": {
      if (!isDateRangeValue(value)) return undefined;
      const start = parseBoundary(value.from);
      const end = parseBoundary(value.to);
      if (!start || !end) return undefined;
      return between(column, start, end);
    }
    case "notBetween": {
      if (!isDateRangeValue(value)) return undefined;
      const start = parseBoundary(value.from);
      const end = parseBoundary(value.to);
      if (!start || !end) return undefined;
      return not(between(column, start, end));
    }
    case "like":
      return typeof value === "string" ? like(column, `%${value}%`) : undefined;
    case "ilike":
      return typeof value === "string"
        ? ilike(column, `%${value}%`)
        : undefined;
    case "notLike":
      return typeof value === "string"
        ? not(like(column, `%${value}%`))
        : undefined;
    case "in":
      return Array.isArray(value) && value.length > 0
        ? inArray(column, value)
        : undefined;
    case "isNull":
      return isNull(column);
    case "isNotNull":
      return isNotNull(column);
    default:
      return undefined;
  }
};

/** Keys allowed in a Drizzle relational `columns` mask (`{ id: true, name: true, … }`). */
export type RelationalColumnsMask<Key extends string> = Partial<
  Record<Key, true>
>;

/**
 * Drizzle relational `findFirst`/`findMany` return all columns when `columns` is omitted.
 * When the client sends `select`, only keys set to boolean `true` are included — same object shape as Drizzle expects.
 */
export function buildColumnsMask<Key extends string>(
  select: Partial<Record<Key, boolean | undefined>> | undefined,
  allowedKeys: readonly Key[],
): RelationalColumnsMask<Key> | undefined {
  if (select === undefined) return undefined;

  const mask = {} as RelationalColumnsMask<Key>;
  let hasSelection = false;
  for (const key of allowedKeys) {
    if (select[key] === true) {
      mask[key] = true;
      hasSelection = true;
    }
  }

  return hasSelection ? mask : undefined;
}

export const buildWithDefaultColumns = <Key extends string>(
  allowedKeys: readonly Key[],
) => {
  return allowedKeys.reduce(
    (acc, key) => {
      acc[key] = true;
      return acc;
    },
    {} as Record<Key, true>,
  );
};

export const returnDefaultColumns = <
  Key extends string,
  T extends Record<Key, unknown>,
>(
  allowedKeys: readonly Key[],
  obj: T,
) => {
  const result = {} as Pick<T, Key>;
  for (const key of allowedKeys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
};
