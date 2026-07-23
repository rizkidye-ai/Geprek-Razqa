# Geprek Rzqa — Sistem Manajemen Warung Makan

Aplikasi web untuk mengelola operasional **Warung Makan Geprek Rzqa** sehari-hari: kasir/POS, dapur, stok bahan baku, meja, menu & resep, laporan penjualan, hingga manajemen pegawai. Dibangun dengan Next.js (App Router), TypeScript, Prisma + PostgreSQL, dan Tailwind CSS.

## Fitur Utama

- **Dashboard** — omzet hari ini, jumlah pesanan per status, menu terlaris, grafik penjualan 7 hari, dan peringatan stok menipis.
- **Kasir (POS)** — pilih menu per kategori (dengan pencarian cepat), keranjang belanja interaktif, pilih meja (dine-in) atau bawa pulang, tombol uang cepat, hitung kembalian tunai, cetak struk. Untuk dine-in tersedia opsi **Bayar Nanti** (bayar saat pelanggan pulang).
- **Pesanan & Dapur** — papan status pesanan (Baru → Diproses → Siap → Selesai) untuk alur kerja dapur, lengkap dengan pembatalan pesanan dan tombol Bayar untuk pesanan dine-in yang belum dibayar. Bisa dinonaktifkan lewat **Mode Dapur** di Pengaturan (untuk warung yang jualan dari stok siap saji, bukan masak per-pesanan) — pesanan baru langsung berstatus Selesai sejak dibuat, tetap bisa dibatalkan hari itu juga dan tetap bisa diproses tombol Bayar kalau belum dibayar.
- **Menu & Resep** — CRUD menu dan kategori, serta resep bahan baku (BOM) per porsi sehingga stok otomatis berkurang saat pesanan dibuat.
- **Stok Bahan Baku** — catat stok masuk/keluar, ambang batas stok minimum, riwayat pergerakan stok, dan peringatan otomatis saat menipis.
- **Manajemen Meja** — status meja kosong/terisi yang otomatis diperbarui mengikuti alur pesanan.
- **Laporan Penjualan** — filter periode tanggal, grafik omzet harian, rincian metode pembayaran, menu terlaris, dan export CSV.
- **Manajemen Pegawai** — akun dengan tiga peran (Admin/Pemilik, Kasir, Dapur), reset password, aktif/nonaktifkan akun.
- **Pengaturan Warung** — nama, alamat, telepon, logo, catatan kaki struk, dan toggle **Mode Dapur** (aktif/nonaktif). Logo otomatis tampil di sidebar, halaman login, dan struk.
- **Keuangan** (khusus Admin):
  - **HPP** — biaya bahan baku per menu (dari resep × biaya bahan) dibanding harga jual, dengan margin per item.
  - **CAPEX & OPEX** — catat pengeluaran modal/investasi dan biaya operasional rutin.
  - **Arus Kas** — kas masuk (penjualan) vs kas keluar (CAPEX+OPEX) per periode, lengkap grafik harian.
  - **Laba Rugi** — Pendapatan − HPP = Laba Kotor − OPEX = Laba Bersih, per periode.
  - **BEP, ROI & Kelayakan Bisnis** — titik impas (unit & Rupiah), ROI dari investasi CAPEX, estimasi payback period, dan indikasi kelayakan bisnis.

## Peran Pengguna

| Peran | Akses |
|---|---|
| **Admin (Pemilik)** | Semua fitur, termasuk menu, laporan, keuangan, pegawai, dan pengaturan |
| **Kasir** | Dashboard, Kasir/POS, Pesanan, Meja, Stok |
| **Dapur** | Dashboard, Pesanan & Dapur (update status pesanan) |

## Menjalankan Secara Lokal

### 1. Siapkan database PostgreSQL gratis

Aplikasi ini butuh database PostgreSQL. Cara tercepat & gratis: buat akun di [neon.tech](https://neon.tech) atau [supabase.com](https://supabase.com), buat project baru, lalu salin connection string-nya (format: `postgresql://user:password@host/dbname?sslmode=require`).

### 2. Persiapan

```bash
npm install
cp .env.example .env
```

Isi `.env`:

```
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
AUTH_SECRET="ganti-dengan-string-acak-yang-panjang-dan-rahasia"
```

### 3. Migrasi & isi data contoh

```bash
npx prisma migrate deploy
npm run db:seed
```

Perintah seed akan membuat data contoh: kategori & menu geprek, bahan baku, 8 meja, dan 3 akun pengguna demo.

### 4. Jalankan server pengembangan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Akun Demo

| Username | Password | Peran |
|---|---|---|
| `admin` | `geprek123` | Pemilik / Admin |
| `kasir` | `geprek123` | Kasir |
| `dapur` | `geprek123` | Dapur |

## Alur Kerja Aplikasi

1. **Kasir** membuat pesanan baru di halaman **Kasir (POS)**: pilih menu, tentukan meja/bawa pulang, pilih metode pembayaran (atau **Bayar Nanti** untuk dine-in), lalu simpan. Stok bahan baku otomatis berkurang sesuai resep, meja otomatis ditandai terisi, dan struk siap dicetak.
2. **Dapur** memantau pesanan masuk di halaman **Pesanan & Dapur** dan memperbarui status seiring proses memasak: Baru → Diproses → Siap → Selesai. Untuk pesanan dine-in yang dipilih "Bayar Nanti", tahap Selesai baru bisa ditandai setelah kasir memproses pembayaran lewat tombol **Bayar**.
3. Saat pesanan **Selesai**, meja dine-in otomatis kembali berstatus kosong jika tidak ada pesanan aktif lain di meja tersebut.
4. Pesanan dapat **dibatalkan** (oleh Admin/Kasir) selama belum selesai — stok bahan baku yang telah dipakai akan dikembalikan secara otomatis.
5. **Admin** memantau performa warung lewat **Dashboard** dan **Laporan Penjualan**, mengelola **Menu & Resep**, **Stok**, **Pegawai**, dan **Pengaturan** warung.

## Skrip yang Tersedia

| Perintah | Keterangan |
|---|---|
| `npm run dev` | Menjalankan server pengembangan |
| `npm run build` | Build produksi |
| `npm run start` | Menjalankan build produksi |
| `npm run lint` | Menjalankan ESLint |
| `npm run db:seed` | Mengisi ulang database dengan data contoh (menghapus data lama) |
| `npm run db:reset` | Reset database (drop, migrate ulang, seed) |

## Struktur Teknologi

- **Next.js 16** (App Router, Server Actions, Turbopack)
- **TypeScript**
- **Prisma ORM + PostgreSQL** (`prisma/schema.prisma`)
- **NextAuth v5 (Auth.js)** — autentikasi berbasis kredensial dengan sesi JWT dan middleware proteksi rute berbasis peran
- **Tailwind CSS** untuk tampilan
- **Recharts** untuk grafik penjualan

## Model Data Inti

`User` (peran) · `Category` & `MenuItem` (menu) · `Ingredient` & `MenuIngredient` (bahan baku & resep/BOM, termasuk `costPerUnit` untuk HPP) · `RestaurantTable` (meja) · `Order` & `OrderItem` (pesanan) · `Payment` (pembayaran) · `StockMovement` (riwayat stok) · `Expense` (CAPEX/OPEX) · `Settings` (info warung untuk struk).

> **Penting untuk laporan Keuangan**: isi `costPerUnit` (biaya per satuan) tiap bahan baku di halaman **Stok Bahan Baku** supaya perhitungan HPP, Laba Rugi, dan BEP/ROI akurat. Data seed sudah menyertakan contoh biaya dan beberapa transaksi CAPEX/OPEX untuk demo.

## Catatan Produksi

Sebelum digunakan secara nyata untuk operasional warung:

- Ganti `AUTH_SECRET` dengan nilai acak yang kuat dan rahasia.
- Set `SEED_ADMIN_PASSWORD` / `SEED_KASIR_PASSWORD` / `SEED_DAPUR_PASSWORD` sebelum menjalankan `npm run db:seed` — jangan pakai password default `geprek123`.
- Pastikan backup otomatis database aktif (Neon/Supabase sudah menyediakan ini di paket gratis).

Untuk panduan deploy gratis ke Vercel + Neon supaya bisa dijual/dipakai pelanggan sungguhan (termasuk checklist keamanan per pelanggan), lihat [DEPLOY.md](./DEPLOY.md).
