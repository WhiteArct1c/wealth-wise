"use client";

import { useForm } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import { accountSchema, type AccountFormValues } from "@/lib/validations/account";
import { Loader2, Wallet, Building2, PiggyBank } from "lucide-react";
import { toast } from "sonner";
import { createAccount, updateAccount } from "@/app/actions/accounts";
import { useState } from "react";

// Função para formatar valor como moeda brasileira
// Recebe centavos (do formulário) e retorna string formatada
const formatCurrency = (value: number): string => {
  if (!value && value !== 0) return "";
  // Converte centavos para reais para exibição
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

type AccountFormProps = {
  accountId?: string;
  defaultValues?: Partial<AccountFormValues>;
  onSuccess?: () => void;
};

const accountTypes = [
  {
    value: "CHECKING",
    label: "Conta Corrente",
    icon: Building2,
    description: "Conta bancária tradicional",
  },
  {
    value: "CASH",
    label: "Dinheiro",
    icon: Wallet,
    description: "Dinheiro físico",
  },
  {
    value: "INVESTMENT",
    label: "Investimento",
    icon: PiggyBank,
    description: "Conta de investimentos",
  },
] as const;

export function AccountForm({ accountId, defaultValues, onSuccess }: AccountFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      type: defaultValues?.type || "CHECKING",
      initial_balance: defaultValues?.initial_balance || 0,
      is_active: defaultValues?.is_active ?? true,
    },
  });

  const onSubmit = async (data: AccountFormValues) => {
    setIsLoading(true);
    try {
      let result;
      
      if (accountId) {
        result = await updateAccount(accountId, data);
      } else {
        result = await createAccount(data);
      }

      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      toast.success(
        accountId ? "Conta atualizada com sucesso!" : "Conta criada com sucesso!"
      );
      form.reset();
      onSuccess?.();
    } catch {
      toast.error("Ocorreu um erro ao salvar a conta");
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
              <FormLabel>Nome da Conta</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Conta Corrente Nubank"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Dê um nome identificador para esta conta
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => {
            const selectedType = accountTypes.find(t => t.value === field.value);
            const IconComponent = selectedType?.icon;
            
            return (
            <FormItem>
              <FormLabel>Tipo de Conta</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="h-auto min-h-11 py-2.5 px-3">
                    <SelectValue placeholder="Selecione o tipo de conta">
                      {field.value && selectedType && IconComponent ? (
                        <div className="flex items-center gap-3 w-full">
                          <IconComponent className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="font-medium text-sm">{selectedType.label}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Selecione o tipo de conta</span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accountTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value} className="py-3">
                        <div className="flex items-center gap-3 w-full">
                          <Icon className="h-5 w-5 shrink-0" />
                          <div className="flex flex-col gap-1 flex-1">
                            <span className="font-medium leading-tight">{type.label}</span>
                            <span className="text-xs text-muted-foreground leading-tight">
                              {type.description}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormDescription>
                Escolha o tipo de conta que melhor descreve esta fonte de dinheiro
              </FormDescription>
              <FormMessage />
            </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="initial_balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Saldo Inicial</FormLabel>
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
                      
                      // Remove tudo exceto números
                      const numbers = inputValue.replace(/\D/g, "");
                      
                      // Se não tem números, define como 0
                      if (!numbers) {
                        field.onChange(0);
                        return;
                      }
                      
                      // Os números digitados são tratados como centavos
                      // Ex: usuário digita "1234" → 1234 centavos → R$ 12,34
                      // Isso significa que cada dígito digitado representa centavos
                      const amountInCents = parseInt(numbers, 10) || 0;
                      
                      // Garante que não seja negativo
                      const positiveAmount = Math.max(0, amountInCents);
                      
                      field.onChange(positiveAmount);
                    }}
                    onKeyDown={(e) => {
                      // Impede a digitação de caracteres negativos
                      if (e.key === "-" || e.key === "+") {
                        e.preventDefault();
                      }
                    }}
                    onBlur={() => {
                      field.onBlur();
                    }}
                    onFocus={(e) => {
                      // Seleciona todo o texto ao focar para facilitar edição
                      e.target.select();
                    }}
                    disabled={isLoading}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Saldo inicial da conta em reais
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Conta Ativa</FormLabel>
                <FormDescription>
                  Desative para ocultar esta conta sem deletá-la
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
              accountId ? "Atualizar" : "Criar Conta"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

