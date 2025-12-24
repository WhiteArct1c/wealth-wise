"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TableSortHeaderProps = {
  column: string;
  children: React.ReactNode;
  className?: string;
  sortParam?: string; // Nome do parâmetro de ordenação (default: "sort")
  orderParam?: string; // Nome do parâmetro de ordem (default: "order")
  pageParam?: string; // Nome do parâmetro de página (default: "page")
};

export function TableSortHeader({ 
  column, 
  children, 
  className,
  sortParam = "sort",
  orderParam = "order",
  pageParam = "page",
}: TableSortHeaderProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentSort = searchParams.get(sortParam) || "";
  const currentOrder = searchParams.get(orderParam) || "asc";
  
  const isActive = currentSort === column;
  const isAsc = isActive && currentOrder === "asc";

  const handleSort = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (isActive && currentOrder === "asc") {
      // Se já está ordenando ASC, muda para DESC
      params.set(sortParam, column);
      params.set(orderParam, "desc");
    } else if (isActive && currentOrder === "desc") {
      // Se já está ordenando DESC, remove a ordenação
      params.delete(sortParam);
      params.delete(orderParam);
    } else {
      // Primeira vez clicando, ordena ASC
      params.set(sortParam, column);
      params.set(orderParam, "asc");
    }

    // Reseta para página 1 quando ordenar
    params.delete(pageParam);
    
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  };

  return (
    <Button
      variant="ghost"
      onClick={handleSort}
      className={cn("h-8 px-2 hover:bg-transparent", className)}
    >
      {children}
      {isActive ? (
        isAsc ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  );
}

