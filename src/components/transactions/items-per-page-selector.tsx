"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ITEMS_PER_PAGE_OPTIONS, DEFAULT_ITEMS_PER_PAGE } from "@/constants/ui";

type ItemsPerPageSelectorProps = {
  defaultValue?: number;
};

export function ItemsPerPageSelector({ defaultValue = DEFAULT_ITEMS_PER_PAGE }: ItemsPerPageSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentValue = searchParams.get("perPage") || defaultValue.toString();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Atualiza o parâmetro perPage
    if (value === defaultValue.toString()) {
      params.delete("perPage");
    } else {
      params.set("perPage", value);
    }
    
    // Reseta para a primeira página quando mudar o número de itens
    params.delete("page");

    router.push(`/transactions?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="items-per-page" className="text-sm text-muted-foreground whitespace-nowrap">
        Itens por página:
      </Label>
      <Select value={currentValue} onValueChange={handleChange}>
        <SelectTrigger id="items-per-page" className="w-[140px] h-9">
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

