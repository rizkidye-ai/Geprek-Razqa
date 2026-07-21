import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/(app)/logout-action";

const roleLabel: Record<string, string> = {
  ADMIN: "Pemilik / Admin",
  KASIR: "Kasir",
  DAPUR: "Dapur",
};

export function Topbar({ name, role }: { name: string; role: string }) {
  return (
    <header className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
      <div className="pl-10 lg:pl-0">
        <p className="text-sm font-semibold text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">{roleLabel[role] ?? role}</p>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          <LogOut size={14} />
          Keluar
        </button>
      </form>
    </header>
  );
}
