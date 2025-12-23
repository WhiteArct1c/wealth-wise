"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginSchema, registerSchema, otpSchema } from "@/lib/validations/auth";

export async function signIn(formData: unknown) {
  // Validate on server
  const validation = loginSchema.safeParse(formData);
  if (!validation.success) {
    return {
      error: "Dados inválidos. Por favor, verifique os campos.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  });

  if (error) {
    // Handle specific Supabase errors
    if (error.message.includes("Invalid login credentials")) {
      return {
        error: "Email ou senha incorretos",
      };
    }
    if (error.message.includes("Email not confirmed")) {
      return {
        error: "Por favor, confirme seu email antes de fazer login",
      };
    }
    return {
      error: error.message,
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(formData: unknown) {
  // Validate on server
  const validation = registerSchema.safeParse(formData);
  if (!validation.success) {
    return {
      error: "Dados inválidos. Por favor, verifique os campos.",
    };
  }

  const supabase = await createClient();

  // Create user account (will be unconfirmed until OTP is verified)
  const { data, error } = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      data: {
        name: validation.data.name,
      },
      // Don't use emailRedirectTo - we'll handle OTP verification in our app
    },
  });

  if (error) {
    if (error.message.includes("User already registered")) {
      return {
        error: "Este email já está cadastrado",
      };
    }
    return {
      error: error.message,
    };
  }

  // If user was created, Supabase automatically sends the confirmation email
  // No need to call resend() - it will trigger rate limiting
  if (data.user && !data.session) {
    return {
      success: true,
      requiresEmailConfirmation: true,
      email: validation.data.email,
    };
  }

  // If session exists, user is already confirmed (email confirmation disabled)
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  return {
    success: true,
    requiresEmailConfirmation: true,
    email: validation.data.email,
  };
}

export async function verifyOtp(formData: unknown) {
  // Validate on server
  const validation = otpSchema.safeParse(formData);
  if (!validation.success) {
    return {
      error: "Código inválido. Digite os 8 dígitos.",
    };
  }

  const supabase = await createClient();

  // Verify OTP code
  const { data, error } = await supabase.auth.verifyOtp({
    email: validation.data.email,
    token: validation.data.token,
    type: "email",
  });

  if (error) {
    if (error.message.includes("Token has expired")) {
      return {
        error: "Código expirado. Solicite um novo código.",
      };
    }
    if (error.message.includes("Invalid token")) {
      return {
        error: "Código inválido. Verifique e tente novamente.",
      };
    }
    return {
      error: error.message,
    };
  }

  if (data.user) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  return {
    error: "Falha ao verificar código",
  };
}

export async function resendOtp(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Código reenviado com sucesso!",
  };
}

type ConfirmEmailParams = {
  token_hash: string;
  type: string;
  email?: string;
};

export async function confirmEmail({
  token_hash,
  type,
}: ConfirmEmailParams) {
  const supabase = await createClient();

  // Usa o token_hash enviado no link de confirmação do Supabase
  const { error } = await supabase.auth.verifyOtp({
    type: type as "email" | "signup" | "recovery",
    token_hash,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

