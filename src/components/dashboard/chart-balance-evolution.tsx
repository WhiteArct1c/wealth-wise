"use client";

import { Line, LineChart, CartesianGrid, XAxis } from "recharts";
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
import { TrendingUp } from "lucide-react";

type BalanceEvolutionData = {
  month: string;
  saldo: number;
};

type ChartBalanceEvolutionProps = {
  data: BalanceEvolutionData[];
};

const chartConfig = {
  saldo: {
    label: "Saldo",
    color: "#22c55e",
  },
} satisfies ChartConfig;

export function ChartBalanceEvolution({
  data,
}: ChartBalanceEvolutionProps) {
  const hasData = data.some((item) => item.saldo !== 0);

  if (!hasData) {
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Evolução do Saldo</CardTitle>
          <CardDescription>
            Evolução do saldo total ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
            <TrendingUp className="h-8 w-8 text-muted-foreground/70" />
            <p>Ainda não há movimentações suficientes para exibir o saldo.</p>
            <p className="text-xs">
              Registre transações para acompanhar a evolução do seu saldo.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle>Evolução do Saldo</CardTitle>
        <CardDescription>
          Evolução do saldo total ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
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
              <linearGradient id="fillSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-saldo)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-saldo)"
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
                    const label =
                      chartConfig[name as keyof typeof chartConfig]?.label ??
                      name;
                    const formatted = `R$ ${Number(value).toLocaleString(
                      "pt-BR",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}`;

                    return (
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {formatted}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Line
              dataKey="saldo"
              type="natural"
              stroke="var(--color-saldo)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

