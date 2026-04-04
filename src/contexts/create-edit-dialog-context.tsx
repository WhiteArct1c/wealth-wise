"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type EditDialogContextValue<T> = {
  editDialogOpen: boolean;
  itemToEdit: T | null;
  openEditDialog: (item: T) => void;
  closeEditDialog: () => void;
};

/**
 * Factory that creates a typed edit-dialog context, provider, and hook.
 *
 * Each feature (accounts, categories, goals, transactions) uses the same
 * open/close pattern. This factory eliminates the boilerplate so each
 * context file is just a few lines of configuration.
 *
 * The returned `Provider` manages state internally. The returned
 * `useEditDialogContext` hook must be called inside that Provider.
 *
 * @example
 * const { Provider: AccountsProvider, useEditDialogContext } =
 *   createEditDialogContext<Account>();
 */
export function createEditDialogContext<T>() {
  const Context = createContext<EditDialogContextValue<T> | undefined>(
    undefined
  );

  function Provider({ children }: { children: ReactNode }) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<T | null>(null);

    const openEditDialog = (item: T) => {
      setItemToEdit(item);
      setEditDialogOpen(true);
    };

    const closeEditDialog = () => {
      setEditDialogOpen(false);
      setItemToEdit(null);
    };

    return (
      <Context.Provider
        value={{ editDialogOpen, itemToEdit, openEditDialog, closeEditDialog }}
      >
        {children}
      </Context.Provider>
    );
  }

  function useEditDialogContext() {
    const context = useContext(Context);
    if (!context) {
      throw new Error(
        "useEditDialogContext must be called inside the corresponding Provider"
      );
    }
    return context;
  }

  return { Provider, useEditDialogContext };
}
