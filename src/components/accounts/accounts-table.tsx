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
import { MoreHorizontal, Pencil, Trash2, Building2, Wallet, PiggyBank } from "lucide-react";
import { useState } from "react";
import { deleteAccount } from "@/app/actions/accounts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TableSortHeader } from "@/components/shared/table-sort-header";

export type Account = {
  id: string;
  name: string;
  type: "CHECKING" | "CASH" | "INVESTMENT";
  initial_balance: number;
  current_balance: number;
  is_active: boolean | null;
  created_at: string;
};

type AccountsTableProps = {
  accounts: Account[];
  onEdit: (account: Account) => void;
};

const accountTypeConfig = {
  CHECKING: {
    label: "Conta Corrente",
    icon: Building2,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  CASH: {
    label: "Dinheiro",
    icon: Wallet,
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  INVESTMENT: {
    label: "Investimento",
    icon: PiggyBank,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
} as const;

export function AccountsTable({ accounts, onEdit }: AccountsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const router = useRouter();

  const formatCurrency = (value: number) => {
    // value já vem em reais do banco (não precisa dividir por 100)
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleDeleteClick = (account: Account) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;

    const result = await deleteAccount(accountToDelete.id);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Conta deletada com sucesso!");
      router.refresh();
    }
    
    setDeleteDialogOpen(false);
    setAccountToDelete(null);
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12">
        <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma conta encontrada</h3>
        <p className="text-muted-foreground">
          Comece criando sua primeira conta
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
                <TableSortHeader column="name">Nome</TableSortHeader>
              </TableHead>
              <TableHead>
                <TableSortHeader column="type">Tipo</TableSortHeader>
              </TableHead>
              <TableHead className="text-right">
                <TableSortHeader column="current_balance" className="justify-end">Saldo Atual</TableSortHeader>
              </TableHead>
              <TableHead className="text-center">
                <TableSortHeader column="is_active" className="justify-center">Status</TableSortHeader>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => {
              const typeConfig = accountTypeConfig[account.type];
              const Icon = typeConfig.icon;

              return (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={typeConfig.color}>
                      <Icon className="mr-1.5 h-3 w-3" />
                      {typeConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(account.current_balance)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={account.is_active ? "default" : "secondary"}
                      className={
                        account.is_active
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }
                    >
                      {account.is_active ? "Ativa" : "Inativa"}
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
                        <DropdownMenuItem onClick={() => onEdit(account)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(account)}
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
            <AlertDialogTitle>Deletar conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A conta{" "}
              <strong>{accountToDelete?.name}</strong> será permanentemente
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

