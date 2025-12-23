"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { goalSchema, type GoalFormValues } from "@/lib/validations/goal";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Target } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { createGoal, updateGoal } from "@/app/actions/goals";

type GoalFormProps = {
  goalId?: string;
  defaultValues?: Partial<GoalFormValues>;
  onSuccess?: () => void;
};

const formatCurrency = (value: number): string => {
  if (!value && value !== 0) return "";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export function GoalForm({ goalId, defaultValues, onSuccess }: GoalFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [deadlineOpen, setDeadlineOpen] = useState(false);

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      target_amount: defaultValues?.target_amount ?? 0,
      current_amount: defaultValues?.current_amount ?? 0,
      deadline: defaultValues?.deadline || null,
    },
  });

  const onSubmit = async (data: GoalFormValues) => {
    setIsLoading(true);
    try {
      let result;

      if (goalId) {
        result = await updateGoal(goalId, data);
      } else {
        result = await createGoal(data);
      }

      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      toast.success(
        goalId ? "Meta atualizada com sucesso!" : "Meta criada com sucesso!"
      );
      form.reset();
      onSuccess?.();
    } catch {
      toast.error("Ocorreu um erro ao salvar a meta");
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Meta</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Reserva de emergência, Viagem, etc."
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Dê um nome claro para identificar facilmente esta meta.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="target_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Meta</FormLabel>
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
                  Valor total que você deseja atingir para esta meta.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="current_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Acumulado</FormLabel>
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
                  Quanto você já acumulou até o momento nesta meta.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data limite (opcional)</FormLabel>
              <Popover open={deadlineOpen} onOpenChange={setDeadlineOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className="w-full pl-3 text-left font-normal"
                      disabled={isLoading}
                    >
                      {field.value ? (
                        format(new Date(`${field.value}T00:00:00`), "PPP", {
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
                    selected={
                      field.value
                        ? new Date(`${field.value}T00:00:00`)
                        : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(format(date, "yyyy-MM-dd"));
                      } else {
                        field.onChange(null);
                      }
                      setDeadlineOpen(false);
                    }}
                    disabled={(date) =>
                      date < new Date("2000-01-01")
                    }
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Defina uma data alvo para ajudar a acompanhar seu progresso.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col text-sm">
              <span className="font-medium text-foreground">
                Acompanhe seu progresso
              </span>
              <span className="text-xs text-muted-foreground">
                As metas aparecem automaticamente no painel de controle para
                você monitorar sua evolução.
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[140px]"
          >
            {isLoading ? "Salvando..." : goalId ? "Atualizar Meta" : "Criar Meta"}
          </Button>
        </div>
      </form>
    </Form>
  );
}


