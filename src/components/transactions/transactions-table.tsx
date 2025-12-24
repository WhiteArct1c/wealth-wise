"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Pencil, Trash2, ArrowUpCircle, ArrowDownCircle, Repeat } from "lucide-react";
import { useState } from "react";
import { deleteTransaction } from "@/app/actions/transactions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn, parseLocalDate } from "@/lib/utils";
import { TRANSACTION_STATUS_LABEL } from "@/constants/status";
import { TableSortHeader } from "@/components/shared/table-sort-header";

export type Transaction = {
  id: string;
  account_id: string;
  category_id: string | null;
  description: string;
  amount: number; // Em reais do banco
  date: string;
  payment_date: string | null;
  status: "PENDING" | "PAID" | null;
  created_at: string;
  recurring_id: string | null;
  // Relacionamentos (opcional, pode vir do join)
  account?: { name: string } | null;
  category?: { name: string; type: "INCOME" | "EXPENSE"; color_hex: string | null } | null;
};

type TransactionsTableProps = {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
};

export function TransactionsTable({ transactions, onEdit }: TransactionsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const router = useRouter();

  const formatCurrency = (value: number) => {
    // value já vem em reais do banco
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(parseLocalDate(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    const result = await deleteTransaction(transactionToDelete.id);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Transação deletada com sucesso!");
      router.refresh();
    }

    setDeleteDialogOpen(false);
    setTransactionToDelete(null);
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <ArrowDownCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma transação encontrada</h3>
        <p className="text-muted-foreground">
          Comece criando sua primeira transação
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <TableSortHeader column="date">Data</TableSortHeader>
              </TableHead>
              <TableHead>
                <TableSortHeader column="description">Descrição</TableSortHeader>
              </TableHead>
              <TableHead>
                <TableSortHeader column="category">Categoria</TableSortHeader>
              </TableHead>
              <TableHead>
                <TableSortHeader column="account">Conta</TableSortHeader>
              </TableHead>
              <TableHead className="text-right">
                <TableSortHeader column="amount" className="justify-end">Valor</TableSortHeader>
              </TableHead>
              <TableHead className="text-center">
                <TableSortHeader column="status" className="justify-center">Status</TableSortHeader>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              const isIncome = transaction.category?.type === "INCOME";
              const TypeIcon = isIncome ? ArrowUpCircle : ArrowDownCircle;

              return (
                <TableRow key={transaction.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {transaction.description}
                      {transaction.recurring_id && (
                        <Badge variant="outline" className="text-xs">
                          <Repeat className="h-3 w-3 mr-1" />
                          Recorrente
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {transaction.category ? (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1.5 w-fit"
                      >
                        <div
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{
                            backgroundColor: transaction.category.color_hex || "#22c55e",
                          }}
                        />
                        <TypeIcon
                          className={cn(
                            "h-3 w-3 shrink-0",
                            isIncome
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          )}
                        />
                        {transaction.category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {transaction.account?.name || "-"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold",
                      isIncome
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </TableCell>
                  <TableCell className="text-center">
                  <Badge
                    variant={transaction.status === "PAID" ? "default" : "secondary"}
                    className={
                      transaction.status === "PAID"
                        ? "bg-green-500 text-white"
                        : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500"
                    }
                  >
                    {transaction.status
                      ? TRANSACTION_STATUS_LABEL[transaction.status]
                      : TRANSACTION_STATUS_LABEL.PENDING}
                  </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(transaction)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(transaction)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar transação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A transação{" "}
              <strong>{transactionToDelete?.description}</strong> será permanentemente
              removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

