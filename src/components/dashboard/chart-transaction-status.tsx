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

type TransactionStatusData = {
  name: string;
  value: number;
  color: string;
};

type ChartTransactionStatusProps = {
  data: TransactionStatusData[];
};

const chartConfig = {
  value: {
    label: "Valor",
  },
} satisfies ChartConfig;

const STATUS_COLORS = {
  PENDING: "#f59e0b", // Laranja - pendente
  PAID: "#22c55e", // Verde - pago
};

export function ChartTransactionStatus({
  data,
}: ChartTransactionStatusProps) {
  if (!data.length) {
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Status das Transações</CardTitle>
          <CardDescription>
            Transações pendentes vs pagas deste mês
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
            <PieIcon className="h-8 w-8 text-muted-foreground/70" />
            <p>Não há transações neste mês para exibir o status.</p>
            <p className="text-xs">
              Crie novas transações para acompanhar pendentes e pagas.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle>Status das Transações</CardTitle>
        <CardDescription>
          Transações pendentes vs pagas deste mês
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
                  fill={entry.color || STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || "#22c55e"}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

