import z from "zod";

export const emailSchema = z.email({
  error: ({ code, input }) => {
    if (input === null || input === undefined || input === "") {
      return {
        message: "Email is required",
      };
    }
    if (code === "invalid_format") {
      return {
        message: "Invalid email format",
      };
    }
  },
});

export const passwordSchema = z
  .string()
  .min(8, {
    message: "Password must be at least 8 characters long",
  })
  .max(16, {
    message: "Password must be less than 16 characters long",
  });

export const otpSchema = z.string().length(6, {
  message: "OTP must be 6 characters long",
});

export const arabicNameSchema = z
  .string()
  .regex(
    /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+$/,
  );

export const dateCodecSchema = z.codec(z.iso.date(), z.date(), {
  decode: (isoString) => new Date(isoString),
  encode: (date) => date.toISOString(),
});
