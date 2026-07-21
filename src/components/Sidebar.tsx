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

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="no-print lg:hidden fixed top-3 left-3 z-40 rounded-md bg-white p-2 shadow border border-gray-200"
        aria-label="Buka menu"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div
          className="no-print fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`no-print fixed z-50 lg:z-0 top-0 left-0 h-full w-64 bg-gray-900 text-gray-100 flex flex-col transition-transform lg:translate-x-0 lg:static ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍗</span>
            <div>
              <p className="font-bold text-sm leading-tight">Geprek Rzqa</p>
              <p className="text-[11px] text-gray-400 leading-tight">Manajemen Warung</p>
            </div>
          </div>
          <button className="lg:hidden text-gray-400" onClick={() => setOpen(false)}>
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
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-orange-500 text-white font-medium"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-gray-800 text-[11px] text-gray-500">
          Peran aktif: <span className="text-gray-300 font-medium">{role}</span>
        </div>
      </aside>
    </>
  );
}
