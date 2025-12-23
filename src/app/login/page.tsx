import { LoginForm } from "@/components/auth/login-form";
import DarkVeil from "@/components/DarkVeil";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <DarkVeil
          hueShift={120}
          noiseIntensity={0.02}
          scanlineIntensity={0.1}
          speed={0.3}
          warpAmount={0.1}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/60 to-primary/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <LoginForm />
      </div>
    </div>
  );
}

