import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CreateUserForm } from "@/components/CreateUserForm";
import { PegawaiRow } from "@/components/PegawaiRow";
import { InfoTooltip } from "@/components/InfoTooltip";

export default async function PegawaiPage() {
  const session = await auth();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center text-xl font-bold text-gray-900">
          Manajemen Pegawai
          <InfoTooltip text="Kelola akun pengguna aplikasi: Admin (akses penuh), Kasir, dan Dapur. Bisa tambah akun baru, edit nama/username/peran, reset password, atau nonaktifkan akun tanpa menghapus datanya." />
        </h1>
        <p className="text-sm text-gray-500">Kelola akun admin, kasir, dan dapur</p>
      </div>

      <CreateUserForm />

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
              <PegawaiRow key={u.id} user={u} isSelf={u.id === session?.user.id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
