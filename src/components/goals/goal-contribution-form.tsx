"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { contributeToGoal } from "@/app/actions/goals";
import type { Tables } from "@/lib/supabase/types";

const contributionSchema = z.object({
  account_id: z.string().min(1, "Conta é obrigatória"),
  amount: z
    .number()
    .int("Valor deve ser um número inteiro (em centavos)")
    .min(1, "Valor deve ser maior que zero"),
});

type ContributionFormValues = z.infer<typeof contributionSchema>;

type GoalContributionFormProps = {
  goalId: string;
  accounts: Pick<Tables<"accounts">, "id" | "name">[];
  onSuccess?: () => void;
};

const formatCurrency = (value: number): string => {
  if (!value && value !== 0) return "";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export function GoalContributionForm({
  goalId,
  accounts,
  onSuccess,
}: GoalContributionFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      account_id: accounts[0]?.id ?? "",
      amount: 0,
    },
  });

  const onSubmit = async (data: ContributionFormValues) => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);

      const result = await contributeToGoal({
        goal_id: goalId,
        account_id: data.account_id,
        amount: data.amount,
        date: today,
      });

      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      toast.success("Aporte realizado com sucesso!");
      onSuccess?.();
    } catch {
      toast.error("Ocorreu um erro ao realizar o aporte");
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conta de origem</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLoading || accounts.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma conta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Conta da qual o valor será debitado para o aporte.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor do aporte</FormLabel>
              <FormControl>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-sm font-medium text-muted-foreground pointer-events-none z-10">
                    R$
                  </span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    className="pl-8"
                    value={field.value ? formatCurrency(field.value) : ""}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const numbers = inputValue.replace(/\D/g, "");
                      if (!numbers) {
                        field.onChange(0);
                        return;
                      }
                      const amountInCents = parseInt(numbers, 10) || 0;
                      const positiveAmount = Math.max(0, amountInCents);
                      field.onChange(positiveAmount);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "+") {
                        e.preventDefault();
                      }
                    }}
                    onBlur={() => {
                      field.onBlur();
                    }}
                    onFocus={(e) => {
                      e.target.select();
                    }}
                    disabled={isLoading}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Quanto você deseja aportar nesta meta a partir da conta
                selecionada.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={isLoading || accounts.length === 0}
            className="min-w-[140px]"
          >
            {isLoading ? "Aportando..." : "Confirmar Aporte"}
          </Button>
        </div>
      </form>
    </Form>
  );
}


