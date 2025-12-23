"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Tables } from "@/lib/supabase/types";

export type Goal = Tables<"goals">;

type GoalsContextType = {
  editDialogOpen: boolean;
  goalToEdit: Goal | null;
  openEditDialog: (goal: Goal) => void;
  closeEditDialog: () => void;
};

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export function GoalsProvider({ children }: { children: ReactNode }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

  const openEditDialog = (goal: Goal) => {
    setGoalToEdit(goal);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setGoalToEdit(null);
  };

  return (
    <GoalsContext.Provider
      value={{
        editDialogOpen,
        goalToEdit,
        openEditDialog,
        closeEditDialog,
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoalsContext() {
  const ctx = useContext(GoalsContext);
  if (!ctx) {
    throw new Error("useGoalsContext must be used within GoalsProvider");
  }
  return ctx;
}


