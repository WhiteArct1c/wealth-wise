"use client";

import type { Transaction } from "@/components/transactions/transactions-table";
import { createEditDialogContext } from "./create-edit-dialog-context";

const { Provider, useEditDialogContext } = createEditDialogContext<Transaction>();

export const TransactionsProvider = Provider;

export function useTransactionsContext() {
  const { itemToEdit: transactionToEdit, ...rest } = useEditDialogContext();
  return { transactionToEdit, ...rest };
}
