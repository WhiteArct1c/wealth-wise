"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CategoryForm } from "./category-form";
import { CategoriesTable, type Category } from "./categories-table";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCategoriesContext } from "@/contexts/categories-context";

type CategoriesPageClientProps = {
  categories: Category[];
  showTable?: boolean;
};

export function CategoriesPageClient({ categories, showTable }: CategoriesPageClientProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { openEditDialog } = useCategoriesContext();
  const router = useRouter();

  const handleEdit = (category: Category) => {
    openEditDialog(category);
  };

  const handleSuccess = () => {
    setCreateDialogOpen(false);
    router.refresh();
  };

  if (showTable) {
    return <CategoriesTable categories={categories} onEdit={handleEdit} />;
  }

  return (
    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Categoria</DialogTitle>
          <DialogDescription>
            Adicione uma nova categoria para organizar suas transações
          </DialogDescription>
        </DialogHeader>
        <CategoryForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}

