"use client";

import { useForm, useWatch } from "react-hook-form";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { z } from "zod";
import { Loader2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { createRecurringTransaction, updateRecurringTransaction, type RecurringFormValues } from "@/app/actions/recurring-transactions";
import { useState } from "react";
import { cn, parseLocalDate } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const recurringSchema = z.object({
  account_id: z.string().min(1, "Conta é obrigatória"),
  category_id: z.string().min(1, "Categoria é obrigatória"),
  description: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(200, "Descrição muito longa"),
  amount: z
    .number()
    .int("Valor deve ser um número inteiro (em centavos)")
    .min(1, "Valor deve ser maior que zero"),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  day_of_month: z.number().int().min(1).max(31).nullable().optional(),
  start_date: z.string().min(1, "Data de início é obrigatória"),
  end_date: z.string().nullable().optional(),
});

type RecurringTransactionFormProps = {
  recurringId?: string;
  defaultValues?: Partial<RecurringFormValues & { amount: number }>;
  accounts: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; type: "INCOME" | "EXPENSE"; color_hex: string | null }>;
  onSuccess?: () => void;
};

// Função para formatar valor como moeda brasileira (recebe centavos, retorna string formatada)
const formatCurrency = (value: number): string => {
  if (!value && value !== 0) return "";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export function RecurringTransactionForm({
  recurringId,
  defaultValues,
  accounts,
  categories,
  onSuccess,
}: RecurringTransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const form = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      account_id: defaultValues?.account_id || "",
      category_id: defaultValues?.category_id || "",
      description: defaultValues?.description || "",
      amount: defaultValues?.amount || 0,
      frequency: defaultValues?.frequency || "MONTHLY",
      day_of_month: defaultValues?.day_of_month || null,
      start_date: defaultValues?.start_date || format(new Date(), "yyyy-MM-dd"),
      end_date: defaultValues?.end_date || null,
    },
  });

  const frequency = useWatch({ control: form.control, name: "frequency" });
  const startDate = useWatch({ control: form.control, name: "start_date" });

  const onSubmit = async (data: RecurringFormValues) => {
    setIsLoading(true);
    try {
      let result;

      if (recurringId) {
        result = await updateRecurringTransaction(recurringId, data);
      } else {
        result = await createRecurringTransaction(data);
      }

      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      toast.success(
        recurringId
          ? "Transação recorrente atualizada com sucesso!"
          : "Transação recorrente criada com sucesso!"
      );
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar a transação recorrente");
      setIsLoading(false);
    }
  };

  // Filtra categorias baseado no tipo selecionado (se necessário)
  const filteredCategories = categories;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conta</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLoading}
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: category.color_hex || "#22c55e",
                          }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Assinatura Netflix"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
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
                    disabled={isLoading}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Valor será debitado/creditado na conta selecionada
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequência</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DAILY">Diária</SelectItem>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                    <SelectItem value="YEARLY">Anual</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {frequency === "MONTHLY" && (
            <FormField
              control={form.control}
              name="day_of_month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dia do mês</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      placeholder="Ex: 15"
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!value) {
                          field.onChange(null);
                          return;
                        }
                        const num = parseInt(value, 10);
                        if (num >= 1 && num <= 31) {
                          field.onChange(num);
                        }
                      }}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Dia do mês em que a transação será executada (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de início</FormLabel>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        {field.value ? (
                          format(parseLocalDate(field.value), "PPP", {
                            locale: ptBR,
                          })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? parseLocalDate(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(format(date, "yyyy-MM-dd"));
                          setStartDateOpen(false);
                        }
                      }}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de término (opcional)</FormLabel>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        {field.value ? (
                          format(parseLocalDate(field.value), "PPP", {
                            locale: ptBR,
                          })
                        ) : (
                          <span>Sem data de término</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? parseLocalDate(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(format(date, "yyyy-MM-dd"));
                        } else {
                          field.onChange(null);
                        }
                        setEndDateOpen(false);
                      }}
                      disabled={(date) =>
                        (startDate && date < parseLocalDate(startDate)) ||
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Deixe em branco para recorrência sem fim
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : recurringId ? (
              "Atualizar"
            ) : (
              "Criar"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

