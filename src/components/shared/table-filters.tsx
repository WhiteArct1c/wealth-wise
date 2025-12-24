"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { X, Filter } from "lucide-react";
import { useState, useEffect } from "react";

type FilterOption = {
  value: string;
  label: string;
};

type TableFiltersProps = {
  searchPlaceholder?: string;
  searchKey?: string; // Nome do parâmetro de busca (default: "search")
  selectFilters?: Array<{
    key: string;
    label: string;
    options: FilterOption[];
    placeholder?: string;
  }>;
  onFilterChange?: () => void;
};

export function TableFilters({
  searchPlaceholder = "Buscar...",
  searchKey = "search",
  selectFilters = [],
  onFilterChange,
}: TableFiltersProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const [searchValue, setSearchValue] = useState(searchParams.get(searchKey) || "");
  const [selectValues, setSelectValues] = useState<Record<string, string>>(() => {
    const values: Record<string, string> = {};
    selectFilters.forEach((filter) => {
      const paramValue = searchParams.get(filter.key);
      values[filter.key] = paramValue || "";
    });
    return values;
  });

  // Atualiza valores quando searchParams mudam (ex: navegação do browser)
  useEffect(() => {
    setSearchValue(searchParams.get(searchKey) || "");
    const newSelectValues: Record<string, string> = {};
    selectFilters.forEach((filter) => {
      const paramValue = searchParams.get(filter.key);
      newSelectValues[filter.key] = paramValue || "";
    });
    setSelectValues(newSelectValues);
  }, [searchParams, searchKey, selectFilters]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Aplica busca
    if (searchValue.trim()) {
      params.set(searchKey, searchValue.trim());
    } else {
      params.delete(searchKey);
    }

    // Aplica filtros de select
    selectFilters.forEach((filter) => {
      const value = selectValues[filter.key];
      if (value && value !== "__all__") {
        params.set(filter.key, value);
      } else {
        params.delete(filter.key);
      }
    });

    // Reseta para página 1 quando filtrar
    params.delete("page");
    
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
    onFilterChange?.();
  };

  const clearFilters = () => {
    setSearchValue("");
    setSelectValues({});
    const params = new URLSearchParams();
    // Mantém apenas perPage se existir
    const perPage = searchParams.get("perPage");
    if (perPage) {
      params.set("perPage", perPage);
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
    onFilterChange?.();
  };

  const hasActiveFilters = searchValue.trim() || Object.values(selectValues).some((v) => v);
  const hasActiveSelectFilters = Object.values(selectValues).some((v) => v && v !== "__all__");
  const [isOpen, setIsOpen] = useState(false);

  const handleApplyFilters = () => {
    applyFilters();
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    clearFilters();
    setIsOpen(false);
  };

  const handleClearSelectFilters = () => {
    setSelectValues({});
    const params = new URLSearchParams(searchParams.toString());
    selectFilters.forEach((filter) => {
      params.delete(filter.key);
    });
    params.delete("page");
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="flex-1 flex gap-2">
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              applyFilters();
            }
          }}
          className="w-full"
        />
        <Button onClick={applyFilters} variant="default">
          Buscar
        </Button>
        {searchValue.trim() && (
          <Button onClick={() => {
            setSearchValue("");
            const params = new URLSearchParams(searchParams.toString());
            params.delete(searchKey);
            params.delete("page");
            const query = params.toString();
            router.push(`${pathname}${query ? `?${query}` : ""}`);
          }} variant="outline" size="icon">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {selectFilters.length > 0 && (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              {hasActiveSelectFilters && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {Object.values(selectValues).filter((v) => v && v !== "__all__").length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
            <div className="px-6 pt-6 pb-4 border-b">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription className="mt-2">
                  Use os filtros abaixo para refinar sua busca
                </SheetDescription>
              </SheetHeader>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {selectFilters.map((filter) => (
                <div key={filter.key} className="space-y-3">
                  <label className="text-sm font-medium text-foreground">{filter.label}</label>
                  <Select
                    value={selectValues[filter.key] || "__all__"}
                    onValueChange={(value) => {
                      setSelectValues((prev) => ({ ...prev, [filter.key]: value === "__all__" ? "" : value }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={filter.placeholder || filter.label} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Todos</SelectItem>
                      {filter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t bg-muted/50">
              <div className="flex gap-3">
                <Button onClick={handleApplyFilters} variant="default" className="flex-1">
                  Aplicar Filtros
                </Button>
                {hasActiveSelectFilters && (
                  <Button onClick={handleClearSelectFilters} variant="outline" size="icon">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

