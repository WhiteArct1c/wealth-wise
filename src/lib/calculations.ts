import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

type TxBalanceRow = {
  amount: number;
  category: { type: "INCOME" | "EXPENSE" } | null;
};

/**
 * Calculates the current balance of a single account owned by a user.
 *
 * The balance is derived from the account's `initial_balance` plus the net
 * of all its transactions: income adds to the balance, expenses subtract.
 *
 * All monetary values are in **reais** (the database stores reais, not cents).
 *
 * @param supabase - An authenticated Supabase server client
 * @param userId - The authenticated user's ID (used to scope the query via RLS)
 * @param accountId - The ID of the account to calculate
 * @returns The current balance in reais, or `null` if the account is not found
 */
export async function calculateAccountBalance(
  supabase: SupabaseClient,
  userId: string,
  accountId: string
): Promise<number | null> {
  const { data: account } = await supabase
    .from("accounts")
    .select("initial_balance")
    .eq("id", accountId)
    .eq("user_id", userId)
    .single();

  if (!account) return null;

  const { data: txRows = [] } = await supabase
    .from("transactions")
    .select("amount, category:categories(type)")
    .eq("user_id", userId)
    .eq("account_id", accountId);

  const typedRows = txRows as unknown as TxBalanceRow[];

  const net = typedRows.reduce((sum, tx) => {
    const isExpense = tx.category?.type === "EXPENSE";
    return sum + (isExpense ? -tx.amount : tx.amount);
  }, 0);

  return (account.initial_balance ?? 0) + net;
}
