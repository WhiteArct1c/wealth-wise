"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "./transaction-form";
import { useTransactionsContext } from "@/contexts/transactions-context";
import { useRouter } from "next/navigation";

type TransactionsEditDialogProps = {
  accounts: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; type: "INCOME" | "EXPENSE"; color_hex: string | null }>;
};

export function TransactionsEditDialog({ accounts, categories }: TransactionsEditDialogProps) {
  const { editDialogOpen, transactionToEdit, closeEditDialog } = useTransactionsContext();
  const router = useRouter();

  const handleSuccess = () => {
    closeEditDialog();
    router.refresh();
  };

  return (
    <Dialog open={editDialogOpen} onOpenChange={(open) => !open && closeEditDialog()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
          <DialogDescription>
            Atualize as informações da transação
          </DialogDescription>
        </DialogHeader>
        {transactionToEdit && (
          <TransactionForm
            transactionId={transactionToEdit.id}
            defaultValues={{
              account_id: transactionToEdit.account_id,
              category_id: transactionToEdit.category_id,
              description: transactionToEdit.description,
              // Converte reais (do banco) para centavos (para o formulário)
              amount: Math.round(transactionToEdit.amount * 100),
              date: transactionToEdit.date,
              payment_date: transactionToEdit.payment_date,
              status: transactionToEdit.status || "PENDING",
            }}
            accounts={accounts}
            categories={categories}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

