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

export default async function GoalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: goals, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar metas:", error);
  }

  const goalsData = goals || [];

  const totalGoals = goalsData.length;
  const totalCurrent = goalsData.reduce(
    (sum, goal) => sum + (goal.current_amount || 0),
    0
  );
  const activeGoals = goalsData.filter(
    (g) => (g.current_amount ?? 0) < (g.target_amount || 0)
  ).length;
  const completedGoals = goalsData.filter(
    (g) => (g.current_amount ?? 0) >= (g.target_amount || 0) && g.target_amount > 0
  ).length;
  const totalTarget = goalsData.reduce(
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
                de {totalGoals} no total
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
          <CardContent>
            <GoalsPageClient goals={goalsData} showTable />
          </CardContent>
        </Card>

        <GoalsEditDialog />
      </div>
    </GoalsProvider>
  );
}


