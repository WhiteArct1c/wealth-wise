"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GoalForm } from "./goal-form";
import { useGoalsContext } from "@/contexts/goals-context";
import { useRouter } from "next/navigation";

export function GoalsEditDialog() {
  const { editDialogOpen, goalToEdit, closeEditDialog } = useGoalsContext();
  const router = useRouter();

  const handleSuccess = () => {
    closeEditDialog();
    router.refresh();
  };

  return (
    <Dialog
      open={editDialogOpen}
      onOpenChange={(open) => !open && closeEditDialog()}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Meta</DialogTitle>
          <DialogDescription>
            Atualize os detalhes da sua meta financeira.
          </DialogDescription>
        </DialogHeader>
        {goalToEdit && (
          <GoalForm
            goalId={goalToEdit.id}
            defaultValues={{
              name: goalToEdit.name,
              target_amount: Math.round(goalToEdit.target_amount * 100),
              current_amount: Math.round((goalToEdit.current_amount ?? 0) * 100),
              deadline: goalToEdit.deadline,
            }}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}


