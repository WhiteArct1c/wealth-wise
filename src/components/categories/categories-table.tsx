"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Pencil, Trash2, ArrowUpCircle, ArrowDownCircle, Tag } from "lucide-react";
import { useState } from "react";
import { deleteCategory } from "@/app/actions/categories";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TableSortHeader } from "@/components/shared/table-sort-header";

export type Category = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  budget_type: "ESSENTIAL_FIXED" | "ESSENTIAL_VARIABLE" | "DISCRETIONARY" | null;
  color_hex: string | null;
  icon_slug: string | null;
  created_at: string;
};

type CategoriesTableProps = {
  categories: Category[];
  onEdit: (category: Category) => void;
};

const categoryTypeConfig = {
  INCOME: {
    label: "Receita",
    icon: ArrowUpCircle,
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  EXPENSE: {
    label: "Despesa",
    icon: ArrowDownCircle,
    color: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
} as const;

const budgetTypeConfig = {
  ESSENTIAL_FIXED: {
    label: "Essencial Fixo",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  ESSENTIAL_VARIABLE: {
    label: "Essencial Variável",
    color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  },
  DISCRETIONARY: {
    label: "Discricionário",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
} as const;

export function CategoriesTable({ categories, onEdit }: CategoriesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const router = useRouter();

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    const result = await deleteCategory(categoryToDelete.id);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Categoria deletada com sucesso!");
      router.refresh();
    }
    
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <Tag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma categoria encontrada</h3>
        <p className="text-muted-foreground">
          Comece criando sua primeira categoria
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <TableSortHeader column="name">Nome</TableSortHeader>
              </TableHead>
              <TableHead>
                <TableSortHeader column="type">Tipo</TableSortHeader>
              </TableHead>
              <TableHead>
                <TableSortHeader column="budget_type">Orçamento</TableSortHeader>
              </TableHead>
              <TableHead>Cor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => {
              const typeConfig = categoryTypeConfig[category.type];
              const TypeIcon = typeConfig.icon;

              return (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={typeConfig.color}>
                      <TypeIcon className="mr-1.5 h-3 w-3" />
                      {typeConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {category.budget_type ? (
                      <Badge variant="outline" className={budgetTypeConfig[category.budget_type].color}>
                        {budgetTypeConfig[category.budget_type].label}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-5 w-5 rounded-full border-2 border-border shrink-0"
                        style={{ backgroundColor: category.color_hex || "#22c55e" }}
                      />
                      {category.color_hex && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {category.color_hex}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(category)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(category)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A categoria{" "}
              <strong>{categoryToDelete?.name}</strong> será permanentemente
              removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

