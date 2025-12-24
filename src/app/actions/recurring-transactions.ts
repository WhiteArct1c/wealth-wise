"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { Tables, TablesUpdate } from "@/lib/supabase/types";
import { createTransaction } from "@/app/actions/transactions";
import type { TransactionFormValues } from "@/lib/validations/transaction";
import { revalidatePath } from "next/cache";

const recurringSchema = z.object({
  account_id: z.string().min(1, "Conta é obrigatória"),
  category_id: z.string().min(1, "Categoria é obrigatória"),
  description: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(200, "Descrição muito longa"),
  amount: z
    .number()
    .int("Valor deve ser um número inteiro (em centavos)")
    .min(1, "Valor deve ser maior que zero"),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  day_of_month: z.number().int().min(1).max(31).nullable().optional(),
  start_date: z.string().min(1, "Data de início é obrigatória"),
  end_date: z.string().nullable().optional(),
});

export type RecurringFormValues = z.infer<typeof recurringSchema>;

function getNextRunDate(
  current: Date,
  frequency: Tables<"recurring_transactions">["frequency"],
  dayOfMonth?: number | null
): Date {
  const d = new Date(current);

  switch (frequency) {
    case "DAILY":
      d.setDate(d.getDate() + 1);
      break;
    case "WEEKLY":
      d.setDate(d.getDate() + 7);
      break;
    case "MONTHLY": {
      const day = dayOfMonth ?? d.getDate();
      d.setMonth(d.getMonth() + 1);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      d.setDate(Math.min(day, lastDay));
      break;
    }
    case "YEARLY": {
      const day = dayOfMonth ?? d.getDate();
      const month = d.getMonth();
      d.setFullYear(d.getFullYear() + 1);
      const lastDay = new Date(d.getFullYear(), month + 1, 0).getDate();
      d.setMonth(month);
      d.setDate(Math.min(day, lastDay));
      break;
    }
    default:
      break;
  }

  return d;
}

export async function createRecurringTransaction(
  formData: RecurringFormValues
) {
  const validation = recurringSchema.safeParse(formData);

  if (!validation.success) {
    return {
      error: "Dados inválidos",
      details: validation.error.issues,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Usuário não autenticado",
    };
  }

  // Verifica se a conta pertence ao usuário
  const { data: account } = await supabase
    .from("accounts")
    .select("user_id")
    .eq("id", validation.data.account_id)
    .single();

  if (!account || account.user_id !== user.id) {
    return {
      error: "Conta não encontrada ou sem permissão",
    };
  }

  // Verifica se a categoria pertence ao usuário e obtém o tipo
  const { data: category } = await supabase
    .from("categories")
    .select("user_id, type")
    .eq("id", validation.data.category_id)
    .single();

  if (!category || category.user_id !== user.id) {
    return {
      error: "Categoria não encontrada ou sem permissão",
    };
  }

  const type = category.type as "INCOME" | "EXPENSE";

  // Define data inicial e próxima execução
  const startDate = new Date(`${validation.data.start_date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initialNextRun = startDate < today ? today : startDate;
  const nextRun = new Date(initialNextRun);

  if (validation.data.frequency === "MONTHLY" && validation.data.day_of_month) {
    const lastDay = new Date(
      nextRun.getFullYear(),
      nextRun.getMonth() + 1,
      0
    ).getDate();
    nextRun.setDate(
      Math.min(validation.data.day_of_month, lastDay)
    );
  }

  const { data, error } = await supabase
    .from("recurring_transactions")
    .insert({
      user_id: user.id,
      account_id: validation.data.account_id,
      category_id: validation.data.category_id,
      description: validation.data.description,
      amount: validation.data.amount / 100,
      type,
      frequency: validation.data.frequency,
      day_of_month: validation.data.day_of_month ?? null,
      day_of_week: null,
      start_date: validation.data.start_date,
      end_date: validation.data.end_date || null,
      status: "ACTIVE",
      next_run_date: nextRun.toISOString().slice(0, 10),
    })
    .select()
    .single();

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: true,
    data,
  };
}

export async function updateRecurringTransaction(
  id: string,
  formData: Partial<RecurringFormValues>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Usuário não autenticado",
    };
  }

  const { data: recurring } = await supabase
    .from("recurring_transactions")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!recurring || recurring.user_id !== user.id) {
    return {
      error: "Recorrência não encontrada ou sem permissão",
    };
  }

  const updateData: TablesUpdate<"recurring_transactions"> = {};

  if (formData.account_id !== undefined) {
    updateData.account_id = formData.account_id;
  }
  if (formData.category_id !== undefined) {
    updateData.category_id = formData.category_id;
  }
  if (formData.description !== undefined) {
    updateData.description = formData.description;
  }
  if (formData.amount !== undefined) {
    updateData.amount = formData.amount / 100;
  }
  if (formData.frequency !== undefined) {
    updateData.frequency = formData.frequency;
  }
  if (formData.day_of_month !== undefined) {
    updateData.day_of_month = formData.day_of_month;
  }
  if (formData.start_date !== undefined) {
    updateData.start_date = formData.start_date;
  }
  if (formData.end_date !== undefined) {
    updateData.end_date = formData.end_date || null;
  }

  const { data, error } = await supabase
    .from("recurring_transactions")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return {
    success: true,
    data,
  };
}

export async function setRecurringStatus(
  id: string,
  status: "ACTIVE" | "PAUSED" | "CANCELLED"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Usuário não autenticado",
    };
  }

  const { data: recurring } = await supabase
    .from("recurring_transactions")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!recurring || recurring.user_id !== user.id) {
    return {
      error: "Recorrência não encontrada ou sem permissão",
    };
  }

  const { data, error } = await supabase
    .from("recurring_transactions")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: true,
    data,
  };
}

export async function deleteRecurringTransaction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Usuário não autenticado",
    };
  }

  // Verifica se a recorrência pertence ao usuário
  const { data: recurring } = await supabase
    .from("recurring_transactions")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!recurring || recurring.user_id !== user.id) {
    return {
      error: "Recorrência não encontrada ou sem permissão",
    };
  }

  const { error } = await supabase
    .from("recurring_transactions")
    .delete()
    .eq("id", id);

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return {
    success: true,
  };
}

export async function processDueRecurringTransactions(userId: string) {
  const supabase = await createClient();

  const todayStr = new Date().toISOString().slice(0, 10);

  const { data: due, error } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "ACTIVE")
    .lte("next_run_date", todayStr);

  if (error || !due || !due.length) {
    return { processed: 0 };
  }

  let processed = 0;

  for (const rec of due as Tables<"recurring_transactions">[]) {
    // Se tem data de fim e a data de execução atual passou ou é igual ao fim, pula
    if (rec.end_date && rec.next_run_date >= rec.end_date) {
      // Se passou da data de término, marca como CANCELLED
      if (rec.next_run_date > rec.end_date) {
        await supabase
          .from("recurring_transactions")
          .update({ status: "CANCELLED" })
          .eq("id", rec.id);
      }
      continue;
    }

    const amountInCents = Math.round(rec.amount * 100);

    const txResult = await createTransaction(
      {
        account_id: rec.account_id,
        category_id: rec.category_id,
        description: rec.description,
        amount: amountInCents,
        date: rec.next_run_date,
        payment_date: null,
        status: "PAID",
        is_recurring: false,
      } satisfies TransactionFormValues
    );

    if (txResult?.error) {
      // Em caso de erro (ex: saldo insuficiente), apenas segue
      continue;
    }

    processed += 1;

    const next = getNextRunDate(
      new Date(`${rec.next_run_date}T00:00:00`),
      rec.frequency,
      rec.day_of_month
    );

    const nextDateStr = next.toISOString().slice(0, 10);

    // Se a próxima execução passou da data de término, cancela a recorrência
    if (rec.end_date && nextDateStr > rec.end_date) {
      await supabase
        .from("recurring_transactions")
        .update({ status: "CANCELLED" })
        .eq("id", rec.id);
    } else {
      // Atualiza a próxima data de execução
      await supabase
        .from("recurring_transactions")
        .update({
          next_run_date: nextDateStr,
        })
        .eq("id", rec.id);
    }
  }

  return { processed };
}


