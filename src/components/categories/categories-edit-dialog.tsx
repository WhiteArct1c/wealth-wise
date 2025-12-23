"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategoryForm } from "./category-form";
import { useCategoriesContext } from "@/contexts/categories-context";
import { useRouter } from "next/navigation";

export function CategoriesEditDialog() {
  const { editDialogOpen, categoryToEdit, closeEditDialog } = useCategoriesContext();
  const router = useRouter();

  const handleSuccess = () => {
    closeEditDialog();
    router.refresh();
  };

  return (
    <Dialog open={editDialogOpen} onOpenChange={(open) => !open && closeEditDialog()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
          <DialogDescription>
            Atualize as informações da categoria
          </DialogDescription>
        </DialogHeader>
        {categoryToEdit && (
          <CategoryForm
            categoryId={categoryToEdit.id}
            defaultValues={{
              name: categoryToEdit.name,
              type: categoryToEdit.type,
              budget_type: categoryToEdit.budget_type,
              color_hex: categoryToEdit.color_hex,
              icon_slug: categoryToEdit.icon_slug,
            }}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

