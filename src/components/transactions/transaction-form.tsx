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
import { Switch } from "@/components/ui/switch";
import { transactionSchema, type TransactionFormValues } from "@/lib/validations/transaction";
import { Loader2, CalendarIcon, ArrowDownCircle, ArrowUpCircle, Repeat } from "lucide-react";
import { toast } from "sonner";
import { createTransaction, updateTransaction } from "@/app/actions/transactions";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type TransactionFormProps = {
  transactionId?: string;
  defaultValues?: Partial<TransactionFormValues>;
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

export function TransactionForm({
  transactionId,
  defaultValues,
  accounts,
  categories,
  onSuccess,
}: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [paymentDateOpen, setPaymentDateOpen] = useState(false);
  const [recurringStartDateOpen, setRecurringStartDateOpen] = useState(false);
  const [recurringEndDateOpen, setRecurringEndDateOpen] = useState(false);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      account_id: defaultValues?.account_id || "",
      category_id: defaultValues?.category_id || null,
      description: defaultValues?.description || "",
      amount: defaultValues?.amount || 0,
      date: defaultValues?.date || format(new Date(), "yyyy-MM-dd"),
      payment_date: defaultValues?.payment_date || null,
      status: defaultValues?.status || "PENDING",
      is_recurring: defaultValues?.is_recurring ?? false,
      frequency: defaultValues?.frequency || null,
      day_of_month: defaultValues?.day_of_month || null,
      recurring_start_date: defaultValues?.recurring_start_date || null,
      recurring_end_date: defaultValues?.recurring_end_date || null,
    },
  });

  const isRecurring = useWatch({ control: form.control, name: "is_recurring" });
  const recurringStartDate = useWatch({ control: form.control, name: "recurring_start_date" });
  const frequency = useWatch({ control: form.control, name: "frequency" });


  const onSubmit = async (data: TransactionFormValues) => {
    setIsLoading(true);
    try {
      let result;

      if (transactionId) {
        result = await updateTransaction(transactionId, data);
      } else {
        result = await createTransaction(data);
      }

      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      toast.success(
        transactionId
          ? "Transação atualizada com sucesso!"
          : "Transação criada com sucesso!"
      );
      form.reset();
      onSuccess?.();
    } catch {
      toast.error("Ocorreu um erro ao salvar a transação");
      setIsLoading(false);
    }
  };

  // Filtra categorias baseado no tipo (se necessário)
  const availableCategories = categories;

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
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="h-auto min-h-11 py-2.5 px-3">
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id} className="py-3">
                      <span className="font-medium">{account.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Selecione a conta onde esta transação ocorreu
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria (Opcional)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                value={field.value || "none"}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="h-auto min-h-11 py-2.5 px-3">
                    <SelectValue placeholder="Selecione a categoria (opcional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none" className="py-3">
                    <span className="font-medium">Nenhuma</span>
                  </SelectItem>
                  {availableCategories.map((category) => {
                    const CategoryIcon =
                      category.type === "INCOME" ? ArrowUpCircle : ArrowDownCircle;
                    return (
                      <SelectItem key={category.id} value={category.id} className="py-3">
                        <div className="flex items-center gap-3 w-full">
                          <div
                            className="h-4 w-4 rounded-full shrink-0"
                            style={{
                              backgroundColor: category.color_hex || "#22c55e",
                            }}
                          />
                          <CategoryIcon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              category.type === "INCOME"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            )}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormDescription>
                Classifique esta transação por categoria (opcional)
              </FormDescription>
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
                  placeholder="Ex: Compra no supermercado"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Descreva esta transação de forma clara
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
                Valor da transação em reais (R$)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Seção de Recorrência - Movida para o topo */}
        <FormField
          control={form.control}
          name="is_recurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  Transação Recorrente
                </FormLabel>
                <FormDescription>
                  Marque se esta transação deve se repetir automaticamente
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          {!isRecurring && (
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data da Transação</FormLabel>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
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
                            format(
                              new Date(`${field.value}T00:00:00`),
                              "PPP",
                              { locale: ptBR }
                            )
                          ) : (
                            <span>Selecione a data</span>
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
                            setDateOpen(false);
                          }
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Data em que a transação ocorreu
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="payment_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Pagamento (Opcional)</FormLabel>
                <Popover open={paymentDateOpen} onOpenChange={setPaymentDateOpen}>
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
                          format(
                            new Date(`${field.value}T00:00:00`),
                            "PPP",
                            { locale: ptBR }
                          )
                        ) : (
                          <span>Selecione a data (opcional)</span>
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
                          setPaymentDateOpen(false);
                        } else {
                          field.onChange(null);
                        }
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Data em que o pagamento foi efetuado (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {isRecurring && (
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Nota:</span> A primeira transação será criada na data de início da recorrência.
              </p>
            </div>
          )}
        </div>

        {/* Campos de Recorrência (aparecem quando is_recurring é true) */}
        {isRecurring && (
          <div className="space-y-4 border-t pt-4">
            <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequência</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY")}
                      value={field.value || ""}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-auto min-h-11 py-2.5 px-3">
                          <SelectValue placeholder="Selecione a frequência" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DAILY" className="py-3">
                          <span className="font-medium">Diária</span>
                        </SelectItem>
                        <SelectItem value="WEEKLY" className="py-3">
                          <span className="font-medium">Semanal</span>
                        </SelectItem>
                        <SelectItem value="MONTHLY" className="py-3">
                          <span className="font-medium">Mensal</span>
                        </SelectItem>
                        <SelectItem value="YEARLY" className="py-3">
                          <span className="font-medium">Anual</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Com que frequência esta transação deve se repetir?
                    </FormDescription>
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
                      <FormLabel>Dia do Mês</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          placeholder="Ex: 5"
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              field.onChange(null);
                            } else {
                              const num = parseInt(value, 10);
                              if (num >= 1 && num <= 31) {
                                field.onChange(num);
                              }
                            }
                          }}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Dia do mês em que a transação deve ocorrer (1-31)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="recurring_start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Início</FormLabel>
                      <Popover open={recurringStartDateOpen} onOpenChange={setRecurringStartDateOpen}>
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
                                format(
                                  new Date(`${field.value}T00:00:00`),
                                  "PPP",
                                  { locale: ptBR }
                                )
                              ) : (
                                <span>Selecione a data</span>
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
                                const dateStr = format(date, "yyyy-MM-dd");
                                field.onChange(dateStr);
                                // Sincroniza com o campo date quando for recorrente
                                form.setValue("date", dateStr);
                                setRecurringStartDateOpen(false);
                              }
                            }}
                            disabled={(date) =>
                              date < new Date("1900-01-01")
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Data em que a recorrência deve começar (e da primeira transação)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recurring_end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Término (Opcional)</FormLabel>
                      <Popover open={recurringEndDateOpen} onOpenChange={setRecurringEndDateOpen}>
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
                                format(
                                  new Date(`${field.value}T00:00:00`),
                                  "PPP",
                                  { locale: ptBR }
                                )
                              ) : (
                                <span>Selecione a data (opcional)</span>
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
                                setRecurringEndDateOpen(false);
                              } else {
                                field.onChange(null);
                              }
                            }}
                            disabled={(date) => {
                              return (
                                date < new Date("1900-01-01") ||
                                (!!recurringStartDate && date < new Date(`${recurringStartDate}T00:00:00`))
                              );
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Data em que a recorrência deve terminar (deixe em branco para continuar indefinidamente)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value as "PENDING" | "PAID")}
                value={field.value || "PENDING"}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="h-auto min-h-11 py-2.5 px-3">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PENDING" className="py-3">
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-3 w-3 rounded-full bg-yellow-500 shrink-0" />
                      <span className="font-medium">Pendente</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PAID" className="py-3">
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-3 w-3 rounded-full bg-green-500 shrink-0" />
                      <span className="font-medium">Pago</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Status atual da transação
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              transactionId ? "Atualizar" : "Criar Transação"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

