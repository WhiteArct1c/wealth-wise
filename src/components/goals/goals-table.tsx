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
import {
  MoreVertical,
  Pencil,
  Trash2,
  Target,
  CheckCircle2,
  PiggyBank,
} from "lucide-react";
import { useState } from "react";
import { deleteGoal } from "@/app/actions/goals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { parseLocalDate } from "@/lib/utils";
import { TableSortHeader } from "@/components/shared/table-sort-header";
import type { Goal } from "@/contexts/goals-context";
import { GoalContributionForm } from "./goal-contribution-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Tables } from "@/lib/supabase/types";

type GoalsTableProps = {
  goals: Goal[];
  onEdit: (goal: Goal) => void;
};

export function GoalsTable({ goals, onEdit }: GoalsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);
  const [goalToContribute, setGoalToContribute] = useState<Goal | null>(null);
  const router = useRouter();
  const [accounts, setAccounts] = useState<
    Pick<Tables<"accounts">, "id" | "name">[] | null
  >(null);

  const handleDeleteClick = (goal: Goal) => {
    setGoalToDelete(goal);
    setDeleteDialogOpen(true);
  };

  const handleContributeClick = async (goal: Goal) => {
    setGoalToContribute(goal);
    setContributionDialogOpen(true);

    if (!accounts) {
      try {
        const res = await fetch("/api/accounts/minimal");
        if (res.ok) {
          const data = (await res.json()) as { id: string; name: string }[];
          setAccounts(data);
        }
      } catch {
        // falha silenciosa, o form lida com lista vazia
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!goalToDelete) return;

    const result = await deleteGoal(goalToDelete.id);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Meta removida com sucesso!");
      router.refresh();
    }

    setDeleteDialogOpen(false);
    setGoalToDelete(null);
  };

  const formatCurrency = (value: number | null) => {
    const safe = value ?? 0;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safe);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    const d = parseLocalDate(date);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("pt-BR");
  };

  if (goals.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma meta cadastrada</h3>
        <p className="text-muted-foreground">
          Comece criando sua primeira meta para acompanhar seus objetivos
          financeiros.
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
                <TableSortHeader column="name">Meta</TableSortHeader>
              </TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead className="text-right">
                <TableSortHeader column="current_amount" className="justify-end">Acumulado</TableSortHeader>
              </TableHead>
              <TableHead className="text-right">
                <TableSortHeader column="target_amount" className="justify-end">Meta</TableSortHeader>
              </TableHead>
              <TableHead>
                <TableSortHeader column="deadline">Data limite</TableSortHeader>
              </TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.map((goal) => {
              const current = goal.current_amount ?? 0;
              const target = goal.target_amount || 0;
              const progress =
                target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
              const isCompleted = target > 0 && current >= target;

              return (
                <TableRow key={goal.id}>
                  <TableCell className="font-medium">{goal.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isCompleted
                              ? "bg-emerald-500"
                              : "bg-primary"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{progress}%</span>
                        <span>
                          {formatCurrency(current)} / {formatCurrency(target)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(current)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(target)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(goal.deadline)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={isCompleted ? "default" : "secondary"}
                      className={
                        isCompleted
                          ? "bg-emerald-500 text-emerald-50"
                          : "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                      }
                    >
                      {isCompleted ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Concluída
                        </span>
                      ) : (
                        "Em andamento"
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleContributeClick(goal)}>
                          <PiggyBank className="mr-2 h-4 w-4" />
                          <span>Aportar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(goal)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(goal)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir</span>
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
            <AlertDialogTitle>Excluir meta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A meta{" "}
              <span className="font-semibold">
                {goalToDelete?.name}
              </span>{" "}
              será removida permanentemente.
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

      <Dialog
        open={contributionDialogOpen}
        onOpenChange={(open) => {
          setContributionDialogOpen(open);
          if (!open) {
            setGoalToContribute(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              Aportar na meta{" "}
              <span className="font-semibold">
                {goalToContribute?.name ?? ""}
              </span>
            </DialogTitle>
          </DialogHeader>
          {goalToContribute && accounts && accounts.length > 0 ? (
            <GoalContributionForm
              goalId={goalToContribute.id}
              accounts={accounts}
              onSuccess={() => {
                setContributionDialogOpen(false);
                setGoalToContribute(null);
                router.refresh();
              }}
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              {accounts && accounts.length === 0
                ? "Nenhuma conta disponível para realizar aportes. Crie uma conta primeiro."
                : "Carregando contas disponíveis..."}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}


