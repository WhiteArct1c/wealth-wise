"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart as PieIcon } from "lucide-react";

type BudgetTypeData = {
  name: string;
  value: number;
  color: string;
};

type ChartBudgetTypeProps = {
  data: BudgetTypeData[];
};

const chartConfig = {
  value: {
    label: "Valor",
  },
} satisfies ChartConfig;

const BUDGET_COLORS = {
  ESSENTIAL_FIXED: "#ef4444", // Vermelho - essencial fixo
  ESSENTIAL_VARIABLE: "#f59e0b", // Laranja - essencial variável
  DISCRETIONARY: "#8b5cf6", // Roxo - discricionário
};

export function ChartBudgetType({ data }: ChartBudgetTypeProps) {
  if (!data.length) {
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Gastos por Tipo de Orçamento</CardTitle>
          <CardDescription>
            Distribuição entre essenciais fixos, variáveis e discricionários
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
            <PieIcon className="h-8 w-8 text-muted-foreground/70" />
            <p>
              Ainda não há gastos com tipos de orçamento configurados para
              exibir aqui.
            </p>
            <p className="text-xs">
              Defina tipos de orçamento nas categorias para destravar este
              gráfico.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle>Gastos por Tipo de Orçamento</CardTitle>
        <CardDescription>
          Distribuição entre essenciais fixos, variáveis e discricionários
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => {
                    const label = String(name);
                    const color =
                      (item && (item.payload?.color || item.color)) ||
                      "#22c55e";
                    const formatted = `R$ ${Number(value).toLocaleString(
                      "pt-BR",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}`;

                    return (
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-muted-foreground">
                            {label}
                          </span>
                        </div>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {formatted}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || BUDGET_COLORS[entry.name as keyof typeof BUDGET_COLORS] || "#22c55e"}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

