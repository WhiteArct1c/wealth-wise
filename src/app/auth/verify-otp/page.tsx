import { VerifyOtpForm } from "@/components/auth/verify-otp-form";
import DarkVeil from "@/components/DarkVeil";
import { AppLogo } from "@/components/shared/app-logo";

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = params.email || "";

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
      <div className="relative z-10 w-full max-w-lg px-4 space-y-6">
        <div className="flex justify-center">
          <AppLogo variant="full" showSubtitle={false} href={undefined} />
        </div>
        <VerifyOtpForm email={email} />
      </div>
    </div>
  );
}

