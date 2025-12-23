"use client";

import { useState } from "react";
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
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema, registerSchema, type LoginFormValues, type RegisterFormValues } from "@/lib/validations/auth";
import { signIn, signUp } from "@/app/actions/auth";
import { Loader2, Mail, Lock, User, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AppLogo } from "@/components/shared/app-logo";

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn(data);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
        setIsLoading(false);
        return;
      }
      // If no error and no result, redirect should have happened
      // No need to show success toast as redirect will happen
    } catch (error) {
      // Check if it's a Next.js redirect (which is expected)
      if (error && typeof error === 'object' && 'digest' in error) {
        // This is a Next.js redirect, which is normal - don't show error
        return;
      }
      const errorMessage = "Ocorreu um erro ao fazer login";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signUp(data);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      // If email confirmation is required
      if (result?.requiresEmailConfirmation) {
        toast.success("Código de verificação enviado!");
        // Redirect to OTP verification page
        window.location.href = `/auth/verify-otp?email=${encodeURIComponent(data.email)}`;
        return;
      }

      // If no redirect happened and no error, something unexpected occurred
      toast.success("Conta criada com sucesso!");
    } catch (error) {
      // Check if it's a Next.js redirect (which is expected if email confirmation is disabled)
      if (error && typeof error === 'object' && 'digest' in error) {
        // This is likely a Next.js redirect, which is normal
        return;
      }
      
      const errorMessage = "Ocorreu um erro ao criar a conta";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl transition-all duration-200">
      <CardHeader className="space-y-4 text-center">
        <div className="flex justify-center">
          <AppLogo variant="full" showSubtitle={false} href={undefined} />
        </div>
        <CardDescription className="text-muted-foreground">
          {isLogin
            ? "Entre na sua conta para continuar"
            : "Crie sua conta para começar"}
        </CardDescription>
      </CardHeader>

      {error && (
        <div className="mx-6 mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <CardContent>
        {isLogin ? (
          <Form {...loginForm} key="login-form">
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="space-y-4"
            >
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all duration-200"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Senha
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all duration-200"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
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
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...registerForm} key="register-form">
            <form
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className="space-y-4"
            >
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nome
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Seu nome"
                        className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all duration-200"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all duration-200"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Senha
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all duration-200"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirmar Senha
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all duration-200"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
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
                    Criando conta...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Criar conta
                  </>
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          {isLogin ? (
            <>
              Não tem uma conta?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                  loginForm.reset();
                  registerForm.reset({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                  });
                }}
                className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline transition-all duration-200"
              >
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem uma conta?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                  registerForm.reset();
                  loginForm.reset({
                    email: "",
                    password: "",
                  });
                }}
                className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline transition-all duration-200"
              >
                Fazer login
              </button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

