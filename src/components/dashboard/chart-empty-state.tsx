import type { LucideIcon } from "lucide-react";

type ChartEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
};

/**
 * Standard empty-state content rendered inside a chart's CardContent when
 * there is not enough data to draw the chart.
 *
 * Wrap this in `<CardContent className="flex h-[300px] items-center justify-center">`.
 */
export function ChartEmptyState({
  icon: Icon,
  title,
  description,
}: ChartEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
      <Icon className="h-8 w-8 text-muted-foreground/70" />
      <p>{title}</p>
      {description && <p className="text-xs">{description}</p>}
    </div>
  );
}
