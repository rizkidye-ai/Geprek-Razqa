"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export function AppShell({
  role,
  storeName,
  logoUrl,
  name,
  children,
}: {
  role: string;
  storeName?: string | null;
  logoUrl?: string | null;
  name: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} storeName={storeName} logoUrl={logoUrl} open={open} onClose={() => setOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar name={name} role={role} onMenuClick={() => setOpen(true)} />
        <main className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100 p-4 lg:p-6 print-area">
          {children}
        </main>
      </div>
    </div>
  );
}
