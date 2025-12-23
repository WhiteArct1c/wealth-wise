import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DarkVeil from "@/components/DarkVeil";

type SearchParams = {
  email?: string;
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const email = params.email || "seu email";

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
      <Card className="w-full max-w-md border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl transition-all duration-200">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Verifique seu email</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enviamos um link de confirmação para
          </CardDescription>
          <CardDescription className="font-semibold text-foreground">
            {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Clique no link que enviamos para confirmar sua conta. O link expira em 1 hora.
            </p>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
              <span>Verifique sua caixa de entrada e pasta de spam</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Não recebeu o email?
            </p>
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <Link href="/login">Voltar para login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

