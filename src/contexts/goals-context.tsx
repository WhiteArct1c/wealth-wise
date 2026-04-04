"use client";

import type { Tables } from "@/lib/supabase/types";
import { createEditDialogContext } from "./create-edit-dialog-context";

export type Goal = Tables<"goals">;

const { Provider, useEditDialogContext } = createEditDialogContext<Goal>();

export const GoalsProvider = Provider;

export function useGoalsContext() {
  const { itemToEdit: goalToEdit, ...rest } = useEditDialogContext();
  return { goalToEdit, ...rest };
}
