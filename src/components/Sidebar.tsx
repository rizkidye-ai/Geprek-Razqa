"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  UtensilsCrossed,
  Table2,
  Package,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  Calculator,
  Receipt,
  Wallet,
  TrendingUp,
  Target,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
};

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: <LayoutDashboard size={18} />, roles: ["ADMIN", "KASIR", "DAPUR"] },
  { href: "/kasir", label: "Kasir (POS)", icon: <ShoppingCart size={18} />, roles: ["ADMIN", "KASIR"] },
  { href: "/pesanan", label: "Pesanan & Dapur", icon: <ClipboardList size={18} />, roles: ["ADMIN", "KASIR", "DAPUR"] },
  { href: "/meja", label: "Meja", icon: <Table2 size={18} />, roles: ["ADMIN", "KASIR"] },
  { href: "/menu", label: "Menu & Resep", icon: <UtensilsCrossed size={18} />, roles: ["ADMIN"] },
  { href: "/stok", label: "Stok Bahan Baku", icon: <Package size={18} />, roles: ["ADMIN", "KASIR"] },
  { href: "/laporan", label: "Laporan Penjualan", icon: <BarChart3 size={18} />, roles: ["ADMIN"] },
  { href: "/pegawai", label: "Pegawai", icon: <Users size={18} />, roles: ["ADMIN"] },
  { href: "/pengaturan", label: "Pengaturan", icon: <Settings size={18} />, roles: ["ADMIN"] },
];

const financeNavItems: NavItem[] = [
  { href: "/keuangan/hpp", label: "HPP", icon: <Calculator size={18} />, roles: ["ADMIN"] },
  { href: "/keuangan/pengeluaran", label: "CAPEX & OPEX", icon: <Receipt size={18} />, roles: ["ADMIN"] },
  { href: "/keuangan/arus-kas", label: "Arus Kas", icon: <Wallet size={18} />, roles: ["ADMIN"] },
  { href: "/keuangan/laba-rugi", label: "Laba Rugi", icon: <TrendingUp size={18} />, roles: ["ADMIN"] },
  { href: "/keuangan/kelayakan", label: "BEP, ROI & Kelayakan", icon: <Target size={18} />, roles: ["ADMIN"] },
];

export function Sidebar({
  role,
  storeName,
  logoUrl,
}: {
  role: string;
  storeName?: string | null;
  logoUrl?: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = navItems.filter((item) => item.roles.includes(role));
  const financeItems = financeNavItems.filter((item) => item.roles.includes(role));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="no-print lg:hidden fixed top-3 left-3 z-40 rounded-2xl bg-white p-2 shadow-md border border-gray-200"
        aria-label="Buka menu"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div
          className="no-print fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`no-print fixed z-50 lg:z-0 top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-900 text-gray-100 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-lg shadow-lg shadow-orange-900/30">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <span>🍗</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-sm leading-tight">{storeName || "Geprek Rzqa"}</p>
              <p className="text-[11px] text-gray-400 leading-tight">Manajemen Warung</p>
            </div>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {items.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150 ${
                  active
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium shadow-md shadow-orange-900/30"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={active ? "" : "text-gray-400 group-hover:text-orange-400 transition-colors"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}

          {financeItems.length > 0 && (
            <>
              <p className="mt-4 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Keuangan
              </p>
              {financeItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150 ${
                      active
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium shadow-md shadow-orange-900/30"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className={active ? "" : "text-gray-400 group-hover:text-orange-400 transition-colors"}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="px-4 py-3 border-t border-white/10 text-[11px] text-gray-500">
          Peran aktif: <span className="text-gray-300 font-medium">{role}</span>
        </div>
      </aside>
    </>
  );
}
