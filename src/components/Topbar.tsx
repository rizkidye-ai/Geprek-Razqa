import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/(app)/logout-action";

const roleLabel: Record<string, string> = {
  ADMIN: "Pemilik / Admin",
  KASIR: "Kasir",
  DAPUR: "Dapur",
};

export function Topbar({ name, role }: { name: string; role: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-gray-200/80 bg-white/80 px-4 py-3 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-3 pl-10 lg:pl-0">
        <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-950 text-sm font-semibold text-white sm:flex">
          {initial}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{roleLabel[role] ?? role}</p>
        </div>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={14} />
          Keluar
        </button>
      </form>
    </header>
  );
}
