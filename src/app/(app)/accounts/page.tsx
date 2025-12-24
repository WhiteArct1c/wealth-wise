import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { AccountsPageClient } from "@/components/accounts/accounts-page-client";
import { AccountsProvider } from "@/contexts/accounts-context";
import { AccountsEditDialog } from "@/components/accounts/accounts-edit-dialog";
import { TablePagination } from "@/components/shared/table-pagination";
import { TableFilters } from "@/components/shared/table-filters";
import { ItemsPerPageSelector } from "@/components/shared/items-per-page-selector";
import { applySort, applySearchFilter, type SortConfig } from "@/lib/table-utils";
import { DEFAULT_ITEMS_PER_PAGE } from "@/constants/ui";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    perPage?: string;
    sort?: string;
    order?: "asc" | "desc";
    search?: string;
    type?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const itemsPerPage = Math.max(2, Math.min(100, parseInt(params.perPage || DEFAULT_ITEMS_PER_PAGE.toString(), 10)));
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const offset = (currentPage - 1) * itemsPerPage;
  
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Query base
  let accountsQuery = supabase
    .from("accounts")
    .select("*", { count: "exact" })
    .eq("user_id", user.id);

  // Aplicar busca
  if (params.search) {
    accountsQuery = applySearchFilter(accountsQuery, params.search, "name");
  }

  // Aplicar filtros
  if (params.type) {
    accountsQuery = accountsQuery.eq("type", params.type);
  }
  if (params.status) {
    if (params.status === "active") {
      accountsQuery = accountsQuery.eq("is_active", true);
    } else if (params.status === "inactive") {
      accountsQuery = accountsQuery.eq("is_active", false);
    }
  }

  // Buscar todas as contas primeiro (para calcular saldo e ordenar)
  const { data: allAccounts, error, count } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("Erro ao buscar contas:", error);
  }

  const allAccountsData = allAccounts || [];
  const totalAccounts = count || 0;

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

  // Calcular saldo atual para todas as contas
  let accountsWithBalance = allAccountsData.map((account) => {
    const net = netByAccount[account.id as keyof typeof netByAccount] ?? 0;
    const currentBalance = (account.initial_balance || 0) + net;
    return {
      ...account,
      current_balance: currentBalance,
    };
  });

  // Aplicar busca
  if (params.search) {
    accountsWithBalance = accountsWithBalance.filter((account) =>
      account.name.toLowerCase().includes(params.search!.toLowerCase())
    );
  }

  // Aplicar filtros
  if (params.type) {
    accountsWithBalance = accountsWithBalance.filter((account) => account.type === params.type);
  }
  if (params.status) {
    if (params.status === "active") {
      accountsWithBalance = accountsWithBalance.filter((account) => account.is_active === true);
    } else if (params.status === "inactive") {
      accountsWithBalance = accountsWithBalance.filter((account) => account.is_active === false);
    }
  }

  // Aplicar ordenação
  const sortColumn = params.sort || "created_at";
  const sortOrder = params.order || "desc";
  accountsWithBalance.sort((a, b) => {
    let aVal: any = a[sortColumn as keyof typeof a];
    let bVal: any = b[sortColumn as keyof typeof b];
    
    // Tratamento especial para current_balance
    if (sortColumn === "initial_balance" || sortColumn === "current_balance") {
      aVal = sortColumn === "current_balance" ? a.current_balance : (a.initial_balance || 0);
      bVal = sortColumn === "current_balance" ? b.current_balance : (b.initial_balance || 0);
    }
    
    if (aVal === null || aVal === undefined) aVal = sortColumn.includes("balance") ? 0 : "";
    if (bVal === null || bVal === undefined) bVal = sortColumn.includes("balance") ? 0 : "";
    
    // Tratamento para valores numéricos
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }
    
    // Tratamento para strings
    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });

  // Contar total após filtros (mas antes da paginação)
  const totalAccountsFiltered = accountsWithBalance.length;
  const totalPages = Math.ceil(totalAccountsFiltered / itemsPerPage);
  
  // Aplicar paginação
  const accountsData = accountsWithBalance.slice(offset, offset + itemsPerPage);

  // Usar todas as contas com saldo para calcular estatísticas (sem filtros de busca/status/type)
  // Precisamos recalcular sem os filtros para as estatísticas
  const allAccountsWithBalance = allAccountsData.map((account) => {
    const net = netByAccount[account.id as keyof typeof netByAccount] ?? 0;
    const currentBalance = (account.initial_balance || 0) + net;
    return {
      ...account,
      current_balance: currentBalance,
    };
  });

  // Calcular totais com base em TODAS as contas (para estatísticas)
  const totalAccountsCount = allAccountsWithBalance.length;
  const activeAccounts = allAccountsWithBalance.filter(
    (a) => a.is_active
  ).length;
  const totalBalance = allAccountsWithBalance.reduce(
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
            <div className="text-2xl font-bold">{totalAccountsCount}</div>
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
              De {totalAccountsCount} total
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
        <CardContent className="space-y-4">
          <TableFilters
            searchPlaceholder="Buscar por nome..."
            searchKey="search"
            selectFilters={[
              {
                key: "type",
                label: "Tipo",
                placeholder: "Todos os tipos",
                options: [
                  { value: "CHECKING", label: "Conta Corrente" },
                  { value: "CASH", label: "Dinheiro" },
                  { value: "INVESTMENT", label: "Investimento" },
                ],
              },
              {
                key: "status",
                label: "Status",
                placeholder: "Todos os status",
                options: [
                  { value: "active", label: "Ativa" },
                  { value: "inactive", label: "Inativa" },
                ],
              },
            ]}
          />
          
          <AccountsPageClient accounts={accountsWithBalance} showTable />
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <ItemsPerPageSelector />
            
            {totalPages > 1 ? (
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalAccountsFiltered}
                itemsPerPage={itemsPerPage}
                itemLabel="contas"
              />
            ) : totalAccountsFiltered > 0 ? (
              <div className="text-sm text-muted-foreground">
                Mostrando todas as {totalAccountsFiltered} conta{totalAccountsFiltered !== 1 ? "s" : ""}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de edição - renderizado uma vez no nível da página */}
      <AccountsEditDialog />
      </div>
    </AccountsProvider>
  );
}

