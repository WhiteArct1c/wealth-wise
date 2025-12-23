"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Category } from "@/components/categories/categories-table";

type CategoriesContextType = {
  editDialogOpen: boolean;
  categoryToEdit: Category | null;
  openEditDialog: (category: Category) => void;
  closeEditDialog: () => void;
};

const CategoriesContext = createContext<CategoriesContextType | undefined>(
  undefined
);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const openEditDialog = (category: Category) => {
    setCategoryToEdit(category);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setCategoryToEdit(null);
  };

  return (
    <CategoriesContext.Provider
      value={{
        editDialogOpen,
        categoryToEdit,
        openEditDialog,
        closeEditDialog,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategoriesContext() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error(
      "useCategoriesContext must be used within CategoriesProvider"
    );
  }
  return context;
}


