import type { PgColumn } from "@e-service/db/drizzle-core";
import type { SQL } from "@e-service/db/drizzle-orm";
import {
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
  | "isNotNull";

export type FilterCondition = {
  operator: FilterOperator;
  value?: string | number | boolean | (string | number)[];
};

export const buildWhereClause = (
  column: PgColumn,
  filterValue: string | number | boolean | FilterCondition | null | undefined,
): SQL | undefined => {
  if (typeof filterValue === "undefined") return undefined;

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
