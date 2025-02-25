import { z } from "zod";
export const signupSchema = z.object({
  fullname: z.string().min(3, "Full name must be at least 3 characters."),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(20, "Username can't be longer than 20 characters.")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      "Username must start with a letter and can only contain letters, numbers, and underscores."
    ),
  email: z.string().email("Invalid email format."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(20, "Username can't be longer than 20 characters.")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      "Username must start with a letter and can only contain letters, numbers, and underscores."
    ),
  password: z.string().min(6, "Password must be at least 6 characters."),
});
