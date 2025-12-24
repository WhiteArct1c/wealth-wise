"use server";

import { createClient } from "@/lib/supabase/server";
import {
  goalSchema,
  type GoalFormValues,
} from "@/lib/validations/goal";
import { revalidatePath } from "next/cache";
import { transactionSchema } from "@/lib/validations/transaction";

export async function createGoal(formData: GoalFormValues) {
  const validation = goalSchema.safeParse(formData);

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

  const { data, error } = await supabase
    .from("goals")
    .insert({
      name: validation.data.name,
      // valores em reais no banco, centavos no formulário
      target_amount: validation.data.target_amount / 100,
      current_amount: (validation.data.current_amount ?? 0) / 100,
      deadline: validation.data.deadline || null,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/goals");

  return {
    success: true,
    data,
  };
}

export async function updateGoal(
  id: string,
  formData: Partial<GoalFormValues>
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

  // garante que a meta pertence ao usuário
  const { data: goal } = await supabase
    .from("goals")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!goal || goal.user_id !== user.id) {
    return {
      error: "Meta não encontrada ou sem permissão",
    };
  }

  const updateData: Partial<GoalFormValues> = {
    ...formData,
  };

  if (updateData.target_amount !== undefined) {
    updateData.target_amount = updateData.target_amount / 100;
  }

  if (updateData.current_amount !== undefined) {
    updateData.current_amount = updateData.current_amount / 100;
  }

  const { data: updated, error } = await supabase
    .from("goals")
    .update({
      name: updateData.name,
      target_amount: updateData.target_amount,
      current_amount: updateData.current_amount,
      deadline: updateData.deadline ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/goals");

  return {
    success: true,
    data: updated,
  };
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Usuário não autenticado",
    };
  }

  const { data: goal } = await supabase
    .from("goals")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!goal || goal.user_id !== user.id) {
    return {
      error: "Meta não encontrada ou sem permissão",
    };
  }

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id);

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/goals");

  return {
    success: true,
  };
}

type ContributeToGoalInput = {
  goal_id: string;
  account_id: string;
  amount: number; // em centavos
  date: string;
};

export async function contributeToGoal(input: ContributeToGoalInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Usuário não autenticado",
    };
  }

  // Verifica se a meta pertence ao usuário
  const { data: goal } = await supabase
    .from("goals")
    .select("id, name, user_id, current_amount")
    .eq("id", input.goal_id)
    .single();

  if (!goal || goal.user_id !== user.id) {
    return {
      error: "Meta não encontrada ou sem permissão",
    };
  }

  // Valida os dados mínimos como se fosse uma transação de despesa
  const txValidation = transactionSchema
    .omit({
      category_id: true,
      status: true,
      payment_date: true,
      is_recurring: true,
      frequency: true,
      day_of_month: true,
      recurring_start_date: true,
      recurring_end_date: true,
    })
    .safeParse({
      account_id: input.account_id,
      description: `Aporte na meta: ${goal.name}`,
      amount: input.amount,
      date: input.date,
    });

  if (!txValidation.success) {
    return {
      error: "Dados inválidos para aporte",
      details: txValidation.error.issues,
    };
  }

  // Seleciona uma categoria de despesa para “Aporte” (se existir)
  let categoryId: string | null = null;
  const { data: contributionCategory } = await supabase
    .from("categories")
    .select("id")
    .eq("user_id", user.id)
    .eq("type", "EXPENSE")
    .ilike("name", "%aporte%")
    .limit(1)
    .maybeSingle();

  if (contributionCategory?.id) {
    categoryId = contributionCategory.id;
  } else {
    // Cria uma categoria padrão de despesa para aportes, garantindo que
    // a transação seja sempre classificada como despesa
    const { data: newCategory, error: newCatError } = await supabase
      .from("categories")
      .insert({
        name: "Aporte para metas",
        type: "EXPENSE",
        user_id: user.id,
        budget_type: null,
        color_hex: null,
        icon_slug: null,
      })
      .select("id")
      .single();

    if (newCatError) {
      return {
        error: newCatError.message,
      };
    }

    categoryId = newCategory.id;
  }

  // Cria uma transação de despesa usando a mesma lógica de createTransaction
  const {
    data: { user: txUser },
  } = await supabase.auth.getUser();

  if (!txUser) {
    return {
      error: "Usuário não autenticado",
    };
  }

  const { data: account } = await supabase
    .from("accounts")
    .select("user_id, initial_balance")
    .eq("id", input.account_id)
    .single();

  if (!account || account.user_id !== txUser.id) {
    return {
      error: "Conta não encontrada ou sem permissão",
    };
  }

  const { data: accountTx = [] } = await supabase
    .from("transactions")
    .select("amount, category:categories(type)")
    .eq("user_id", txUser.id)
    .eq("account_id", input.account_id);

  type TxRow = {
    amount: number;
    category: { type: "INCOME" | "EXPENSE" } | null;
  };

  const typedAccountTx = accountTx as unknown as TxRow[];

  const netExisting = typedAccountTx.reduce((sum, tx) => {
    const isExpense = tx.category?.type === "EXPENSE";
    const delta = isExpense ? -tx.amount : tx.amount;
    return sum + delta;
  }, 0);

  const currentBalanceBefore =
    (account.initial_balance || 0) + netExisting;

  const newAmountReais = input.amount / 100;
  const newDelta = -newAmountReais; // aporte é sempre despesa na conta

  if (currentBalanceBefore + newDelta < 0) {
    return {
      error: "Saldo insuficiente na conta para este aporte",
    };
  }

  const { data: tx, error: txError } = await supabase
    .from("transactions")
    .insert({
      account_id: input.account_id,
      category_id: categoryId,
      description: `Aporte na meta ${goal.name}`,
      amount: newAmountReais,
      date: input.date,
      payment_date: null,
      status: "PAID",
      user_id: txUser.id,
    })
    .select()
    .single();

  if (txError) {
    return {
      error: txError.message,
    };
  }

  // Atualiza o valor acumulado da meta
  const { data: updatedGoal, error: goalError } = await supabase
    .from("goals")
    .update({
      current_amount: (goal.current_amount ?? 0) + newAmountReais,
    })
    .eq("id", input.goal_id)
    .select()
    .single();

  if (goalError) {
    return {
      error: goalError.message,
    };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");

  return {
    success: true,
    data: { transaction: tx, goal: updatedGoal },
  };
}



