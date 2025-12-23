"use client";

import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type AppLogoProps = {
  variant?: "default" | "compact" | "full";
  showSubtitle?: boolean;
  className?: string;
  href?: string;
};

export function AppLogo({
  variant = "default",
  showSubtitle = false,
  className,
  href = "/dashboard",
}: AppLogoProps) {
  const isCompact = variant === "compact";
  const isFull = variant === "full";

  const LogoContent = (
    <div
      className={cn(
        "flex items-center gap-2 transition-all duration-200",
        isCompact && "justify-center",
        className
      )}
    >
      {/* Ícone com fundo verde */}
      <div className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm",
        isFull ? "h-12 w-12" : "h-8 w-8"
      )}>
        <Wallet className={cn(
          isFull ? "h-6 w-6" : "h-4 w-4"
        )} />
      </div>

      {/* Texto do logo - oculto quando compacto */}
      {!isCompact && (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold leading-tight",
            isFull ? "text-2xl" : "text-sm"
          )}>
            <span className="text-foreground">Wealth</span>
            <span className="text-primary"> Wise</span>
          </span>
          {showSubtitle && (
            <span className="text-xs text-muted-foreground leading-tight">
              {isFull ? "Gestão Financeira Inteligente" : "Gestão Financeira"}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg">
        {LogoContent}
      </Link>
    );
  }

  return LogoContent;
}

