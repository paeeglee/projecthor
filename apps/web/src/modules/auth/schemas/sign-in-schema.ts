import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Insira um e-mail válido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type SignInFormData = z.infer<typeof signInSchema>;
