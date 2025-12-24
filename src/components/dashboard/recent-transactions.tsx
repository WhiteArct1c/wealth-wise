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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { TRANSACTION_STATUS_LABEL } from "@/constants/status";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseLocalDate } from "@/lib/utils";

type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: "PENDING" | "PAID" | null;
  type: "INCOME" | "EXPENSE";
  category?: string | null;
  account?: string | null;
};

type RecentTransactionsProps = {
  transactions: Transaction[];
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatCurrency = (value: number) => {
    // O valor no Supabase está em centavos (integer), então dividimos por 100
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Math.abs(value) / 100);
  };

  const formatDate = (dateString: string) => {
    return format(parseLocalDate(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  if (transactions.length === 0) {
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>
            Últimas movimentações financeiras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma transação encontrada
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
        <CardDescription>
          Últimas {transactions.length} movimentações financeiras
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {transaction.type === "INCOME" ? (
                    <ArrowUpCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4 text-destructive" />
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {transaction.description}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {transaction.category || "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {transaction.account || "-"}
                </TableCell>
                <TableCell
                  className={`text-right font-semibold ${
                    transaction.type === "INCOME"
                      ? "text-primary"
                      : "text-destructive"
                  }`}
                >
                  {transaction.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(transaction.date)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={
                      transaction.status === "PAID"
                        ? "default"
                        : "secondary"
                    }
                    className={
                      transaction.status === "PAID"
                        ? "bg-primary text-primary-foreground"
                        : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500"
                    }
                  >
                    {transaction.status
                      ? TRANSACTION_STATUS_LABEL[transaction.status]
                      : TRANSACTION_STATUS_LABEL.PENDING}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

