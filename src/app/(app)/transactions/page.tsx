import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, ArrowUpCircle, ArrowDownCircle, Repeat } from "lucide-react";
import { TransactionsPageClient } from "@/components/transactions/transactions-page-client";
import { TransactionsProvider } from "@/contexts/transactions-context";
import { TransactionsEditDialog } from "@/components/transactions/transactions-edit-dialog";
import { TablePagination } from "@/components/shared/table-pagination";
import { TableFilters } from "@/components/shared/table-filters";
import { ItemsPerPageSelector } from "@/components/shared/items-per-page-selector";
import { RecurringTransactionsWrapper } from "@/components/transactions/recurring-transactions-wrapper";
import { DEFAULT_ITEMS_PER_PAGE } from "@/constants/ui";
import { processDueRecurringTransactions } from "@/app/actions/recurring-transactions";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    perPage?: string;
    sort?: string;
    order?: "asc" | "desc";
    search?: string;
    account?: string;
    category?: string;
    status?: string;
    type?: string;
    recurringPage?: string;
    recurringPerPage?: string;
    recurringSort?: string;
    recurringOrder?: "asc" | "desc";
    recurringSearch?: string;
    recurringStatus?: string;
    recurringType?: string;
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

  // Gera transações recorrentes vencidas antes de carregar os dados
  await processDueRecurringTransactions(user.id);

  // Buscar todas as transações primeiro (para aplicar filtros e ordenação)
  const { data: allTransactionsForFilter } = await supabase
    .from("transactions")
    .select(`
      *,
      account:accounts(id, name),
      category:categories(id, name, type, color_hex)
    `)
    .eq("user_id", user.id);

  let filteredTransactions = allTransactionsForFilter || [];

  // Aplicar busca
  if (params.search) {
    filteredTransactions = filteredTransactions.filter((t) =>
      t.description?.toLowerCase().includes(params.search!.toLowerCase())
    );
  }

  // Aplicar filtros
  if (params.account) {
    filteredTransactions = filteredTransactions.filter((t) => t.account_id === params.account);
  }
  if (params.category) {
    filteredTransactions = filteredTransactions.filter((t) => t.category_id === params.category);
  }
  if (params.status) {
    filteredTransactions = filteredTransactions.filter((t) => t.status === params.status);
  }
  if (params.type) {
    filteredTransactions = filteredTransactions.filter((t) => {
      const category = Array.isArray(t.category) ? t.category[0] : t.category;
      return category?.type === params.type;
    });
  }

  // Aplicar ordenação
  const sortColumn = params.sort || "date";
  const sortOrder = params.order || "desc";
  filteredTransactions.sort((a, b) => {
    let aVal: any = a[sortColumn as keyof typeof a];
    let bVal: any = b[sortColumn as keyof typeof b];
    
    // Tratamento especial para relacionamentos
    if (sortColumn === "account") {
      aVal = Array.isArray(a.account) ? a.account[0]?.name : a.account?.name;
      bVal = Array.isArray(b.account) ? b.account[0]?.name : b.account?.name;
    } else if (sortColumn === "category") {
      aVal = Array.isArray(a.category) ? a.category[0]?.name : a.category?.name;
      bVal = Array.isArray(b.category) ? b.category[0]?.name : b.category?.name;
    }
    
    if (aVal === null || aVal === undefined) aVal = "";
    if (bVal === null || bVal === undefined) bVal = "";
    
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

  // Aplicar paginação
  const totalTransactions = filteredTransactions.length;
  const totalPages = Math.ceil(totalTransactions / itemsPerPage);
  const transactionsData = filteredTransactions.slice(offset, offset + itemsPerPage);

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

  // Buscar todas as transações recorrentes (com paginação, ordenação e filtros)
  const recurringPage = Math.max(1, parseInt(params.recurringPage || "1", 10));
  const recurringPerPage = Math.max(2, Math.min(100, parseInt(params.recurringPerPage || DEFAULT_ITEMS_PER_PAGE.toString(), 10)));
  const recurringOffset = (recurringPage - 1) * recurringPerPage;

  const { data: allRecurringTransactions } = await supabase
    .from("recurring_transactions")
    .select(`
      *,
      account:accounts(id, name),
      category:categories(id, name, type, color_hex)
    `)
    .eq("user_id", user.id)
    .in("status", ["ACTIVE", "PAUSED"]);

  let filteredRecurring = (allRecurringTransactions || []) as unknown as RecurringTransaction[];

  // Aplicar busca
  if (params.recurringSearch) {
    filteredRecurring = filteredRecurring.filter((r) =>
      r.description?.toLowerCase().includes(params.recurringSearch!.toLowerCase())
    );
  }

  // Aplicar filtro de status
  if (params.recurringStatus) {
    filteredRecurring = filteredRecurring.filter((r) => 
      r.status.toLowerCase() === params.recurringStatus!.toLowerCase()
    );
  }

  // Aplicar filtro de tipo
  if (params.recurringType) {
    filteredRecurring = filteredRecurring.filter((r) => {
      const categoryType = r.category?.type || r.type;
      return categoryType === params.recurringType;
    });
  }

  // Aplicar ordenação
  const recurringSort = params.recurringSort || "next_run_date";
  const recurringOrder = params.recurringOrder || "asc";
  filteredRecurring.sort((a, b) => {
    let aVal: any = a[recurringSort as keyof typeof a];
    let bVal: any = b[recurringSort as keyof typeof b];
    
    // Tratamento especial para relacionamentos
    if (recurringSort === "account") {
      aVal = a.account?.name || "";
      bVal = b.account?.name || "";
    } else if (recurringSort === "category") {
      aVal = a.category?.name || "";
      bVal = b.category?.name || "";
    }
    
    // Tratamento especial para valores numéricos (amount)
    if (recurringSort === "amount") {
      aVal = a.amount || 0;
      bVal = b.amount || 0;
      return recurringOrder === "asc" ? aVal - bVal : bVal - aVal;
    }
    
    // Tratamento especial para datas (next_run_date, start_date, end_date)
    if (recurringSort === "next_run_date" || recurringSort === "start_date" || recurringSort === "end_date") {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
      return recurringOrder === "asc" ? aVal - bVal : bVal - aVal;
    }
    
    if (aVal === null || aVal === undefined) aVal = "";
    if (bVal === null || bVal === undefined) bVal = "";
    
    // Tratamento para valores numéricos
    if (typeof aVal === "number" && typeof bVal === "number") {
      return recurringOrder === "asc" ? aVal - bVal : bVal - aVal;
    }
    
    // Tratamento para strings
    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (recurringOrder === "asc") {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });

  // Aplicar paginação
  const totalRecurring = filteredRecurring.length;
  const totalRecurringPages = Math.ceil(totalRecurring / recurringPerPage);
  const recurringTransactionsData = filteredRecurring.slice(recurringOffset, recurringOffset + recurringPerPage);

  const accountsData = accounts || [];
  const categoriesData = categories || [];
  const allTransactionsData = allTransactions || [];

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
        <Card className="transition-all duration-200 min-w-0">
          <CardHeader>
            <CardTitle>Lista de Transações</CardTitle>
            <CardDescription>
              Gerencie suas transações e regras de recorrência
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <Tabs defaultValue="all" className="space-y-4 w-full min-w-0">
              <TabsList>
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Todas ({totalTransactions})
                </TabsTrigger>
                <TabsTrigger value="recurring" className="flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  Recorrentes ({totalRecurring})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <TableFilters
                  searchPlaceholder="Buscar por descrição..."
                  searchKey="search"
                  selectFilters={[
                    {
                      key: "account",
                      label: "Conta",
                      placeholder: "Todas as contas",
                      options: accountsData.map((acc) => ({
                        value: acc.id,
                        label: acc.name,
                      })),
                    },
                    {
                      key: "category",
                      label: "Categoria",
                      placeholder: "Todas as categorias",
                      options: categoriesData.map((cat) => ({
                        value: cat.id,
                        label: cat.name,
                      })),
                    },
                    {
                      key: "status",
                      label: "Status",
                      placeholder: "Todos os status",
                      options: [
                        { value: "PENDING", label: "Pendente" },
                        { value: "PAID", label: "Paga" },
                      ],
                    },
                    {
                      key: "type",
                      label: "Tipo",
                      placeholder: "Todos os tipos",
                      options: [
                        { value: "INCOME", label: "Receita" },
                        { value: "EXPENSE", label: "Despesa" },
                      ],
                    },
                  ]}
                />
                
                <TransactionsPageClient
                  transactions={transactionsData}
                  accounts={accountsData}
                  categories={categoriesData}
                  showTable
                />
                
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <ItemsPerPageSelector />
                  
                  {totalPages > 1 ? (
                    <TablePagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalTransactions}
                      itemsPerPage={itemsPerPage}
                      itemLabel="transações"
                    />
                  ) : totalTransactions > 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Mostrando todas as {totalTransactions} transação{totalTransactions !== 1 ? "ões" : ""}
                    </div>
                  ) : null}
                </div>
              </TabsContent>

              <TabsContent value="recurring" className="space-y-4 min-w-0">
                <TableFilters
                  searchPlaceholder="Buscar por descrição..."
                  searchKey="recurringSearch"
                  selectFilters={[
                    {
                      key: "recurringStatus",
                      label: "Status",
                      placeholder: "Todos os status",
                      options: [
                        { value: "active", label: "Ativa" },
                        { value: "paused", label: "Pausada" },
                      ],
                    },
                    {
                      key: "recurringType",
                      label: "Tipo",
                      placeholder: "Todos os tipos",
                      options: [
                        { value: "INCOME", label: "Receita" },
                        { value: "EXPENSE", label: "Despesa" },
                      ],
                    },
                  ]}
                />
                
                <RecurringTransactionsWrapper
                  recurringTransactions={recurringTransactionsData}
                  accounts={accountsData}
                  categories={categoriesData}
                />
                
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <ItemsPerPageSelector />
                  
                  {totalRecurringPages > 1 ? (
                    <TablePagination
                      currentPage={recurringPage}
                      totalPages={totalRecurringPages}
                      totalItems={totalRecurring}
                      itemsPerPage={recurringPerPage}
                      itemLabel="transações recorrentes"
                    />
                  ) : totalRecurring > 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Mostrando todas as {totalRecurring} transação{totalRecurring !== 1 ? "ões" : ""} recorrente{totalRecurring !== 1 ? "s" : ""}
                    </div>
                  ) : null}
                </div>
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

