"use client";

import { useState } from "react";
import { RecurringTransactionsTable, type RecurringTransaction } from "./recurring-transactions-table";
import { RecurringTransactionsEditDialog } from "./recurring-transactions-edit-dialog";
import type { Tables } from "@/lib/supabase/types";

type RecurringTransactionsWrapperProps = {
  recurringTransactions: RecurringTransaction[];
  accounts: Pick<Tables<"accounts">, "id" | "name">[];
  categories: Pick<Tables<"categories">, "id" | "name" | "type" | "color_hex">[];
};

export function RecurringTransactionsWrapper({
  recurringTransactions,
  accounts,
  categories,
}: RecurringTransactionsWrapperProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRecurring, setSelectedRecurring] = useState<RecurringTransaction | null>(null);

  const handleEdit = (recurring: RecurringTransaction) => {
    setSelectedRecurring(recurring);
    setEditDialogOpen(true);
  };

  const handleSuccess = () => {
    setEditDialogOpen(false);
    setSelectedRecurring(null);
  };

  return (
    <>
      <RecurringTransactionsTable
        recurringTransactions={recurringTransactions}
        accounts={accounts}
        categories={categories}
        onEdit={handleEdit}
      />
      <RecurringTransactionsEditDialog
        recurring={selectedRecurring}
        accounts={accounts}
        categories={categories}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}

