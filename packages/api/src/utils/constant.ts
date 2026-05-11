export const SIGNUP_ALLOWED_ORIGINS = ["external"] as const;
export const ORIGINS = {
  "localhost:3001": "external",
  "localhost:3002": "internal",
  "localhost:3003": "admin",
} as const;
export type Origin = (typeof ORIGINS)[keyof typeof ORIGINS];
