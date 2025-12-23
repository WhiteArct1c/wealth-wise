import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, ArrowUpCircle, ArrowDownCircle, Repeat } from "lucide-react";
import { TransactionsPageClient } from "@/components/transactions/transactions-page-client";
import { TransactionsProvider } from "@/contexts/transactions-context";
import { TransactionsEditDialog } from "@/components/transactions/transactions-edit-dialog";
import { TransactionsPagination } from "@/components/transactions/transactions-pagination";
import { ItemsPerPageSelector } from "@/components/transactions/items-per-page-selector";
import { RecurringTransactionsTable, type RecurringTransaction } from "@/components/transactions/recurring-transactions-table";
import { DEFAULT_ITEMS_PER_PAGE } from "@/constants/ui";
import { processDueRecurringTransactions } from "@/app/actions/recurring-transactions";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string }>;
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

  // Gera transações recorrentes vencidas antes de carregar os dados
  await processDueRecurringTransactions(user.id);

  // Buscar total de transações para calcular páginas
  const { count: totalCount } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const totalTransactions = totalCount || 0;
  const totalPages = Math.ceil(totalTransactions / itemsPerPage);

  // Buscar transações do usuário com relacionamentos (paginadas)
  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select(`
      *,
      account:accounts(id, name),
      category:categories(id, name, type, color_hex)
    `)
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .range(offset, offset + itemsPerPage - 1);

  if (transactionsError) {
    console.error("Erro ao buscar transações:", transactionsError);
  }

  // Buscar TODAS as transações para calcular estatísticas (apenas totais)
  const { data: allTransactions } = await supabase
    .from("transactions")
    .select(`
      amount,
      status,
      category:categories(type)
    `)
    .eq("user_id", user.id);

  // Buscar contas do usuário para o formulário
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("name");

  // Buscar categorias do usuário para o formulário
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, type, color_hex")
    .eq("user_id", user.id)
    .order("name");

  // Buscar regras de recorrência ativas
  const { data: recurringTransactions } = await supabase
    .from("recurring_transactions")
    .select(`
      *,
      account:accounts(id, name),
      category:categories(id, name, type, color_hex)
    `)
    .eq("user_id", user.id)
    .in("status", ["ACTIVE", "PAUSED"])
    .order("next_run_date", { ascending: true });

  const transactionsData = transactions || [];
  const accountsData = accounts || [];
  const categoriesData = categories || [];
  const allTransactionsData = allTransactions || [];
  const recurringTransactionsData = (recurringTransactions || []) as unknown as RecurringTransaction[];

  // Calcular estatísticas usando TODAS as transações
  const incomeTransactions = allTransactionsData.filter(
    (t) => {
      const category = Array.isArray(t.category) ? t.category[0] : t.category;
      return category?.type === "INCOME";
    }
  );
  const expenseTransactions = allTransactionsData.filter(
    (t) => {
      const category = Array.isArray(t.category) ? t.category[0] : t.category;
      return category?.type === "EXPENSE";
    }
  );

  const totalIncome = incomeTransactions.reduce(
    (sum, t) => sum + (t.amount || 0),
    0
  );
  const totalExpenses = expenseTransactions.reduce(
    (sum, t) => sum + (t.amount || 0),
    0
  );

  const pendingTransactions = allTransactionsData.filter(
    (t) => t.status === "PENDING"
  );

  const totalPending = pendingTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <TransactionsProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Transações</h2>
            <p className="text-muted-foreground">
              Gerencie suas receitas e despesas
            </p>
          </div>
          <TransactionsPageClient
            transactions={transactionsData}
            accounts={accountsData}
            categories={categoriesData}
          />
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                Transações registradas
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                {incomeTransactions.length} transações
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                {expenseTransactions.length} transações
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Receipt className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalPending)}
              </div>
              <p className="text-xs text-muted-foreground">
                {pendingTransactions.length} transações
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Transações com Tabs */}
        <Card className="transition-all duration-200">
          <CardHeader>
            <CardTitle>Lista de Transações</CardTitle>
            <CardDescription>
              Gerencie suas transações e regras de recorrência
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Todas ({totalTransactions})
                </TabsTrigger>
                <TabsTrigger value="recurring" className="flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  Recorrentes ({recurringTransactionsData.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <TransactionsPageClient
                  transactions={transactionsData}
                  accounts={accountsData}
                  categories={categoriesData}
                  showTable
                />
                
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <ItemsPerPageSelector defaultValue={DEFAULT_ITEMS_PER_PAGE} />
                  
                  {totalPages > 1 ? (
                    <TransactionsPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalTransactions}
                      itemsPerPage={itemsPerPage}
                    />
                  ) : totalTransactions > 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Mostrando todas as {totalTransactions} transação{totalTransactions !== 1 ? "ões" : ""}
                    </div>
                  ) : null}
                </div>
              </TabsContent>

              <TabsContent value="recurring" className="space-y-4">
                <RecurringTransactionsTable
                  recurringTransactions={recurringTransactionsData}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Dialog de edição - renderizado uma vez no nível da página */}
        <TransactionsEditDialog
          accounts={accountsData}
          categories={categoriesData}
        />
      </div>
    </TransactionsProvider>
  );
}

