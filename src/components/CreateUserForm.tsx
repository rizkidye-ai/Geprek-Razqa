"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUserAction, type UserRole } from "@/app/(app)/pegawai/actions";

export function CreateUserForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("KASIR");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const result = await createUserAction({ name, username, password, role });
        if (!result.success) {
          setError(result.error);
          return;
        }
        setName("");
        setUsername("");
        setPassword("");
        setRole("KASIR");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menambah pegawai.");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid max-w-2xl grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:grid-cols-4"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Nama lengkap"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2"
      />
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        placeholder="Username"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as UserRole)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="KASIR">Kasir</option>
        <option value="DAPUR">Dapur</option>
        <option value="ADMIN">Admin</option>
      </select>
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        required
        minLength={6}
        placeholder="Password (min. 6 karakter)"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-3"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-900/10 transition hover:shadow-lg hover:shadow-orange-900/20 disabled:opacity-60"
      >
        {isPending ? "Menyimpan..." : "Tambah Pegawai"}
      </button>
      {error && <p className="text-xs text-red-600 sm:col-span-4">{error}</p>}
    </form>
  );
}
