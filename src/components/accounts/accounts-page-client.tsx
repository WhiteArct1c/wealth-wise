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
import { AccountForm } from "./account-form";
import { AccountsTable, type Account } from "./accounts-table";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccountsContext } from "@/contexts/accounts-context";

type AccountsPageClientProps = {
  accounts: Account[];
  showTable?: boolean;
};

export function AccountsPageClient({ accounts, showTable }: AccountsPageClientProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { openEditDialog } = useAccountsContext();
  const router = useRouter();

  const handleEdit = (account: Account) => {
    openEditDialog(account);
  };

  const handleSuccess = () => {
    setCreateDialogOpen(false);
    router.refresh();
  };

  if (showTable) {
    return <AccountsTable accounts={accounts} onEdit={handleEdit} />;
  }

  return (
    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Conta</DialogTitle>
          <DialogDescription>
            Adicione uma nova fonte de dinheiro ao seu sistema
          </DialogDescription>
        </DialogHeader>
        <AccountForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}

