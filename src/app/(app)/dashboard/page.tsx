import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Wallet,
  TrendingUp,
  Target,
  Receipt,
  BarChart3,
  PieChart,
} from "lucide-react";
import { ChartCashFlow } from "@/components/dashboard/chart-cash-flow";
import { ChartExpensesByCategory } from "@/components/dashboard/chart-expenses-by-category";
import { ChartGoalsProgress } from "@/components/dashboard/chart-goals-progress";
import { ChartBudgetType } from "@/components/dashboard/chart-budget-type";
import { ChartTransactionStatus } from "@/components/dashboard/chart-transaction-status";
import { ChartBalanceEvolution } from "@/components/dashboard/chart-balance-evolution";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { getDashboardOverviewData } from "@/server/dashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    summary,
    cashFlow,
    transactionStatus,
    recentTransactions,
    balanceEvolution,
    expensesByCategory,
    budgetByType,
    goals,
  } = await getDashboardOverviewData(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral das suas finanças
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Contas
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalAccounts}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.activeAccounts} contas ativas
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(summary.totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Em todas as contas
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Metas Ativas
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.activeGoals}
            </div>
            <p className="text-xs text-muted-foreground">
              de {summary.totalGoals} metas
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Transações
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.monthTransactions}
            </div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Análise Detalhada
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Fluxo de Caixa - Receitas vs Despesas */}
            <ChartCashFlow
              data={cashFlow}
            />

            {/* Status das Transações */}
            <ChartTransactionStatus
              data={transactionStatus}
            />
          </div>

          {/* Histórico de Transações Recentes */}
          <RecentTransactions
            transactions={recentTransactions}
          />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Evolução do Saldo */}
            <ChartBalanceEvolution
              data={balanceEvolution}
            />

            {/* Gastos por Categoria */}
            <ChartExpensesByCategory
              data={expensesByCategory}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Progresso das Metas */}
            <ChartGoalsProgress
              data={goals}
            />

            {/* Gastos por Tipo de Orçamento */}
            <ChartBudgetType
              data={budgetByType}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

