export const TRANSACTION_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
} as const;

export type TransactionStatus =
  (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS] | null;

export const TRANSACTION_STATUS_LABEL: Record<
  Exclude<TransactionStatus, null>,
  string
> = {
  PENDING: "Pendente",
  PAID: "Pago",
};


