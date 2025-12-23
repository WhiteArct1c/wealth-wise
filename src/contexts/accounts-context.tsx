"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Account } from "@/components/accounts/accounts-table";

type AccountsContextType = {
  editDialogOpen: boolean;
  accountToEdit: Account | null;
  openEditDialog: (account: Account) => void;
  closeEditDialog: () => void;
};

const AccountsContext = createContext<AccountsContextType | undefined>(
  undefined
);

export function AccountsProvider({ children }: { children: ReactNode }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);

  const openEditDialog = (account: Account) => {
    setAccountToEdit(account);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setAccountToEdit(null);
  };

  return (
    <AccountsContext.Provider
      value={{
        editDialogOpen,
        accountToEdit,
        openEditDialog,
        closeEditDialog,
      }}
    >
      {children}
    </AccountsContext.Provider>
  );
}

export function useAccountsContext() {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error("useAccountsContext must be used within AccountsProvider");
  }
  return context;
}


