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
import { GoalForm } from "./goal-form";
import { GoalsTable } from "./goals-table";
import type { Goal } from "@/contexts/goals-context";
import { Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGoalsContext } from "@/contexts/goals-context";

type GoalsPageClientProps = {
  goals: Goal[];
  showTable?: boolean;
};

export function GoalsPageClient({ goals, showTable }: GoalsPageClientProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { openEditDialog } = useGoalsContext();
  const router = useRouter();

  const handleEdit = (goal: Goal) => {
    openEditDialog(goal);
  };

  const handleSuccess = () => {
    setCreateDialogOpen(false);
    router.refresh();
  };

  if (showTable) {
    return <GoalsTable goals={goals} onEdit={handleEdit} />;
  }

  return (
    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Target className="h-4 w-4" />
          Nova Meta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar nova meta</DialogTitle>
          <DialogDescription>
            Defina um objetivo financeiro para acompanhar seu progresso.
          </DialogDescription>
        </DialogHeader>
        <GoalForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}


