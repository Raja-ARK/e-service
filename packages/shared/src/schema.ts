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

export const passwordSchema = z.string().check(({ issues, value }) => {
  if (value === null || value === undefined || value === "") {
    issues.push({
      code: "custom",
      message: "Password is required",
      input: value,
    });
    return;
  }
  if (value.length < 8) {
    issues.push({
      code: "custom",
      message: "Password must be at least 8 characters long",
      input: value,
    });
    return;
  }
  if (value.length > 16) {
    issues.push({
      code: "custom",
      message: "Password must be less than 16 characters long",
      input: value,
    });
    return;
  }
});
