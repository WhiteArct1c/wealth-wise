import { z } from "zod";

export const transactionSchema = z.object({
  account_id: z.string().min(1, "Conta é obrigatória"),
  category_id: z.string().nullable().optional(),
  description: z.string().min(1, "Descrição é obrigatória").max(200, "Descrição muito longa"),
  amount: z.number().int("Valor deve ser um número inteiro (em centavos)").min(0, "Valor não pode ser negativo"),
  date: z.string().min(1, "Data é obrigatória"),
  payment_date: z.string().nullable().optional(),
  status: z.enum(["PENDING", "PAID"]).nullable().optional(),
  // Campos de recorrência (opcionais)
  is_recurring: z.boolean(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).nullable().optional(),
  day_of_month: z.number().int().min(1).max(31).nullable().optional(),
  recurring_start_date: z.string().nullable().optional(),
  recurring_end_date: z.string().nullable().optional(),
}).refine(
  (data) => {
    // Se is_recurring é true, frequency e recurring_start_date são obrigatórios
    if (data.is_recurring) {
      return data.frequency !== null && data.recurring_start_date !== null && data.recurring_start_date !== "";
    }
    return true;
  },
  {
    message: "Frequência e data de início são obrigatórias para transações recorrentes",
    path: ["frequency"],
  }
).refine(
  (data) => {
    // Se is_recurring é true, category_id é obrigatório
    if (data.is_recurring) {
      return data.category_id !== null && data.category_id !== "";
    }
    return true;
  },
  {
    message: "Categoria é obrigatória para transações recorrentes",
    path: ["category_id"],
  }
);

export type TransactionFormValues = z.infer<typeof transactionSchema>;

