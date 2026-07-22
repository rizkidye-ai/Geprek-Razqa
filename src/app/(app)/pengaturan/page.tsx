import { prisma } from "@/lib/prisma";
import { SubmitButton } from "@/components/SubmitButton";
import { LogoUploadField } from "@/components/LogoUploadField";
import { updateSettingsAction } from "./actions";

export default async function PengaturanPage() {
  const settings = await prisma.settings.findFirst();

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pengaturan Warung</h1>
        <p className="text-sm text-gray-500">Informasi ini tampil di struk pembayaran</p>
      </div>

      <form action={updateSettingsAction} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <LogoUploadField currentLogoUrl={settings?.logoUrl ?? null} />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nama Warung</label>
          <input
            name="name"
            required
            defaultValue={settings?.name ?? "Warung Makan Geprek Rzqa"}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Alamat</label>
          <textarea
            name="address"
            rows={2}
            defaultValue={settings?.address ?? ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">No. Telepon</label>
          <input
            name="phone"
            defaultValue={settings?.phone ?? ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Catatan Kaki Struk</label>
          <input
            name="footer"
            defaultValue={settings?.footer ?? "Terima kasih telah berkunjung!"}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex justify-end">
          <SubmitButton>Simpan Pengaturan</SubmitButton>
        </div>
      </form>
    </div>
  );
}
