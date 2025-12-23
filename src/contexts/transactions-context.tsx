"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Transaction } from "@/components/transactions/transactions-table";

type TransactionsContextType = {
  editDialogOpen: boolean;
  transactionToEdit: Transaction | null;
  openEditDialog: (transaction: Transaction) => void;
  closeEditDialog: () => void;
};

const TransactionsContext = createContext<
  TransactionsContextType | undefined
>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);

  const openEditDialog = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setTransactionToEdit(null);
  };

  return (
    <TransactionsContext.Provider
      value={{
        editDialogOpen,
        transactionToEdit,
        openEditDialog,
        closeEditDialog,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactionsContext() {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error(
      "useTransactionsContext must be used within TransactionsProvider"
    );
  }
  return context;
}


