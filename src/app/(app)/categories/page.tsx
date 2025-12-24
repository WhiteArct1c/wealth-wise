import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "lucide-react";
import { CategoriesPageClient } from "@/components/categories/categories-page-client";
import { CategoriesProvider } from "@/contexts/categories-context";
import { CategoriesEditDialog } from "@/components/categories/categories-edit-dialog";
import { TablePagination } from "@/components/shared/table-pagination";
import { TableFilters } from "@/components/shared/table-filters";
import { ItemsPerPageSelector } from "@/components/shared/items-per-page-selector";
import { applySort, applySearchFilter } from "@/lib/table-utils";
import { DEFAULT_ITEMS_PER_PAGE } from "@/constants/ui";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    perPage?: string;
    sort?: string;
    order?: "asc" | "desc";
    search?: string;
    type?: string;
    budget_type?: string;
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
  let categoriesQuery = supabase
    .from("categories")
    .select("*", { count: "exact" })
    .eq("user_id", user.id);

  // Aplicar busca
  if (params.search) {
    categoriesQuery = applySearchFilter(categoriesQuery, params.search, "name");
  }

  // Aplicar filtros
  if (params.type) {
    categoriesQuery = categoriesQuery.eq("type", params.type);
  }
  if (params.budget_type) {
    categoriesQuery = categoriesQuery.eq("budget_type", params.budget_type);
  }

  // Aplicar ordenação
  const sortColumn = params.sort || "created_at";
  const sortOrder = params.order || "desc";
  categoriesQuery = applySort(categoriesQuery, sortColumn, sortOrder, { column: "created_at", order: "desc" });

  // Aplicar paginação
  categoriesQuery = categoriesQuery.range(offset, offset + itemsPerPage - 1);

  const { data: categories, error, count } = await categoriesQuery;

  if (error) {
    console.error("Erro ao buscar categorias:", error);
  }

  const categoriesData = categories || [];
  const totalCategories = count || 0;
  const totalPages = Math.ceil(totalCategories / itemsPerPage);

  // Buscar TODAS as categorias para calcular estatísticas (sem paginação)
  const { data: allCategories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id);

  const allCategoriesData = allCategories || [];

  // Calcular estatísticas
  const totalCategoriesCount = allCategoriesData.length;
  const incomeCategories = allCategoriesData.filter((c) => c.type === "INCOME").length;
  const expenseCategories = allCategoriesData.filter((c) => c.type === "EXPENSE").length;
  const categoriesWithBudget = allCategoriesData.filter((c) => c.budget_type !== null).length;

  return (
    <CategoriesProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Categorias</h2>
            <p className="text-muted-foreground">
              Organize suas receitas e despesas por categorias
            </p>
          </div>
          <CategoriesPageClient categories={categoriesData} />
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Categorias</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCategoriesCount}</div>
              <p className="text-xs text-muted-foreground">
                Categorias criadas
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {incomeCategories}
              </div>
              <p className="text-xs text-muted-foreground">
                Categorias de receita
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <Tag className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {expenseCategories}
              </div>
              <p className="text-xs text-muted-foreground">
                Categorias de despesa
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Orçamento</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoriesWithBudget}</div>
              <p className="text-xs text-muted-foreground">
                Categorias classificadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Categorias */}
        <Card className="transition-all duration-200">
          <CardHeader>
            <CardTitle>Lista de Categorias</CardTitle>
            <CardDescription>
              Todas as suas categorias de receitas e despesas
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
                    { value: "INCOME", label: "Receita" },
                    { value: "EXPENSE", label: "Despesa" },
                  ],
                },
                {
                  key: "budget_type",
                  label: "Tipo de Orçamento",
                  placeholder: "Todos",
                  options: [
                    { value: "ESSENTIAL_FIXED", label: "Essencial Fixo" },
                    { value: "ESSENTIAL_VARIABLE", label: "Essencial Variável" },
                    { value: "DISCRETIONARY", label: "Discricionário" },
                  ],
                },
              ]}
            />
            
            <CategoriesPageClient categories={categoriesData} showTable />
            
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <ItemsPerPageSelector />
              
              {totalPages > 1 ? (
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalCategories}
                  itemsPerPage={itemsPerPage}
                  itemLabel="categorias"
                />
              ) : totalCategories > 0 ? (
                <div className="text-sm text-muted-foreground">
                  Mostrando todas as {totalCategories} categoria{totalCategories !== 1 ? "s" : ""}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Dialog de edição - renderizado uma vez no nível da página */}
        <CategoriesEditDialog />
      </div>
    </CategoriesProvider>
  );
}

