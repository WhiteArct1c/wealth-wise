"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
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
import { BarChart3 } from "lucide-react";

type CashFlowData = {
  month: string;
  receitas: number;
  despesas: number;
};

type ChartCashFlowProps = {
  data: CashFlowData[];
};

const chartConfig = {
  receitas: {
    label: "Receitas",
    color: "#22c55e", // Verde para receitas
  },
  despesas: {
    label: "Despesas",
    color: "#ef4444", // Vermelho para despesas
  },
} satisfies ChartConfig;

export function ChartCashFlow({ data }: ChartCashFlowProps) {
  const hasData = data.some(
    (item) => item.receitas !== 0 || item.despesas !== 0
  );

  if (!hasData) {
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Fluxo de Caixa</CardTitle>
          <CardDescription>
            Receitas e despesas dos últimos 6 meses
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
            <BarChart3 className="h-8 w-8 text-muted-foreground/70" />
            <p>
              Ainda não há dados suficientes para exibir o fluxo de caixa.
            </p>
            <p className="text-xs">
              Registre receitas e despesas para ver este gráfico ganhar vida.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle>Fluxo de Caixa</CardTitle>
        <CardDescription>
          Receitas e despesas dos últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 8,
              right: 16,
              top: 12,
              bottom: 4,
            }}
          >
            <defs>
              <linearGradient id="fillReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-receitas)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-receitas)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-despesas)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-despesas)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) => value}
                  formatter={(value, name) => {
                    const key = name as keyof typeof chartConfig;
                    const cfg = chartConfig[key];
                    const label =
                      key === "receitas"
                        ? "Receita"
                        : key === "despesas"
                          ? "Despesa"
                          : cfg?.label ?? name;

                    const colorVar =
                      key === "receitas"
                        ? "var(--color-receitas)"
                        : key === "despesas"
                          ? "var(--color-despesas)"
                          : "var(--color-foreground)";

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
                            style={{ backgroundColor: colorVar }}
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
            <Area
              dataKey="receitas"
              type="natural"
              fill="url(#fillReceitas)"
              stroke="var(--color-receitas)"
              stackId="a"
            />
            <Area
              dataKey="despesas"
              type="natural"
              fill="url(#fillDespesas)"
              stroke="var(--color-despesas)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

