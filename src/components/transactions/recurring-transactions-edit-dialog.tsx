"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RecurringTransactionForm } from "./recurring-transaction-form";
import type { RecurringTransaction } from "./recurring-transactions-table";
import type { Tables } from "@/lib/supabase/types";

type RecurringTransactionsEditDialogProps = {
  recurring: RecurringTransaction | null;
  accounts: Pick<Tables<"accounts">, "id" | "name">[];
  categories: Pick<Tables<"categories">, "id" | "name" | "type" | "color_hex">[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function RecurringTransactionsEditDialog({
  recurring,
  accounts,
  categories,
  open,
  onOpenChange,
  onSuccess,
}: RecurringTransactionsEditDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {recurring ? "Editar Transação Recorrente" : "Nova Transação Recorrente"}
          </DialogTitle>
        </DialogHeader>
        <RecurringTransactionForm
          recurringId={recurring?.id}
          defaultValues={
            recurring
              ? {
                  account_id: recurring.account_id,
                  category_id: recurring.category_id,
                  description: recurring.description,
                  amount: Math.round(recurring.amount * 100), // Converte de reais para centavos
                  frequency: recurring.frequency,
                  day_of_month: recurring.day_of_month,
                  start_date: recurring.start_date,
                  end_date: recurring.end_date || undefined,
                }
              : undefined
          }
          accounts={accounts}
          categories={categories}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

