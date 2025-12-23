"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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

type MonthlyComparisonData = {
  month: string;
  receitas: number;
  despesas: number;
};

type ChartMonthlyComparisonProps = {
  data: MonthlyComparisonData[];
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

export function ChartMonthlyComparison({
  data,
}: ChartMonthlyComparisonProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle>Receitas vs Despesas</CardTitle>
        <CardDescription>
          Comparação mensal de receitas e despesas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 0,
              right: 10,
            }}
          >
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
                  indicator="line"
                  labelFormatter={(value) => value}
                  formatter={(value) => [
                    `R$ ${Number(value).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`,
                    "",
                  ]}
                />
              }
            />
            <Bar dataKey="receitas" fill="var(--color-receitas)" fillOpacity={0.8} radius={4} />
            <Bar dataKey="despesas" fill="var(--color-despesas)" fillOpacity={0.8} radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

