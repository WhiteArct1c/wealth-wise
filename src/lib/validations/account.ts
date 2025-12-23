import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  type: z.enum(["CHECKING", "CASH", "INVESTMENT"]),
  initial_balance: z
    .number()
    .int("Saldo deve ser um número inteiro (em centavos)"),
  is_active: z.boolean(),
});

export type AccountFormValues = z.infer<typeof accountSchema>;

