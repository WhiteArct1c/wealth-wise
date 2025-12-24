"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ITEMS_PER_PAGE_OPTIONS, DEFAULT_ITEMS_PER_PAGE } from "@/constants/ui";

export function ItemsPerPageSelector() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentPerPage = searchParams.get("perPage") || DEFAULT_ITEMS_PER_PAGE.toString();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === DEFAULT_ITEMS_PER_PAGE.toString()) {
      params.delete("perPage");
    } else {
      params.set("perPage", value);
    }
    // Reseta para página 1 quando mudar itens por página
    params.delete("page");
    
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Itens por página:</span>
      <Select value={currentPerPage} onValueChange={handleChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ITEMS_PER_PAGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

