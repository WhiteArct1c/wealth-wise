import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { AccountsPageClient } from "@/components/accounts/accounts-page-client";
import { AccountsProvider } from "@/contexts/accounts-context";
import { AccountsEditDialog } from "@/components/accounts/accounts-edit-dialog";

export default async function AccountsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar contas do usuário
  const { data: accounts, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar contas:", error);
  }

  const accountsData = accounts || [];

  // Buscar transações por conta para calcular saldo atual (derivado)
  const { data: accountTransactions = [] } = await supabase
    .from("transactions")
    .select("account_id, amount, category:categories(type)")
    .eq("user_id", user.id);

  type TxRow = {
    account_id: string;
    amount: number;
    category: {
      type: "INCOME" | "EXPENSE";
    } | null;
  };

  const typedTx = accountTransactions as unknown as TxRow[];

  const netByAccount = typedTx.reduce<Record<string, number>>((acc, tx) => {
    const isExpense = tx.category?.type === "EXPENSE";
    const delta = isExpense ? -tx.amount : tx.amount;
    acc[tx.account_id] = (acc[tx.account_id] ?? 0) + delta;
    return acc;
  }, {});

  const accountsWithBalance = accountsData.map((account) => {
    const net = netByAccount[account.id as keyof typeof netByAccount] ?? 0;
    const currentBalance = (account.initial_balance || 0) + net;
    return {
      ...account,
      current_balance: currentBalance,
    };
  });

  // Calcular totais com base no saldo atual derivado
  const totalAccounts = accountsWithBalance.length;
  const activeAccounts = accountsWithBalance.filter(
    (a) => a.is_active
  ).length;
  const totalBalance = accountsWithBalance.reduce(
    (sum, account) => sum + (account.current_balance || 0),
    0
  );

  return (
    <AccountsProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Contas</h2>
            <p className="text-muted-foreground">
              Gerencie suas fontes de dinheiro
            </p>
          </div>
          <AccountsPageClient accounts={accountsWithBalance} />
        </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contas</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAccounts}</div>
            <p className="text-xs text-muted-foreground">
              {activeAccounts} ativas
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Em todas as contas
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Ativas</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAccounts}</div>
            <p className="text-xs text-muted-foreground">
              De {totalAccounts} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Contas */}
      <Card className="transition-all duration-200">
        <CardHeader>
          <CardTitle>Lista de Contas</CardTitle>
          <CardDescription>
            Todas as suas contas e fontes de dinheiro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountsPageClient accounts={accountsWithBalance} showTable />
        </CardContent>
      </Card>

      {/* Dialog de edição - renderizado uma vez no nível da página */}
      <AccountsEditDialog />
      </div>
    </AccountsProvider>
  );
}

