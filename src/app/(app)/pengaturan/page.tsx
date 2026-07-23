import { prisma } from "@/lib/prisma";
import { SubmitButton } from "@/components/SubmitButton";
import { LogoUploadField } from "@/components/LogoUploadField";
import { InfoTooltip } from "@/components/InfoTooltip";
import { updateSettingsAction } from "./actions";

export default async function PengaturanPage() {
  const settings = await prisma.settings.findFirst();

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <h1 className="flex items-center text-xl font-bold text-gray-900">
          Pengaturan Warung
          <InfoTooltip text="Atur nama, alamat, telepon, logo, dan catatan kaki warung. Informasi ini otomatis tampil di sidebar, halaman login, dan struk pembayaran." />
        </h1>
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
        <div className="rounded-xl border border-gray-200 p-3">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="kitchenModeEnabled"
              defaultChecked={settings?.kitchenModeEnabled ?? true}
              className="peer sr-only"
            />
            <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-gray-200 transition-colors peer-checked:bg-orange-500 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
            <span>
              <span className="flex items-center text-sm font-medium text-gray-700">
                Mode Dapur Aktif
                <InfoTooltip text="ON (bawaan): pesanan baru masuk sebagai 'Baru' dan harus melalui tahap Diproses → Siap di halaman Pesanan & Dapur. OFF: pesanan baru langsung berstatus 'Siap' — cocok kalau jualan dari makanan yang sudah dimasak/siap duluan (tanpa masak per-pesanan), sehingga dapur tidak perlu standby menandai tahap masak satu-satu. Halaman Pesanan & Dapur tetap ada, tidak dihapus, dan bisa diaktifkan lagi kapan saja." />
              </span>
              <span className="text-xs text-gray-400">
                Matikan kalau jualan dari stok yang sudah dimasak duluan, tanpa perlu tahap masak per-pesanan.
              </span>
            </span>
          </label>
        </div>

        <div className="flex justify-end">
          <SubmitButton>Simpan Pengaturan</SubmitButton>
        </div>
      </form>
    </div>
  );
}
