import type { Tables } from "@/lib/supabase/types";

/**
 * Calculates the next execution date for a recurring transaction.
 *
 * For MONTHLY frequency, respects `dayOfMonth` if provided and clamps to the
 * last day of the month (e.g. day 31 in February → February 28/29).
 * For YEARLY frequency, preserves the original month while advancing the year.
 *
 * @param current - The current (last) execution date
 * @param frequency - Recurrence frequency from the recurring_transactions table
 * @param dayOfMonth - Optional fixed day of month for MONTHLY/YEARLY rules
 * @returns The next Date on which the transaction should run
 */
export function getNextRunDate(
  current: Date,
  frequency: Tables<"recurring_transactions">["frequency"],
  dayOfMonth?: number | null
): Date {
  const d = new Date(current);

  switch (frequency) {
    case "DAILY":
      d.setDate(d.getDate() + 1);
      break;
    case "WEEKLY":
      d.setDate(d.getDate() + 7);
      break;
    case "MONTHLY": {
      const day = dayOfMonth ?? d.getDate();
      d.setMonth(d.getMonth() + 1);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      d.setDate(Math.min(day, lastDay));
      break;
    }
    case "YEARLY": {
      const day = dayOfMonth ?? d.getDate();
      const month = d.getMonth();
      d.setFullYear(d.getFullYear() + 1);
      const lastDay = new Date(d.getFullYear(), month + 1, 0).getDate();
      d.setMonth(month);
      d.setDate(Math.min(day, lastDay));
      break;
    }
    default:
      break;
  }

  return d;
}
