"use client";

import type { Account } from "@/lib/types/account";
import { createEditDialogContext } from "./create-edit-dialog-context";

const { Provider, useEditDialogContext } = createEditDialogContext<Account>();

export const AccountsProvider = Provider;

export function useAccountsContext() {
  const { itemToEdit: accountToEdit, ...rest } = useEditDialogContext();
  return { accountToEdit, ...rest };
}
