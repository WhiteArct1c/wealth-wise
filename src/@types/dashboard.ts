export type CashFlowPoint = {
  month: string;
  receitas: number;
  despesas: number;
};

export type BalanceEvolutionPoint = {
  month: string;
  saldo: number;
};

export type ExpensesByCategoryPoint = {
  name: string;
  value: number;
  color: string;
};

export type BudgetTypePoint = {
  name: string;
  value: number;
  color: string;
};

export type GoalProgressPoint = {
  name: string;
  atual: number;
  meta: number;
  percentual: number;
};

export type TransactionStatusSlice = {
  name: string;
  value: number;
  color: string;
};

export type RecentDashboardTransaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: "PENDING" | "PAID" | null;
  type: "INCOME" | "EXPENSE";
  category?: string | null;
  account?: string | null;
};

export type DashboardOverviewData = {
  summary: {
    totalAccounts: number;
    activeAccounts: number;
    totalBalance: number;
    monthTransactions: number;
    totalGoals: number;
    activeGoals: number;
  };
  cashFlow: CashFlowPoint[];
  transactionStatus: TransactionStatusSlice[];
  recentTransactions: RecentDashboardTransaction[];
  balanceEvolution: BalanceEvolutionPoint[];
  expensesByCategory: ExpensesByCategoryPoint[];
  budgetByType: BudgetTypePoint[];
  goals: GoalProgressPoint[];
};


