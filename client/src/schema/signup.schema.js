import { z } from "zod";

// Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character
const passwordValidation = new RegExp(
  /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/
);

export const SignupSchema = z.object({
  firstname: z
    .string()
    .min(3, {
      message: "First name must be at least 3 characters.",
    })
    .max(100, {
      message: "First name cannot be more than 100 characters",
    }),
  lastname: z.string().max(100, {
    message: "Last name cannot be more than 100 characters",
  }).optional().or(z.literal("")),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters.",
    })
    .regex(passwordValidation, {
      message:
        "Password must include at least one number, one uppercase letter, one lowercase letter, and one special character.",
    }),
  role: z.enum(["user", "admin"]).optional(),
  userType: z.enum(["user", "admin"]).optional(), 
});