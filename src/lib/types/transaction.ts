export type Transaction = {
  id: string;
  account_id: string;
  category_id: string | null;
  description: string;
  amount: number;
  date: string;
  payment_date: string | null;
  status: "PENDING" | "PAID" | null;
  created_at: string;
  recurring_id: string | null;
  account?: { name: string } | null;
  category?: { name: string; type: "INCOME" | "EXPENSE"; color_hex: string | null } | null;
};
