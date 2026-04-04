export type Account = {
  id: string;
  name: string;
  type: "CHECKING" | "CASH" | "INVESTMENT";
  initial_balance: number;
  current_balance: number;
  is_active: boolean | null;
  created_at: string;
};
