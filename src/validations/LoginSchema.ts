import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().min(1, { message: "Email address is required" }).email(),
  password: z
    .string()
    .min(8, { message: "Password is required" })
    .regex(/.*[!@#$%^&*()_+{}|[\]\\:";'<>?,./].*/, {
      message: "Password should contain at least 1 special character",
    }),
});

type LoginType = z.infer<typeof LoginSchema>;

export { LoginSchema, type LoginType };