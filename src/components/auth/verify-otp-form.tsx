"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { otpSchema, type OtpFormValues } from "@/lib/validations/auth";
import { verifyOtp, resendOtp } from "@/app/actions/auth";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type VerifyOtpFormProps = {
  email: string;
};

export function VerifyOtpForm({ email }: VerifyOtpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(54); // 54 segundos de cooldown

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      email: email,
      token: "",
    },
  });

  // Timer para cooldown de reenvio
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const onSubmit = async (data: OtpFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await verifyOtp(data);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
        setIsLoading(false);
        return;
      }
      // If no error, redirect should have happened
      toast.success("Email confirmado com sucesso!");
    } catch (error) {
      // Check if it's a Next.js redirect (which is expected)
      if (error && typeof error === 'object' && 'digest' in error) {
        return;
      }
      const errorMessage = "Ocorreu um erro ao verificar o código";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) {
      return;
    }

    setIsResending(true);
    setError(null);
    try {
      const result = await resendOtp(email);
      if (result?.error) {
        toast.error(result.error);
        // Se o erro for de rate limit, reiniciar o cooldown
        if (result.error.includes("seconds")) {
          setCooldown(54);
        }
      } else {
        toast.success("Código reenviado! Verifique seu email.");
        form.setValue("token", ""); // Clear the input
        setCooldown(54); // Reiniciar cooldown após reenvio bem-sucedido
      }
    } catch {
      toast.error("Erro ao reenviar código");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl transition-all duration-200 w-full max-w-lg min-w-fit">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Verifique seu email</CardTitle>
        <CardDescription className="text-muted-foreground">
          Digite o código de 8 dígitos enviado para
        </CardDescription>
        <CardDescription className="font-semibold text-foreground">
          {email || "seu email"}
        </CardDescription>
      </CardHeader>

      {error && (
        <div className="mx-6 mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <CardContent className="px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input type="hidden" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormControl>
                    <div className="flex justify-center w-full">
                      <InputOTP
                        maxLength={8}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isLoading}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="h-12 w-12 text-base" />
                          <InputOTPSlot index={1} className="h-12 w-12 text-base" />
                          <InputOTPSlot index={2} className="h-12 w-12 text-base" />
                          <InputOTPSlot index={3} className="h-12 w-12 text-base" />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={4} className="h-12 w-12 text-base" />
                          <InputOTPSlot index={5} className="h-12 w-12 text-base" />
                          <InputOTPSlot index={6} className="h-12 w-12 text-base" />
                          <InputOTPSlot index={7} className="h-12 w-12 text-base" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground text-center">
                    Digite o código de 8 dígitos que você recebeu por email
                  </p>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar código"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          Não recebeu o código?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || !email || cooldown > 0}
            className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <>
                <Loader2 className="inline h-3 w-3 mr-1 animate-spin" />
                Reenviando...
              </>
            ) : cooldown > 0 ? (
              <>
                <RefreshCw className="inline h-3 w-3 mr-1" />
                Reenviar código ({cooldown}s)
              </>
            ) : (
              <>
                <RefreshCw className="inline h-3 w-3 mr-1" />
                Reenviar código
              </>
            )}
          </button>
        </div>

        <div className="pt-4 border-t w-full">
          <Button
            variant="ghost"
            className="w-full"
            asChild
          >
            <Link href="/login">Voltar para login</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

