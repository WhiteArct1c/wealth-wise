"use server";

import { createClient } from "@/lib/supabase/server";
import {
  accountSchema,
  type AccountFormValues,
} from "@/lib/validations/account";
import { revalidatePath } from "next/cache";

export async function createAccount(formData: AccountFormValues) {
  const validation = accountSchema.safeParse(formData);
  
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
    .from("accounts")
    .insert({
      name: validation.data.name,
      type: validation.data.type,
      // Converte centavos para reais (divide por 100)
      initial_balance: validation.data.initial_balance / 100,
      is_active: validation.data.is_active,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/accounts");
  return {
    success: true,
    data,
  };
}

export async function updateAccount(id: string, formData: Partial<AccountFormValues>) {
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
    .eq("id", id)
    .single();

  if (!account || account.user_id !== user.id) {
    return {
      error: "Conta não encontrada ou sem permissão",
    };
  }

  // Prepara os dados para atualização, convertendo centavos para reais se houver initial_balance
  const updateData: Partial<AccountFormValues> & { updated_at: string } = {
    ...formData,
    updated_at: new Date().toISOString(),
  };

  if (updateData.initial_balance !== undefined) {
    // Converte centavos para reais (divide por 100)
    updateData.initial_balance = updateData.initial_balance / 100;
  }

  const { data, error } = await supabase
    .from("accounts")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/accounts");
  return {
    success: true,
    data,
  };
}

export async function deleteAccount(id: string) {
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
    .eq("id", id)
    .single();

  if (!account || account.user_id !== user.id) {
    return {
      error: "Conta não encontrada ou sem permissão",
    };
  }

  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", id);

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/accounts");
  return {
    success: true,
  };
}

