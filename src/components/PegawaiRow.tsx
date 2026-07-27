"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import {
  updateUserAction,
  toggleUserActiveAction,
  resetPasswordAction,
  deleteUserAction,
  type UserRole,
  type ActionResult,
} from "@/app/(app)/pegawai/actions";

const roleLabel: Record<string, string> = {
  ADMIN: "Pemilik / Admin",
  KASIR: "Kasir",
  DAPUR: "Dapur",
};

type UserRowData = {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
};

export function PegawaiRow({ user, isSelf }: { user: UserRowData; isSelf: boolean }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [role, setRole] = useState<UserRole>(user.role);
  const [resetPw, setResetPw] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<ActionResult>, onSuccess?: () => void) {
    setError("");
    startTransition(async () => {
      try {
        const result = await action();
        if (!result.success) {
          setError(result.error);
          return;
        }
        onSuccess?.();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
      }
    });
  }

  function cancelEdit() {
    setIsEditing(false);
    setName(user.name);
    setUsername(user.username);
    setRole(user.role);
    setError("");
  }

  if (isEditing) {
    return (
      <tr className="border-b border-gray-50 bg-orange-50/40 last:border-0">
        <td className="px-4 py-3" colSpan={7}>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Nama</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Peran</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={isSelf}
                title={isSelf ? "Tidak bisa mengubah peran akun sendiri" : undefined}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="KASIR">Kasir</option>
                <option value="DAPUR">Dapur</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                run(
                  () => updateUserAction({ id: user.id, name, username, role }),
                  () => setIsEditing(false),
                )
              }
              className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              <Check size={14} /> Simpan
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <X size={14} /> Batal
            </button>
          </div>
          {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
        <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
        <td className="px-4 py-3 text-gray-500">{user.username}</td>
        <td className="px-4 py-3 text-gray-500">{roleLabel[user.role]}</td>
        <td className="px-4 py-3">
          <button
            type="button"
            disabled={isSelf || isPending}
            title={isSelf ? "Tidak bisa menonaktifkan akun sendiri" : undefined}
            onClick={() => run(() => toggleUserActiveAction({ id: user.id }))}
            className={`rounded-full px-2.5 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60 ${
              user.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {user.isActive ? "Aktif" : "Nonaktif"}
          </button>
        </td>
        <td className="px-4 py-3 text-xs text-gray-400">{formatDateTime(user.createdAt)}</td>
        <td className="px-4 py-3">
          <div className="flex gap-1">
            <input
              value={resetPw}
              onChange={(e) => setResetPw(e.target.value)}
              type="password"
              minLength={6}
              placeholder="Password baru"
              className="w-32 rounded-lg border border-gray-300 px-2 py-1 text-xs"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                if (!resetPw) {
                  setError("Isi password baru dulu.");
                  return;
                }
                if (resetPw.length < 6) {
                  setError("Password minimal 6 karakter.");
                  return;
                }
                run(
                  () => resetPasswordAction({ id: user.id, password: resetPw }),
                  () => setResetPw(""),
                );
              }}
              className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
            >
              Reset
            </button>
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
              title="Edit pegawai"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              disabled={isSelf || isPending}
              title={isSelf ? "Tidak bisa menghapus akun sendiri" : "Hapus pegawai"}
              onClick={() => run(() => deleteUserAction({ id: user.id }))}
              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>
      {error && (
        <tr className="border-b border-gray-50 last:border-0">
          <td colSpan={7} className="bg-red-50 px-4 py-2 text-xs text-red-600">
            {error}
          </td>
        </tr>
      )}
    </>
  );
}
