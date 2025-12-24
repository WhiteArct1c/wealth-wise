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
import { Card, CardContent } from "@/components/ui/card";
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
import { MoreHorizontal, Pause, Play, X, Repeat, ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { setRecurringStatus, deleteRecurringTransaction } from "@/app/actions/recurring-transactions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn, parseLocalDate } from "@/lib/utils";
import { TableSortHeader } from "@/components/shared/table-sort-header";

export type RecurringTransaction = {
  id: string;
  account_id: string;
  category_id: string;
  description: string;
  amount: number; // Em reais do banco
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  day_of_month: number | null;
  start_date: string;
  end_date: string | null;
  next_run_date: string;
  status: string;
  type: string;
  // Relacionamentos
  account?: { name: string } | null;
  category?: { name: string; type: "INCOME" | "EXPENSE"; color_hex: string | null } | null;
};

type RecurringTransactionsTableProps = {
  recurringTransactions: RecurringTransaction[];
  accounts: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; type: "INCOME" | "EXPENSE"; color_hex: string | null }>;
  onEdit?: (recurring: RecurringTransaction) => void;
};

const frequencyLabels: Record<RecurringTransaction["frequency"], string> = {
  DAILY: "Diária",
  WEEKLY: "Semanal",
  MONTHLY: "Mensal",
  YEARLY: "Anual",
};

export function RecurringTransactionsTable({
  recurringTransactions,
  accounts,
  categories,
  onEdit,
}: RecurringTransactionsTableProps) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recurringToUpdate, setRecurringToUpdate] = useState<RecurringTransaction | null>(null);
  const [recurringToDelete, setRecurringToDelete] = useState<RecurringTransaction | null>(null);
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "PAUSED" | "CANCELLED" | null>(null);
  const router = useRouter();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(parseLocalDate(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const handleStatusChange = async (recurring: RecurringTransaction, status: "ACTIVE" | "PAUSED" | "CANCELLED") => {
    setRecurringToUpdate(recurring);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!recurringToUpdate || !newStatus) return;

    // Type guard para garantir que newStatus é um dos valores válidos
    const validStatus: "ACTIVE" | "PAUSED" | "CANCELLED" = newStatus;
    const result = await setRecurringStatus(recurringToUpdate.id, validStatus);

    if (result?.error) {
      toast.error(result.error);
    } else {
      const statusLabel = newStatus === "ACTIVE" ? "ativada" : newStatus === "PAUSED" ? "pausada" : "cancelada";
      toast.success(`Recorrência ${statusLabel} com sucesso!`);
      router.refresh();
    }

    setStatusDialogOpen(false);
    setRecurringToUpdate(null);
    setNewStatus(null);
  };

  const handleDeleteClick = (recurring: RecurringTransaction) => {
    setRecurringToDelete(recurring);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recurringToDelete) return;

    const result = await deleteRecurringTransaction(recurringToDelete.id);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Transação recorrente excluída com sucesso!");
      router.refresh();
    }

    setDeleteDialogOpen(false);
    setRecurringToDelete(null);
  };

  const handleEditClick = (recurring: RecurringTransaction) => {
    onEdit?.(recurring);
  };

  // Calcula os totais
  const totals = recurringTransactions.reduce(
    (acc, recurring) => {
      const isIncome = recurring.category?.type === "INCOME" || recurring.type === "INCOME";
      if (isIncome) {
        acc.totalIncome += recurring.amount;
      } else {
        acc.totalExpenses += recurring.amount;
      }
      return acc;
    },
    { totalIncome: 0, totalExpenses: 0 }
  );

  const netTotal = totals.totalIncome - totals.totalExpenses;

  if (recurringTransactions.length === 0) {
    return (
      <div className="text-center py-12">
        <Repeat className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma recorrência encontrada</h3>
        <p className="text-muted-foreground">
          Crie uma transação recorrente para ver suas regras aqui
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      {/* Resumo dos totais no topo */}
      <Card className="mb-4 min-w-0">
        <CardContent className="pt-6 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0 w-full">
            {totals.totalIncome > 0 && (
              <div className="flex items-center justify-between p-4 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Total de Receitas</p>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400 truncate">
                      {formatCurrency(totals.totalIncome)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {totals.totalExpenses > 0 && (
              <div className="flex items-center justify-between p-4 rounded-lg border bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Total de Despesas</p>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400 truncate">
                      {formatCurrency(totals.totalExpenses)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border min-w-0",
                netTotal >= 0
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                  : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
              )}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {netTotal >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Total Líquido</p>
                  <p
                    className={cn(
                      "text-lg font-semibold truncate",
                      netTotal >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {netTotal >= 0 ? "+" : ""}
                    {formatCurrency(Math.abs(netTotal))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border w-full min-w-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <TableSortHeader column="description" sortParam="recurringSort" orderParam="recurringOrder" pageParam="recurringPage">Descrição</TableSortHeader>
              </TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead className="text-right">
                <TableSortHeader column="amount" className="justify-end" sortParam="recurringSort" orderParam="recurringOrder" pageParam="recurringPage">Valor</TableSortHeader>
              </TableHead>
              <TableHead>
                <TableSortHeader column="frequency" sortParam="recurringSort" orderParam="recurringOrder" pageParam="recurringPage">Frequência</TableSortHeader>
              </TableHead>
              <TableHead>
                <TableSortHeader column="next_run_date" sortParam="recurringSort" orderParam="recurringOrder" pageParam="recurringPage">Próxima Execução</TableSortHeader>
              </TableHead>
              <TableHead className="text-center">
                <TableSortHeader column="status" className="justify-center" sortParam="recurringSort" orderParam="recurringOrder" pageParam="recurringPage">Status</TableSortHeader>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recurringTransactions.map((recurring) => {
              const isIncome = recurring.category?.type === "INCOME" || recurring.type === "INCOME";
              const TypeIcon = isIncome ? ArrowUpCircle : ArrowDownCircle;

              return (
                <TableRow key={recurring.id}>
                  <TableCell className="font-medium">
                    {recurring.description}
                  </TableCell>
                  <TableCell>
                    {recurring.category ? (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1.5 w-fit"
                      >
                        <div
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{
                            backgroundColor: recurring.category.color_hex || "#22c55e",
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
                        {recurring.category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {recurring.account?.name || "-"}
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
                    {formatCurrency(Math.abs(recurring.amount))}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {frequencyLabels[recurring.frequency]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(recurring.next_run_date)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={recurring.status === "ACTIVE" ? "default" : "secondary"}
                      className={
                        recurring.status === "ACTIVE"
                          ? "bg-green-500 text-white"
                          : recurring.status === "PAUSED"
                          ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500"
                          : "bg-gray-500/10 text-gray-600 dark:text-gray-500"
                      }
                    >
                      {recurring.status === "ACTIVE"
                        ? "Ativa"
                        : recurring.status === "PAUSED"
                        ? "Pausada"
                        : "Cancelada"}
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
                        <DropdownMenuItem
                          onClick={() => handleEditClick(recurring)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {recurring.status === "ACTIVE" && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(recurring, "PAUSED")}
                          >
                            <Pause className="mr-2 h-4 w-4" />
                            Pausar
                          </DropdownMenuItem>
                        )}
                        {recurring.status === "PAUSED" && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(recurring, "ACTIVE")}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Reativar
                          </DropdownMenuItem>
                        )}
                        {recurring.status !== "CANCELLED" && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(recurring, "CANCELLED")}
                            className="text-destructive"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancelar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(recurring)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
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

      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {newStatus === "PAUSED"
                ? "Pausar recorrência?"
                : newStatus === "ACTIVE"
                ? "Reativar recorrência?"
                : "Cancelar recorrência?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {newStatus === "PAUSED" && (
                <>
                  A recorrência <strong>{recurringToUpdate?.description}</strong> será pausada.
                  Você pode reativá-la a qualquer momento.
                </>
              )}
              {newStatus === "ACTIVE" && (
                <>
                  A recorrência <strong>{recurringToUpdate?.description}</strong> será reativada
                  e continuará gerando transações automaticamente.
                </>
              )}
              {newStatus === "CANCELLED" && (
                <>
                  Esta ação não pode ser desfeita. A recorrência{" "}
                  <strong>{recurringToUpdate?.description}</strong> será cancelada permanentemente
                  e não gerará mais transações.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusConfirm}
              className={
                newStatus === "CANCELLED"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação recorrente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A transação recorrente{" "}
              <strong>{recurringToDelete?.description}</strong> será excluída permanentemente
              e não gerará mais transações automáticas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

