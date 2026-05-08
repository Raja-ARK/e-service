export const SIGNUP_ALLOWED_ORIGINS = ["external"] as const;
export const ORIGINS = ["external", "internal", "admin"] as const;
export type Origin = (typeof ORIGINS)[number];
