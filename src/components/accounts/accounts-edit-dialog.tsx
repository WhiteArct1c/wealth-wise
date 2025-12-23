"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccountForm } from "./account-form";
import { useAccountsContext } from "@/contexts/accounts-context";
import { useRouter } from "next/navigation";

export function AccountsEditDialog() {
  const { editDialogOpen, accountToEdit, closeEditDialog } = useAccountsContext();
  const router = useRouter();

  const handleSuccess = () => {
    closeEditDialog();
    router.refresh();
  };

  return (
    <Dialog open={editDialogOpen} onOpenChange={(open) => !open && closeEditDialog()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Conta</DialogTitle>
          <DialogDescription>
            Atualize as informações da conta
          </DialogDescription>
        </DialogHeader>
        {accountToEdit && (
          <AccountForm
            accountId={accountToEdit.id}
            defaultValues={{
              name: accountToEdit.name,
              type: accountToEdit.type,
              // Converte reais (do banco) para centavos (para o formulário)
              initial_balance: Math.round(accountToEdit.initial_balance * 100),
              is_active: accountToEdit.is_active ?? true,
            }}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

