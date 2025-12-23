"use client";
import { useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type TransactionsPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
};

export function TransactionsPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
}: TransactionsPaginationProps) {
  const searchParams = useSearchParams();
  
  // Cria URL mantendo outros parâmetros de busca (incluindo perPage)
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    // Mantém o parâmetro perPage se existir
    const query = params.toString();
    return `/transactions${query ? `?${query}` : ""}`;
  };

  // Não renderiza se houver apenas uma página
  if (totalPages <= 1) {
    return null;
  }

  // Calcula o range de páginas para exibir
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Mostra todas as páginas se houver poucas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Sempre mostra primeira página
      pages.push(1);

      if (currentPage <= 3) {
        // Perto do início
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Perto do fim
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // No meio
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground whitespace-nowrap flex-shrink-0">
        Mostrando <span className="font-medium text-foreground">{startItem}</span> até{" "}
        <span className="font-medium text-foreground">{endItem}</span> de{" "}
        <span className="font-medium text-foreground">{totalItems}</span> transações
      </div>
      
      <div className="flex-shrink-0">
        <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={currentPage === 1 ? undefined : createPageUrl(currentPage - 1)}
              aria-disabled={currentPage === 1}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              disabled={currentPage === 1}
            />
          </PaginationItem>

          {pageNumbers.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href={createPageUrl(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              href={currentPage === totalPages ? undefined : createPageUrl(currentPage + 1)}
              aria-disabled={currentPage === totalPages}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      </div>
    </div>
  );
}

