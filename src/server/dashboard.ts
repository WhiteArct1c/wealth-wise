import { createClient } from "@/lib/supabase/server";
import { format, subMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tables } from "@/lib/supabase/types";
import type {
  CashFlowPoint,
  TransactionStatusSlice,
  RecentDashboardTransaction,
  DashboardOverviewData,
  BalanceEvolutionPoint,
  ExpensesByCategoryPoint,
  BudgetTypePoint,
  GoalProgressPoint,
} from "@/@types/dashboard";
import { TRANSACTION_STATUS_LABEL } from "@/constants/status";
import { processDueRecurringTransactions } from "@/app/actions/recurring-transactions";

function getMonthRangeLabel(date: Date) {
  return format(date, "MMM", { locale: ptBR });
}

function getSixMonthsRangeEnd(): Date[] {
  const now = new Date();
  const months: Date[] = [];

  for (let i = 5; i >= 0; i--) {
    months.push(startOfMonth(subMonths(now, i)));
  }

  return months;
}

export async function getDashboardOverviewData(
  userId: string
): Promise<DashboardOverviewData> {
  const supabase = await createClient();

  // Gera transações recorrentes vencidas antes de montar o dashboard
  await processDueRecurringTransactions(userId);

  // Contas do usuário
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, initial_balance, is_active")
    .eq("user_id", userId);

  const safeAccounts = accounts ?? [];

  type AccountRow = {
    id: string;
    initial_balance: number | null;
    is_active: boolean | null;
  };

  const typedAccounts = safeAccounts as unknown as AccountRow[];

  const totalAccounts = typedAccounts.length;
  const activeAccounts = typedAccounts.filter(
    (a) => a.is_active === null || a.is_active === true
  ).length;

  // Buscar todas as transações para derivar saldo atual das contas
  const { data: accountTransactions = [] } = await supabase
    .from("transactions")
    .select("account_id, amount, category:categories(type)")
    .eq("user_id", userId);

  type TxBalanceRow = {
    account_id: string;
    amount: number;
    category: { type: "INCOME" | "EXPENSE" } | null;
  };

  const typedBalanceTx = accountTransactions as unknown as TxBalanceRow[];

  const netByAccount = typedBalanceTx.reduce<Record<string, number>>(
    (acc, tx) => {
      const isExpense = tx.category?.type === "EXPENSE";
      const delta = isExpense ? -tx.amount : tx.amount;
      acc[tx.account_id] = (acc[tx.account_id] ?? 0) + delta;
      return acc;
    },
    {}
  );

  const totalBalance = typedAccounts.reduce((sum, account) => {
    const net = netByAccount[account.id] ?? 0;
    const currentBalance = (account.initial_balance || 0) + net;
    return sum + currentBalance;
  }, 0);

  // Transações dos últimos 6 meses (para fluxo de caixa e status)
  const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5))
    .toISOString()
    .slice(0, 10);

  const { data: transactions = [] } = await supabase
    .from("transactions")
    .select(
      `
      id,
      amount,
      date,
      status,
      category:categories(name, type, color_hex, budget_type)
    `
    )
    .eq("user_id", userId)
    .gte("date", sixMonthsAgo);

  type Tx = {
    id: string;
    amount: number;
    date: string;
    status: Tables<"transactions">["status"];
    category: {
      name: string;
      type: "INCOME" | "EXPENSE";
      color_hex: string | null;
      budget_type:
        | "ESSENTIAL_FIXED"
        | "ESSENTIAL_VARIABLE"
        | "DISCRETIONARY"
        | null;
    } | null;
  };

  const typedTransactions = transactions as unknown as Tx[];

  // Fluxo de caixa por mês (receitas x despesas)
  const monthMap = new Map<
    string,
    { label: string; receitas: number; despesas: number }
  >();

  const monthRefs = getSixMonthsRangeEnd();

  monthRefs.forEach((monthDate) => {
    const key = format(monthDate, "yyyy-MM");
    monthMap.set(key, {
      label: getMonthRangeLabel(monthDate),
      receitas: 0,
      despesas: 0,
    });
  });

  for (const tx of typedTransactions) {
    const d = new Date(tx.date);
    const key = format(d, "yyyy-MM");
    const monthEntry = monthMap.get(key);
    if (!monthEntry) continue;

    if (tx.category?.type === "INCOME") {
      monthEntry.receitas += tx.amount;
    } else if (tx.category?.type === "EXPENSE") {
      monthEntry.despesas += Math.abs(tx.amount);
    }
  }

  const cashFlow: CashFlowPoint[] = Array.from(monthMap.entries()).map(
    ([, value]) => ({
      month: value.label,
      receitas: value.receitas,
      despesas: value.despesas,
    })
  );

  // Evolução do saldo (acumulado) nos mesmos 6 meses
  const balanceEvolution: BalanceEvolutionPoint[] = [];
  let saldoAcumulado = 0;

  monthRefs.forEach((monthDate) => {
    const key = format(monthDate, "yyyy-MM");
    const monthEntry = monthMap.get(key);
    if (!monthEntry) return;

    const net = monthEntry.receitas - monthEntry.despesas;
    saldoAcumulado += net;

    balanceEvolution.push({
      month: getMonthRangeLabel(monthDate),
      saldo: saldoAcumulado,
    });
  });

  // Status de transações do mês atual
  const now = new Date();
  const monthStart = startOfMonth(now).toISOString().slice(0, 10);

  const monthTransactions = typedTransactions.filter(
    (tx) => tx.date >= monthStart
  );

  const paidTotal = monthTransactions
    .filter((tx) => tx.status === "PAID")
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const pendingTotal = monthTransactions
    .filter((tx) => tx.status === "PENDING")
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const transactionStatus: TransactionStatusSlice[] = [
    {
      name: TRANSACTION_STATUS_LABEL.PAID,
      value: paidTotal,
      color: "#22c55e",
    },
    {
      name: TRANSACTION_STATUS_LABEL.PENDING,
      value: pendingTotal,
      color: "#f59e0b",
    },
  ].filter((item) => item.value > 0);

  // Total de transações do mês atual (para o card)
  const monthTransactionsCount = monthTransactions.length;

  // Gastos por categoria (somente despesas pagas do mês atual)
  const expensesByCategoryMap = new Map<string, ExpensesByCategoryPoint>();

  monthTransactions.forEach((tx) => {
    if (tx.category?.type !== "EXPENSE" || tx.status !== "PAID") return;
    const name = tx.category.name || "Outros";
    const existing = expensesByCategoryMap.get(name);
    const value = Math.abs(tx.amount);
    const color = tx.category.color_hex || "#22c55e";

    if (existing) {
      existing.value += value;
    } else {
      expensesByCategoryMap.set(name, { name, value, color });
    }
  });

  const expensesByCategory: ExpensesByCategoryPoint[] = Array.from(
    expensesByCategoryMap.values()
  );

  // Gastos por tipo de orçamento (somente despesas pagas do mês atual)
  const budgetTypeLabels: Record<string, string> = {
    ESSENTIAL_FIXED: "Essenciais Fixos",
    ESSENTIAL_VARIABLE: "Essenciais Variáveis",
    DISCRETIONARY: "Discricionários",
  };

  const budgetTypeColors: Record<string, string> = {
    ESSENTIAL_FIXED: "#ef4444",
    ESSENTIAL_VARIABLE: "#f59e0b",
    DISCRETIONARY: "#8b5cf6",
  };

  const budgetTypeMap = new Map<string, BudgetTypePoint>();

  monthTransactions.forEach((tx) => {
    if (tx.category?.type !== "EXPENSE" || tx.status !== "PAID") return;
    const budgetType = tx.category.budget_type;
    if (!budgetType) return;

    const key = budgetType;
    const existing = budgetTypeMap.get(key);
    const value = Math.abs(tx.amount);

    const name = budgetTypeLabels[budgetType] ?? budgetType;
    const color = budgetTypeColors[budgetType] ?? "#22c55e";

    if (existing) {
      existing.value += value;
    } else {
      budgetTypeMap.set(key, { name, value, color });
    }
  });

  const budgetByType: BudgetTypePoint[] = Array.from(budgetTypeMap.values());

  // Metas (goals)
  const { data: goals = [] } = await supabase
    .from("goals")
    .select("name, target_amount, current_amount")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  type GoalRow = {
    name: string;
    target_amount: number;
    current_amount: number | null;
  };

  const typedGoals = goals as unknown as GoalRow[];

  const goalsProgress: GoalProgressPoint[] = typedGoals.map((goal) => {
    const meta = goal.target_amount || 0;
    const atual = goal.current_amount ?? 0;
    const percentual = meta > 0 ? Math.round((atual / meta) * 100) : 0;

    return {
      name: goal.name,
      atual,
      meta,
      percentual,
    };
  });

  // Transações recentes (últimas 5)
  const { data: recent = [] } = await supabase
    .from("transactions")
    .select(
      `
      id,
      description,
      amount,
      date,
      status,
      category:categories(name, type),
      account:accounts(name)
    `
    )
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(5);

  type RecentTx = {
    id: string;
    description: string;
    amount: number;
    date: string;
    status: Tables<"transactions">["status"];
    category: { name: string; type: "INCOME" | "EXPENSE" } | null;
    account: { name: string } | null;
  };

  const typedRecent = recent as unknown as RecentTx[];

  const recentTransactions: RecentDashboardTransaction[] = typedRecent.map(
    (tx) => ({
      id: tx.id,
      description: tx.description,
      // RecentTransactions espera centavos, então convertemos reais -> centavos
      amount: Math.round(tx.amount * 100),
      date: tx.date,
      status: tx.status,
      type: tx.category?.type ?? "EXPENSE",
      category: tx.category?.name ?? null,
      account: tx.account?.name ?? null,
    })
  );

  return {
    summary: {
      totalAccounts,
      activeAccounts,
      totalBalance,
      monthTransactions: monthTransactionsCount,
      totalGoals: typedGoals.length,
      activeGoals: typedGoals.filter(
        (g) => (g.current_amount ?? 0) < (g.target_amount || 0)
      ).length,
    },
    cashFlow,
    transactionStatus,
    recentTransactions,
    balanceEvolution,
    expensesByCategory,
    budgetByType,
    goals: goalsProgress,
  };
}


