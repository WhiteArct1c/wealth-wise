import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { confirmEmail } from "@/app/actions/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DarkVeil from "@/components/DarkVeil";

type SearchParams = {
  token_hash?: string;
  type?: string;
  email?: string;
};

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { token_hash, type, email } = params;

  if (!token_hash || !type) {
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
        <Card className="w-full border-destructive/20 bg-card/80 backdrop-blur-xl shadow-2xl transition-all duration-200">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Link inválido</CardTitle>
            <CardDescription className="text-muted-foreground">
              O link de confirmação está inválido ou expirado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/login">Voltar para login</Link>
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  const result = await confirmEmail({ token_hash, type, email });

  if (result?.error) {
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
        <Card className="w-full border-destructive/20 bg-card/80 backdrop-blur-xl shadow-2xl transition-all duration-200">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Falha na confirmação</CardTitle>
            <CardDescription className="text-muted-foreground">
              {result.error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                O link pode ter expirado ou já foi usado. Tente fazer login novamente ou solicite um novo link de confirmação.
              </p>
            </div>
            <Button className="w-full" asChild>
              <Link href="/login">Voltar para login</Link>
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  // If we reach here, redirect should have happened
  // But just in case, show success message
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
      <Card className="w-full border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl transition-all duration-200">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Email confirmado!</CardTitle>
          <CardDescription className="text-muted-foreground">
            Redirecionando para o dashboard...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

