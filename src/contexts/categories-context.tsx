"use client";

import type { Category } from "@/components/categories/categories-table";
import { createEditDialogContext } from "./create-edit-dialog-context";

const { Provider, useEditDialogContext } = createEditDialogContext<Category>();

export const CategoriesProvider = Provider;

export function useCategoriesContext() {
  const { itemToEdit: categoryToEdit, ...rest } = useEditDialogContext();
  return { categoryToEdit, ...rest };
}
