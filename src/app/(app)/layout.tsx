import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

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
    <div className="flex min-h-screen">
      <Sidebar role={session.user.role} storeName={settings?.name} logoUrl={settings?.logoUrl} />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar name={session.user.name ?? session.user.username} role={session.user.role} />
        <main className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100 p-4 lg:p-6 print-area">
          {children}
        </main>
      </div>
    </div>
  );
}
