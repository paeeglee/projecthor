import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().min(1, "Nome é obrigatório"),
  email: z.email("Insira um e-mail válido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
