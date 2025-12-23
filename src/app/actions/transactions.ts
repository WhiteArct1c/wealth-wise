"use server";

import { createClient } from "@/lib/supabase/server";
import { transactionSchema, type TransactionFormValues } from "@/lib/validations/transaction";
import { revalidatePath } from "next/cache";
import type { Tables } from "@/lib/supabase/types";

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

export async function createTransaction(
  formData: TransactionFormValues,
  options?: { recurringId?: string }
) {
  const validation = transactionSchema.safeParse(formData);
  
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

  // Verifica se a categoria pertence ao usuário (se fornecida)
  let categoryType: "INCOME" | "EXPENSE" | null = null;
  if (validation.data.category_id) {
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

    categoryType = category.type as "INCOME" | "EXPENSE";
  }

  // Calcula saldo atual da conta (derivado) para evitar saldo negativo em despesas
  const { data: accountWithBalance } = await supabase
    .from("accounts")
    .select("id, initial_balance")
    .eq("id", validation.data.account_id)
    .single();

  if (!accountWithBalance) {
    return {
      error: "Conta não encontrada",
    };
  }

  const { data: accountTx = [] } = await supabase
    .from("transactions")
    .select("amount, category:categories(type)")
    .eq("user_id", user.id)
    .eq("account_id", validation.data.account_id);

  type TxRow = {
    amount: number;
    category: { type: "INCOME" | "EXPENSE" } | null;
  };

  const typedAccountTx = accountTx as unknown as TxRow[];

  // Se for recorrente com data futura, não cria transação inicial nem verifica saldo
  const isRecurringWithFutureDate = validation.data.is_recurring && 
    validation.data.recurring_start_date &&
    new Date(`${validation.data.recurring_start_date}T00:00:00`) > new Date();

  // Se for recorrente, usa recurring_start_date como date da transação inicial
  const transactionDate = validation.data.is_recurring && validation.data.recurring_start_date
    ? validation.data.recurring_start_date
    : validation.data.date;

  // Só verifica saldo se não for uma recorrência com data futura
  if (!isRecurringWithFutureDate) {
    const netExisting = typedAccountTx.reduce((sum, tx) => {
      const isExpense = tx.category?.type === "EXPENSE";
      const delta = isExpense ? -tx.amount : tx.amount;
      return sum + delta;
    }, 0);

    const currentBalanceBefore =
      (accountWithBalance.initial_balance || 0) + netExisting;

    const newAmountReais = validation.data.amount / 100;
    const isNewExpense = categoryType === "EXPENSE";
    const newDelta = isNewExpense ? -newAmountReais : newAmountReais;

    if (currentBalanceBefore + newDelta < 0) {
      return {
        error: "Saldo insuficiente na conta para esta despesa",
      };
    }
  }

  // Só cria transação inicial se não for recorrência com data futura
  let transactionData = null;
  if (!isRecurringWithFutureDate) {
    // Converte centavos para reais antes de salvar
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        account_id: validation.data.account_id,
        category_id: validation.data.category_id || null,
        description: validation.data.description,
        amount: validation.data.amount / 100, // Converte centavos para reais
        date: transactionDate,
        payment_date: validation.data.payment_date || null,
        status: validation.data.status || "PENDING",
        user_id: user.id,
        recurring_id: options?.recurringId ?? null,
      })
      .select()
      .single();

    if (error) {
      return {
        error: error.message,
      };
    }

    transactionData = data;
  }

  // Se for uma transação recorrente, criar a regra de recorrência
  if (validation.data.is_recurring && validation.data.frequency && validation.data.recurring_start_date && validation.data.category_id) {
    const startDate = new Date(`${validation.data.recurring_start_date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nextRun = startDate < today ? today : startDate;

    if (validation.data.frequency === "MONTHLY" && validation.data.day_of_month) {
      const lastDay = new Date(
        nextRun.getFullYear(),
        nextRun.getMonth() + 1,
        0
      ).getDate();
      nextRun.setDate(
        Math.min(validation.data.day_of_month, lastDay)
      );
    } else if (validation.data.frequency === "MONTHLY") {
      // Se não especificou day_of_month, usa o dia da start_date
      nextRun = getNextRunDate(startDate, validation.data.frequency, startDate.getDate());
    } else {
      nextRun = getNextRunDate(startDate, validation.data.frequency, validation.data.day_of_month ?? null);
    }

    const { error: recurringError } = await supabase
      .from("recurring_transactions")
      .insert({
        user_id: user.id,
        account_id: validation.data.account_id,
        category_id: validation.data.category_id,
        description: validation.data.description,
        amount: validation.data.amount / 100,
        type: categoryType || "EXPENSE",
        frequency: validation.data.frequency,
        day_of_month: validation.data.day_of_month ?? null,
        day_of_week: null,
        start_date: validation.data.recurring_start_date,
        end_date: validation.data.recurring_end_date || null,
        status: "ACTIVE",
        next_run_date: nextRun.toISOString().slice(0, 10),
      });

    if (recurringError) {
      // Se falhar ao criar recorrência, ainda retorna sucesso da transação
      // mas loga o erro
      console.error("Erro ao criar recorrência:", recurringError);
    }
  }

  revalidatePath("/transactions");
  return {
    success: true,
    data: transactionData, // Pode ser null se for recorrência com data futura
  };
}

export async function updateTransaction(id: string, formData: Partial<TransactionFormValues>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Usuário não autenticado",
    };
  }

  // Verifica se a transação pertence ao usuário
  const { data: transaction } = await supabase
    .from("transactions")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!transaction || transaction.user_id !== user.id) {
    return {
      error: "Transação não encontrada ou sem permissão",
    };
  }

  // Prepara os dados para atualização
  const updateData: Partial<TransactionFormValues> & { updated_at: string } = {
    ...formData,
    updated_at: new Date().toISOString(),
  };

  // Se amount foi fornecido, converte centavos para reais
  if (updateData.amount !== undefined) {
    updateData.amount = updateData.amount / 100;
  }

  const { data, error } = await supabase
    .from("transactions")
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
  return {
    success: true,
    data,
  };
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Usuário não autenticado",
    };
  }

  // Verifica se a transação pertence ao usuário
  const { data: transaction } = await supabase
    .from("transactions")
    .select("user_id, amount, description, category:categories(type)")
    .eq("id", id)
    .single();

  if (!transaction || transaction.user_id !== user.id) {
    return {
      error: "Transação não encontrada ou sem permissão",
    };
  }

  // Se for um aporte em meta, ajusta o current_amount da meta antes de deletar
  const category = (transaction.category as unknown as { type: "INCOME" | "EXPENSE" } | null);
  const isContribution =
    category?.type === "EXPENSE" &&
    typeof transaction.description === "string" &&
    transaction.description.startsWith("Aporte na meta");

  if (isContribution) {
    const goalName = transaction.description.replace(
      /^Aporte na meta:?/,
      ""
    ).trim();

    if (goalName) {
      const { data: goal } = await supabase
        .from("goals")
        .select("id, current_amount")
        .eq("user_id", user.id)
        .eq("name", goalName)
        .maybeSingle();

      if (goal) {
        const newCurrent =
          Math.max(0, (goal.current_amount ?? 0) - transaction.amount);

        await supabase
          .from("goals")
          .update({ current_amount: newCurrent })
          .eq("id", goal.id);
      }
    }
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id);

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/transactions");
   revalidatePath("/goals");
   revalidatePath("/dashboard");
  return {
    success: true,
  };
}

