import { z } from "zod";

export const goalSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(120, "Nome muito longo"),
  target_amount: z
    .number()
    .int("Valor da meta deve ser um número inteiro (em centavos)")
    .min(1, "Valor da meta deve ser maior que zero"),
  current_amount: z
    .number()
    .int("Valor acumulado deve ser um número inteiro (em centavos)")
    .min(0, "Valor acumulado não pode ser negativo"),
  deadline: z
    .string()
    .nullable()
    .optional(),
});

export type GoalFormValues = z.infer<typeof goalSchema>;


