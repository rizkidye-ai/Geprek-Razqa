import { prisma } from "@/lib/prisma";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const settings = await prisma.settings.findFirst();

  return (
    <LoginForm
      storeName={settings?.name || "Geprek Rzqa"}
      logoUrl={settings?.logoUrl ?? null}
    />
  );
}
