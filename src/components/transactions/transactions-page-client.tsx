"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TransactionForm } from "./transaction-form";
import { TransactionsTable, type Transaction } from "./transactions-table";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransactionsContext } from "@/contexts/transactions-context";

type TransactionsPageClientProps = {
  transactions: Transaction[];
  accounts: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; type: "INCOME" | "EXPENSE"; color_hex: string | null }>;
  showTable?: boolean;
};

export function TransactionsPageClient({
  transactions,
  accounts,
  categories,
  showTable,
}: TransactionsPageClientProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { openEditDialog } = useTransactionsContext();
  const router = useRouter();

  const handleEdit = (transaction: Transaction) => {
    openEditDialog(transaction);
  };

  const handleSuccess = () => {
    setCreateDialogOpen(false);
    router.refresh();
  };

  if (showTable) {
    return <TransactionsTable transactions={transactions} onEdit={handleEdit} />;
  }

  return (
    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Transação</DialogTitle>
          <DialogDescription>
            Registre uma nova receita ou despesa
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          accounts={accounts}
          categories={categories}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

