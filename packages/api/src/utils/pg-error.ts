/**
 * Class 23 — Integrity Constraint Violation (subset).
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export const PostgreSqlErrorCode = {
  UNIQUE_VIOLATION: "23505",
  // FOREIGN_KEY_VIOLATION: "23503",
  // CHECK_VIOLATION: "23514",
  // NOT_NULL_VIOLATION: "23502",
} as const;

/** Extend with more booleans when you handle additional Postgres constraint codes. */
export type ConstraintViolationFlags = {
  /** Unique or exclusion constraint (`23505`). */
  isUniqueConstraintViolation: boolean;
};

/** Postgres driver error codes on `error.code` or nested under DrizzleQueryError `.cause`. */
export function getPostgresErrorCode(error: unknown): string | undefined {
  let current: unknown = error;
  const seen = new Set<object>();

  while (typeof current === "object" && current !== null) {
    if (seen.has(current)) return undefined;
    seen.add(current);
    const code = (current as { code?: unknown }).code;
    if (typeof code === "string") return code;
    current = (current as { cause?: unknown }).cause;
  }

  return undefined;
}

/**
 * Maps a caught DB error (e.g. DrizzleQueryError) to constraint-violation flags.
 * Extend `ConstraintViolationFlags` and this return object when new codes are handled.
 */
export function isConstrainViolation(error: unknown): ConstraintViolationFlags {
  const code =
    error === undefined || error === null
      ? undefined
      : getPostgresErrorCode(error);

  return {
    isUniqueConstraintViolation: code === PostgreSqlErrorCode.UNIQUE_VIOLATION,
  };
}

/** Prefer `isConstrainViolation`; use when adding checks before flags exist. */
export function matchesPostgresErrorCode(
  error: unknown,
  code: string,
): boolean {
  return getPostgresErrorCode(error) === code;
}
