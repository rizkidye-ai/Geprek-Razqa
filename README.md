# Geprek Rzqa — Sistem Manajemen Warung Makan

Aplikasi web untuk mengelola operasional **Warung Makan Geprek Rzqa** sehari-hari: kasir/POS, dapur, stok bahan baku, meja, menu & resep, laporan penjualan, hingga manajemen pegawai. Dibangun dengan Next.js (App Router), TypeScript, Prisma + SQLite, dan Tailwind CSS.

## Fitur Utama

- **Dashboard** — omzet hari ini, jumlah pesanan per status, menu terlaris, grafik penjualan 7 hari, dan peringatan stok menipis.
- **Kasir (POS)** — pilih menu per kategori, keranjang belanja interaktif, pilih meja (dine-in) atau bawa pulang, hitung kembalian tunai, cetak struk.
- **Pesanan & Dapur** — papan status pesanan (Baru → Diproses → Siap → Selesai) untuk alur kerja dapur, lengkap dengan pembatalan pesanan.
- **Menu & Resep** — CRUD menu dan kategori, serta resep bahan baku (BOM) per porsi sehingga stok otomatis berkurang saat pesanan dibuat.
- **Stok Bahan Baku** — catat stok masuk/keluar, ambang batas stok minimum, riwayat pergerakan stok, dan peringatan otomatis saat menipis.
- **Manajemen Meja** — status meja kosong/terisi yang otomatis diperbarui mengikuti alur pesanan.
- **Laporan Penjualan** — filter periode tanggal, grafik omzet harian, rincian metode pembayaran, menu terlaris, dan export CSV.
- **Manajemen Pegawai** — akun dengan tiga peran (Admin/Pemilik, Kasir, Dapur), reset password, aktif/nonaktifkan akun.
- **Pengaturan Warung** — nama, alamat, telepon, dan catatan kaki struk.

## Peran Pengguna

| Peran | Akses |
|---|---|
| **Admin (Pemilik)** | Semua fitur, termasuk menu, laporan, pegawai, dan pengaturan |
| **Kasir** | Dashboard, Kasir/POS, Pesanan, Meja, Stok |
| **Dapur** | Dashboard, Pesanan & Dapur (update status pesanan) |

## Menjalankan Secara Lokal

### 1. Persiapan

```bash
npm install
cp .env.example .env
```

Isi `.env` bila perlu (nilai default sudah bisa langsung dipakai untuk pengembangan lokal):

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="ganti-dengan-string-acak-yang-panjang-dan-rahasia"
```

### 2. Siapkan database

```bash
npx prisma migrate dev
npm run db:seed
```

Perintah seed akan membuat data contoh: kategori & menu geprek, bahan baku, 8 meja, dan 3 akun pengguna demo.

### 3. Jalankan server pengembangan

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

1. **Kasir** membuat pesanan baru di halaman **Kasir (POS)**: pilih menu, tentukan meja/bawa pulang, pilih metode pembayaran, lalu simpan. Stok bahan baku otomatis berkurang sesuai resep, meja otomatis ditandai terisi, dan struk siap dicetak.
2. **Dapur** memantau pesanan masuk di halaman **Pesanan & Dapur** dan memperbarui status seiring proses memasak: Baru → Diproses → Siap → Selesai.
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
- **Prisma ORM + SQLite** (`prisma/schema.prisma`) — mudah diganti ke PostgreSQL/MySQL untuk produksi dengan mengubah `provider` datasource
- **NextAuth v5 (Auth.js)** — autentikasi berbasis kredensial dengan sesi JWT dan middleware proteksi rute berbasis peran
- **Tailwind CSS** untuk tampilan
- **Recharts** untuk grafik penjualan

## Model Data Inti

`User` (peran) · `Category` & `MenuItem` (menu) · `Ingredient` & `MenuIngredient` (bahan baku & resep/BOM) · `RestaurantTable` (meja) · `Order` & `OrderItem` (pesanan) · `Payment` (pembayaran) · `StockMovement` (riwayat stok) · `Settings` (info warung untuk struk).

## Catatan Produksi

Sebelum digunakan secara nyata untuk operasional warung:

- Ganti `AUTH_SECRET` dengan nilai acak yang kuat dan rahasia.
- Pertimbangkan migrasi dari SQLite ke PostgreSQL/MySQL untuk multi-user/multi-perangkat yang lebih andal.
- Aktifkan HTTPS dan atur backup database berkala.
