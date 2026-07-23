import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const settings = await prisma.settings.findFirst();

  return (
    <AppShell
      role={session.user.role}
      storeName={settings?.name}
      logoUrl={settings?.logoUrl}
      name={session.user.name ?? session.user.username}
    >
      {children}
    </AppShell>
  );
}
