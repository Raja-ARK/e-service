import type { PgColumn } from "@e-service/db/drizzle-core";
import { asc, desc, type SQL } from "@e-service/db/drizzle-orm";

export type SortDirection = "asc" | "desc";

export type SortSpec<F extends string = string> = {
  field: F;
  direction: SortDirection;
};

/** Builds Drizzle `orderBy` clauses from validated sort specs; ignores unknown fields. */
export function buildOrderBy<
  R extends Record<string, PgColumn>,
  F extends keyof R & string,
>(
  row: R,
  sort: SortSpec<F>[] | undefined,
  allowedFields: readonly F[],
  defaultSort: SortSpec<F>,
): SQL[] {
  const sanitized =
    sort?.filter((item) => allowedFields.includes(item.field)) ?? [];

  const specs = sanitized.length > 0 ? sanitized : [defaultSort];

  const clauses: SQL[] = [];
  for (const { field, direction } of specs) {
    const column = row[field];
    if (column === undefined) continue;
    clauses.push(direction === "desc" ? desc(column) : asc(column));
  }

  const fallbackCol = row[defaultSort.field];
  if (!fallbackCol) {
    throw new Error(
      `buildOrderBy: unknown default sort field "${String(defaultSort.field)}"`,
    );
  }

  return clauses.length > 0 ? clauses : [asc(fallbackCol)];
}
