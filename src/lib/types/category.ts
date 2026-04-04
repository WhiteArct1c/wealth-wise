export type Category = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  budget_type: "ESSENTIAL_FIXED" | "ESSENTIAL_VARIABLE" | "DISCRETIONARY" | null;
  color_hex: string | null;
  icon_slug: string | null;
  created_at: string;
};
