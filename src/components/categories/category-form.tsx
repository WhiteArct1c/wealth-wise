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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { categorySchema, type CategoryFormValues } from "@/lib/validations/category";
import { Loader2, ArrowDownCircle, ArrowUpCircle, Palette, Check } from "lucide-react";
import { toast } from "sonner";
import { createCategory, updateCategory } from "@/app/actions/categories";
import { useState } from "react";
import { cn } from "@/lib/utils";

type CategoryFormProps = {
  categoryId?: string;
  defaultValues?: Partial<CategoryFormValues>;
  onSuccess?: () => void;
};

const categoryTypes = [
  {
    value: "INCOME",
    label: "Receita",
    icon: ArrowUpCircle,
    description: "Categoria para receitas",
    color: "text-green-600 dark:text-green-400",
  },
  {
    value: "EXPENSE",
    label: "Despesa",
    icon: ArrowDownCircle,
    description: "Categoria para despesas",
    color: "text-red-600 dark:text-red-400",
  },
] as const;

const budgetTypes = [
  {
    value: "ESSENTIAL_FIXED",
    label: "Essencial Fixo",
    description: "Gastos essenciais fixos (aluguel, energia, etc.)",
  },
  {
    value: "ESSENTIAL_VARIABLE",
    label: "Essencial Variável",
    description: "Gastos essenciais variáveis (alimentação, transporte, etc.)",
  },
  {
    value: "DISCRETIONARY",
    label: "Discricionário",
    description: "Gastos não essenciais (lazer, entretenimento, etc.)",
  },
] as const;

// Paleta de cores predefinidas
const colorPalette = [
  "#22c55e", // Verde
  "#10b981", // Verde médio
  "#059669", // Verde escuro
  "#3b82f6", // Azul
  "#6366f1", // Índigo
  "#8b5cf6", // Roxo
  "#a855f7", // Roxo claro
  "#ec4899", // Rosa
  "#f43f5e", // Vermelho
  "#ef4444", // Vermelho claro
  "#f59e0b", // Laranja
  "#eab308", // Amarelo
  "#84cc16", // Lima
  "#14b8a6", // Ciano
  "#06b6d4", // Ciano claro
  "#64748b", // Cinza
];

export function CategoryForm({ categoryId, defaultValues, onSuccess }: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: defaultValues?.name || "",
      type: defaultValues?.type || "EXPENSE",
      budget_type: defaultValues?.budget_type || null,
      color_hex: defaultValues?.color_hex || "#22c55e",
      icon_slug: defaultValues?.icon_slug || null,
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    setIsLoading(true);
    try {
      let result;
      
      if (categoryId) {
        result = await updateCategory(categoryId, data);
      } else {
        result = await createCategory(data);
      }

      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      toast.success(
        categoryId ? "Categoria atualizada com sucesso!" : "Categoria criada com sucesso!"
      );
      form.reset();
      onSuccess?.();
    } catch {
      toast.error("Ocorreu um erro ao salvar a categoria");
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
              <FormLabel>Nome da Categoria</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Alimentação"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Dê um nome identificador para esta categoria
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => {
            const selectedTypeConfig = categoryTypes.find(
              (t) => t.value === field.value
            );
            const TypeIcon = selectedTypeConfig?.icon;
            
            return (
            <FormItem>
              <FormLabel>Tipo de Categoria</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="h-auto min-h-11 py-2.5 px-3">
                    <SelectValue placeholder="Selecione o tipo de categoria">
                      {field.value && selectedTypeConfig && TypeIcon ? (
                        <div className="flex items-center gap-3 w-full">
                          <TypeIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="font-medium text-sm">
                            {selectedTypeConfig.label}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Selecione o tipo de categoria
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categoryTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value} className="py-3">
                        <div className="flex items-center gap-3 w-full">
                          <Icon className={cn("h-5 w-5 shrink-0", type.color)} />
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
                Escolha se esta categoria é para receitas ou despesas
              </FormDescription>
              <FormMessage />
            </FormItem>
            );
          }}
        />

        {/* React Compiler warning é esperado aqui por conta do watch() do RHF */}
        {/* eslint-disable-next-line react-hooks/incompatible-library */}
        {form.watch("type") === "EXPENSE" && (
          <FormField
            control={form.control}
            name="budget_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Orçamento</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "none" ? null : value);
                  }}
                  value={field.value || "none"}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="h-auto min-h-11 py-2.5 px-3">
                      <SelectValue placeholder="Selecione o tipo de orçamento (opcional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none" className="py-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium leading-tight">Nenhum</span>
                        <span className="text-xs text-muted-foreground leading-tight">
                          Não categorizar por orçamento
                        </span>
                      </div>
                    </SelectItem>
                    {budgetTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="py-3">
                        <div className="flex flex-col gap-1 flex-1">
                          <span className="font-medium leading-tight">{type.label}</span>
                          <span className="text-xs text-muted-foreground leading-tight">
                            {type.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Classifique esta categoria de despesa por tipo de orçamento (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="color_hex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor</FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className="h-5 w-5 rounded-full border-2 border-border shrink-0"
                          style={{ backgroundColor: field.value || "#22c55e" }}
                        />
                        <span className="flex-1">
                          {field.value || "Selecione uma cor"}
                        </span>
                        <Palette className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="start">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Selecione uma cor</div>
                      <div className="grid grid-cols-8 gap-2">
                        {colorPalette.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => field.onChange(color)}
                            className={cn(
                              "h-8 w-8 rounded-full border-2 transition-all hover:scale-110",
                              field.value === color
                                ? "border-foreground ring-2 ring-offset-2 ring-primary"
                                : "border-border"
                            )}
                            style={{ backgroundColor: color }}
                          >
                            {field.value === color && (
                              <Check className="h-4 w-4 text-white m-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="pt-2 border-t">
                        <Input
                          type="text"
                          placeholder="#22c55e"
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                              field.onChange(value || null);
                            }
                          }}
                          className="font-mono text-sm"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormDescription>
                Escolha uma cor para identificar esta categoria visualmente
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
              categoryId ? "Atualizar" : "Criar Categoria"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

