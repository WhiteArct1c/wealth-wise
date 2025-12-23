import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "lucide-react";
import { CategoriesPageClient } from "@/components/categories/categories-page-client";
import { CategoriesProvider } from "@/contexts/categories-context";
import { CategoriesEditDialog } from "@/components/categories/categories-edit-dialog";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar categorias do usuário
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar categorias:", error);
  }

  const categoriesData = categories || [];

  // Calcular estatísticas
  const totalCategories = categoriesData.length;
  const incomeCategories = categoriesData.filter((c) => c.type === "INCOME").length;
  const expenseCategories = categoriesData.filter((c) => c.type === "EXPENSE").length;
  const categoriesWithBudget = categoriesData.filter((c) => c.budget_type !== null).length;

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
              <div className="text-2xl font-bold">{totalCategories}</div>
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
          <CardContent>
            <CategoriesPageClient categories={categoriesData} showTable />
          </CardContent>
        </Card>

        {/* Dialog de edição - renderizado uma vez no nível da página */}
        <CategoriesEditDialog />
      </div>
    </CategoriesProvider>
  );
}

