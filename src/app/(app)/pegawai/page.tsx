import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { SubmitButton } from "@/components/SubmitButton";
import {
  createUserAction,
  toggleUserActiveAction,
  deleteUserAction,
  resetPasswordAction,
} from "./actions";

const roleLabel: Record<string, string> = {
  ADMIN: "Pemilik / Admin",
  KASIR: "Kasir",
  DAPUR: "Dapur",
};

export default async function PegawaiPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Manajemen Pegawai</h1>
        <p className="text-sm text-gray-500">Kelola akun admin, kasir, dan dapur</p>
      </div>

      <form action={createUserAction} className="grid max-w-2xl grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:grid-cols-4">
        <input
          name="name"
          required
          placeholder="Nama lengkap"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          name="username"
          required
          placeholder="Username"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <select name="role" className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="KASIR">Kasir</option>
          <option value="DAPUR">Dapur</option>
          <option value="ADMIN">Admin</option>
        </select>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Password (min. 6 karakter)"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-3"
        />
        <SubmitButton>Tambah Pegawai</SubmitButton>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Peran</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Bergabung</th>
              <th className="px-4 py-3">Reset Password</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.username}</td>
                <td className="px-4 py-3 text-gray-500">{roleLabel[u.role]}</td>
                <td className="px-4 py-3">
                  <form action={toggleUserActiveAction}>
                    <input type="hidden" name="id" value={u.id} />
                    <button
                      type="submit"
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        u.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {u.isActive ? "Aktif" : "Nonaktif"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{formatDateTime(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <form action={resetPasswordAction} className="flex gap-1">
                    <input type="hidden" name="id" value={u.id} />
                    <input
                      name="password"
                      type="password"
                      minLength={6}
                      placeholder="Password baru"
                      className="w-32 rounded-lg border border-gray-300 px-2 py-1 text-xs"
                    />
                    <button
                      type="submit"
                      className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Reset
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteUserAction}>
                    <input type="hidden" name="id" value={u.id} />
                    <button type="submit" className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
