import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a value in reais (from the database) as a BRL currency string.
 * Use this in tables and display components.
 *
 * @param valueInReais - Monetary value already in reais (e.g. 1234.56)
 * @returns Formatted string, e.g. "R$ 1.234,56"
 */
export function formatCurrency(valueInReais: number | null): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInReais ?? 0);
}

/**
 * Formats an integer value in cents for display inside form inputs.
 * Does NOT include the "R$" prefix — the field label handles that.
 *
 * @param valueInCents - Monetary value in cents (e.g. 123456)
 * @returns Formatted string, e.g. "1.234,56"
 */
export function formatCurrencyInput(valueInCents: number): string {
  if (!valueInCents && valueInCents !== 0) return "";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valueInCents / 100);
}

/**
 * Parses a date string (YYYY-MM-DD) as a local date, not UTC.
 * This prevents timezone issues where dates appear one day earlier.
 * 
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object in local timezone
 */
export function parseLocalDate(dateString: string): Date {
  // If the string is already in ISO format (YYYY-MM-DD), parse it as local
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  // Fallback to standard Date parsing for other formats
  return new Date(dateString);
}
