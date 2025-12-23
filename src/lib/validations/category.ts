import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  type: z.enum(["INCOME", "EXPENSE"]),
  budget_type: z.enum(["ESSENTIAL_FIXED", "ESSENTIAL_VARIABLE", "DISCRETIONARY"]).nullable().optional(),
  color_hex: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => !val || val === "" || /^#[0-9A-Fa-f]{6}$/.test(val),
      "Cor deve estar no formato hexadecimal (#RRGGBB)"
    )
    .transform((val) => (val === "" ? null : val)),
  icon_slug: z.string().nullable().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

