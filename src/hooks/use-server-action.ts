"use client";

import { useState } from "react";
import { toast } from "sonner";

type ServerActionResult = { error?: string } | null | undefined;

type UseServerActionOptions<TData> = {
  action: (data: TData) => Promise<ServerActionResult>;
  onSuccess?: (data: TData) => void;
  successMessage: string;
  errorMessage?: string;
};

export function useServerAction<TData>({
  action,
  onSuccess,
  successMessage,
  errorMessage = "Ocorreu um erro inesperado",
}: UseServerActionOptions<TData>) {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (data: TData) => {
    setIsLoading(true);
    try {
      const result = await action(data);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(successMessage);
      onSuccess?.(data);
    } catch {
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
