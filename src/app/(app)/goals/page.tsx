import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Target, PiggyBank, CheckCircle2, CalendarDays } from "lucide-react";
import { GoalsProvider } from "@/contexts/goals-context";
import { GoalsPageClient } from "@/components/goals/goals-page-client";
import { GoalsEditDialog } from "@/components/goals/goals-edit-dialog";
import { TablePagination } from "@/components/shared/table-pagination";
import { TableFilters } from "@/components/shared/table-filters";
import { ItemsPerPageSelector } from "@/components/shared/items-per-page-selector";
import { applySort, applySearchFilter } from "@/lib/table-utils";
import { DEFAULT_ITEMS_PER_PAGE } from "@/constants/ui";

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    perPage?: string;
    sort?: string;
    order?: "asc" | "desc";
    search?: string;
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

  // Buscar todas as metas para aplicar filtros, ordenação e paginação
  const { data: allGoalsForFilter, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("Erro ao buscar metas:", error);
  }

  let filteredGoals = allGoalsForFilter || [];

  // Aplicar busca em todas as metas
  if (params.search) {
    filteredGoals = filteredGoals.filter((g) =>
      g.name.toLowerCase().includes(params.search!.toLowerCase())
    );
  }

  // Aplicar filtro de status
  if (params.status) {
    if (params.status === "completed") {
      filteredGoals = filteredGoals.filter(
        (g) => (g.current_amount ?? 0) >= (g.target_amount || 0) && g.target_amount > 0
      );
    } else if (params.status === "active") {
      filteredGoals = filteredGoals.filter(
        (g) => (g.current_amount ?? 0) < (g.target_amount || 0)
      );
    }
  }

  // Aplicar ordenação
  const sortColumn = params.sort || "created_at";
  const sortOrder = params.order || "desc";
  filteredGoals.sort((a, b) => {
    let aVal: any = a[sortColumn as keyof typeof a];
    let bVal: any = b[sortColumn as keyof typeof b];
    
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
  const totalGoals = filteredGoals.length;
  const totalPages = Math.ceil(totalGoals / itemsPerPage);
  const goalsData = filteredGoals.slice(offset, offset + itemsPerPage);

  // Buscar TODAS as metas para calcular estatísticas (sem paginação)
  const { data: allGoals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id);

  const allGoalsData = allGoals || [];
  const totalGoalsCount = allGoalsData.length;
  const totalCurrent = allGoalsData.reduce(
    (sum, goal) => sum + (goal.current_amount || 0),
    0
  );
  const activeGoals = allGoalsData.filter(
    (g) => (g.current_amount ?? 0) < (g.target_amount || 0)
  ).length;
  const completedGoals = allGoalsData.filter(
    (g) => (g.current_amount ?? 0) >= (g.target_amount || 0) && g.target_amount > 0
  ).length;
  const totalTarget = allGoalsData.reduce(
    (sum, goal) => sum + (goal.target_amount || 0),
    0
  );
  const overallProgress =
    totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  return (
    <GoalsProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Metas</h2>
            <p className="text-muted-foreground">
              Planeje e acompanhe seus objetivos financeiros de forma clara.
            </p>
          </div>
          <GoalsPageClient goals={goalsData} />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Metas ativas
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeGoals}</div>
              <p className="text-xs text-muted-foreground">
                de {totalGoalsCount} no total
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Valor acumulado
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalCurrent)}
              </div>
              <p className="text-xs text-muted-foreground">
                economizado em todas as metas
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Progresso geral
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{overallProgress}%</div>
              <p className="text-xs text-muted-foreground">
                considerando todas as metas ativas
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Metas concluídas
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedGoals}</div>
              <p className="text-xs text-muted-foreground">
                objetivos alcançados
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="transition-all duration-200">
          <CardHeader>
            <CardTitle>Lista de Metas</CardTitle>
            <CardDescription>
              Todas as suas metas financeiras e seus respectivos progressos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TableFilters
              searchPlaceholder="Buscar por nome..."
              searchKey="search"
              selectFilters={[
                {
                  key: "status",
                  label: "Status",
                  placeholder: "Todos os status",
                  options: [
                    { value: "active", label: "Ativa" },
                    { value: "completed", label: "Completada" },
                  ],
                },
              ]}
            />
            
            <GoalsPageClient goals={goalsData} showTable />
            
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <ItemsPerPageSelector />
              
              {totalPages > 1 ? (
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalGoals}
                  itemsPerPage={itemsPerPage}
                  itemLabel="metas"
                />
              ) : totalGoals > 0 ? (
                <div className="text-sm text-muted-foreground">
                  Mostrando todas as {totalGoals} meta{totalGoals !== 1 ? "s" : ""}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <GoalsEditDialog />
      </div>
    </GoalsProvider>
  );
}


