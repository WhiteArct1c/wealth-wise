"use server";

import { createClient } from "@/lib/supabase/server";
import { categorySchema, type CategoryFormValues } from "@/lib/validations/category";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: CategoryFormValues) {
  const validation = categorySchema.safeParse(formData);
  
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
    .from("categories")
    .insert({
      name: validation.data.name,
      type: validation.data.type,
      budget_type: validation.data.budget_type || null,
      color_hex: validation.data.color_hex || null,
      icon_slug: validation.data.icon_slug || null,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/categories");
  return {
    success: true,
    data,
  };
}

export async function updateCategory(id: string, formData: Partial<CategoryFormValues>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Usuário não autenticado",
    };
  }

  // Verifica se a categoria pertence ao usuário
  const { data: category } = await supabase
    .from("categories")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!category || category.user_id !== user.id) {
    return {
      error: "Categoria não encontrada ou sem permissão",
    };
  }

  // Prepara os dados para atualização
  const updateData: Partial<CategoryFormValues> & { updated_at: string } = {
    ...formData,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("categories")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/categories");
  return {
    success: true,
    data,
  };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Usuário não autenticado",
    };
  }

  // Verifica se a categoria pertence ao usuário
  const { data: category } = await supabase
    .from("categories")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!category || category.user_id !== user.id) {
    return {
      error: "Categoria não encontrada ou sem permissão",
    };
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/categories");
  return {
    success: true,
  };
}

