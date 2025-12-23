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
import { Target } from "lucide-react";

type GoalData = {
  name: string;
  atual: number;
  meta: number;
  percentual: number;
};

type ChartGoalsProgressProps = {
  data: GoalData[];
};

const chartConfig = {
  atual: {
    label: "Atual",
    color: "#22c55e",
  },
  meta: {
    label: "Meta",
    color: "#94a3b8",
  },
} satisfies ChartConfig;

export function ChartGoalsProgress({ data }: ChartGoalsProgressProps) {
  if (!data.length) {
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Progresso das Metas</CardTitle>
          <CardDescription>
            Acompanhamento do progresso das suas metas financeiras
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
            <Target className="h-8 w-8 text-muted-foreground/70" />
            <p>Nenhuma meta cadastrada ainda.</p>
            <p className="text-xs">
              Crie metas na tela de Metas para acompanhar seu progresso aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle>Progresso das Metas</CardTitle>
        <CardDescription>
          Acompanhamento do progresso das suas metas financeiras
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 8,
              right: 16,
              top: 12,
              bottom: 8,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              // Mantém rótulos horizontais e mais legíveis
              angle={0}
              textAnchor="middle"
              height={60}
              tickFormatter={(value: string) =>
                value.length > 18 ? `${value.slice(0, 15)}…` : value
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value, name) => {
                    const isAtual = name === "atual";
                    const label = isAtual ? "Atual" : "Meta";
                    const color = isAtual
                      ? "var(--color-atual)"
                      : "var(--color-meta)";
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
            <Bar dataKey="meta" fill="var(--color-meta)" fillOpacity={0.3} radius={4} />
            <Bar dataKey="atual" fill="var(--color-atual)" fillOpacity={0.8} radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

