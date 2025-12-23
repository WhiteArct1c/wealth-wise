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

type CategoryData = {
  name: string;
  value: number;
  color: string;
};

type ChartExpensesByCategoryProps = {
  data: CategoryData[];
};

const chartConfig = {
  value: {
    label: "Valor",
  },
} satisfies ChartConfig;

const COLORS = [
  "#22c55e", // Verde principal
  "#16a34a", // Verde mais escuro
  "#15803d", // Verde médio
  "#10b981", // Verde esmeralda
  "#059669", // Verde água
  "#047857", // Verde escuro
];

export function ChartExpensesByCategory({
  data,
}: ChartExpensesByCategoryProps) {
  if (!data.length) {
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Gastos por Categoria</CardTitle>
          <CardDescription>
            Distribuição dos seus gastos por categoria
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
            <PieIcon className="h-8 w-8 text-muted-foreground/70" />
            <p>Ainda não há gastos categorizados para exibir neste gráfico.</p>
            <p className="text-xs">
              Cadastre transações com categorias para visualizar esta visão.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle>Gastos por Categoria</CardTitle>
        <CardDescription>
          Distribuição dos seus gastos por categoria
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
                  fill={entry.color || COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

