# Panduan Deploy Gratis (Vercel + Neon) untuk Dijual ke Pelanggan

Dokumen ini untuk **Anda (penjual/pengelola)**, bukan untuk pelanggan. Model yang dipakai: **satu instance terpisah per pelanggan** — tiap warung yang beli mendapat aplikasi dan database miliknya sendiri, sepenuhnya terpisah dari pelanggan lain. Pelanggan hanya menerima link + akun login, tidak perlu sentuh kode sama sekali.

## Kenapa Vercel + Neon?

- **Gratis selamanya** untuk skala kecil (satu warung), tidak ada kartu kredit yang perlu dicharge otomatis.
- **Sangat cepat** — deploy dari GitHub ke Vercel biasanya selesai kurang dari 2 menit, dan bikin database Neon cuma butuh beberapa klik.
- **Aman** — HTTPS otomatis di Vercel, Neon terenkripsi & punya backup otomatis (point-in-time restore) bahkan di paket gratis.
- Tidak perlu bongkar arsitektur kode: aplikasi ini sudah didesain untuk satu warung/satu database.
- Trade-off: setiap pelanggan baru = 1 project Vercel + 1 database Neon baru (bisa dijadikan checklist/SOP cepat setelah dilakukan beberapa kali).

## Langkah Deploy Satu Instance Pelanggan Baru

### 1. Buat database gratis di Neon

1. Buka [neon.tech](https://neon.tech) → daftar (bisa pakai akun Google) → buat **New Project**, kasih nama sesuai pelanggan (mis. `geprek-rzqa-cabang-a`).
2. Setelah project dibuat, salin **Connection String**-nya (format `postgresql://user:password@ep-xxxx.aws.neon.tech/dbname?sslmode=require`).

### 2. Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → daftar/login pakai akun GitHub Anda.
2. **Add New Project** → pilih repo `geprek-razqa` (branch `claude/warung-makan-geprek-rzqa-razn79`, atau branch utama setelah di-merge).
3. Sebelum klik Deploy, buka bagian **Environment Variables**, isi:
   ```
   DATABASE_URL   = <connection string dari Neon>
   AUTH_SECRET    = <string acak minimal 32 karakter, unik per pelanggan>
   SEED_ADMIN_PASSWORD = <password unik untuk pelanggan ini>
   SEED_KASIR_PASSWORD = <password unik untuk pelanggan ini>
   SEED_DAPUR_PASSWORD = <password unik untuk pelanggan ini>
   ```
   Cara generate `AUTH_SECRET` acak: buka terminal, jalankan `openssl rand -base64 32` (atau situs generator password online untuk string acak panjang).
4. Klik **Deploy**. Tunggu sampai selesai (biasanya 1-2 menit).

### 3. Migrasi & isi data awal (sekali per pelanggan)

Setelah deploy pertama berhasil, jalankan ini **dari komputer Anda** (butuh Node.js terpasang), supaya tabel & data awal terbentuk di database Neon pelanggan tersebut:

```bash
# di folder project, sementara arahkan .env ke database Neon pelanggan ini
npx prisma migrate deploy
npm run db:seed
```

> Alternatif tanpa command line: Neon punya **SQL Editor** di dashboard-nya, tapi cara `prisma migrate deploy` di atas paling aman karena skema dijamin sama persis dengan kode aplikasi.

### 4. Setup akhir lewat aplikasi

1. Buka URL Vercel yang diberikan (misalnya `nama-project.vercel.app`), login sebagai admin dengan password dari `SEED_ADMIN_PASSWORD`.
2. **Pengaturan** → isi nama warung, alamat, telepon, footer struk sesuai pelanggan.
3. **Menu & Resep** → sesuaikan menu, harga, resep bahan baku milik warung pelanggan (data seed adalah contoh generik "Geprek Rzqa").
4. **Pegawai** → sesuaikan nama pegawai/kasir/dapur sesuai staf pelanggan.
5. (Opsional) Pasang domain sendiri milik pelanggan lewat tab **Domains** di project Vercel, kalau pelanggan punya domain sendiri.

### 5. Serahkan ke pelanggan

Berikan URL (Vercel default atau domain custom) + username/password admin. Sarankan pelanggan ganti password lewat menu **Pegawai** setelah pertama kali pakai.

## Checklist Keamanan Sebelum Diserahkan ke Pelanggan

- [ ] `AUTH_SECRET` unik per pelanggan (jangan pernah dipakai ulang / dibagi antar pelanggan).
- [ ] Password admin/kasir/dapur **bukan** `geprek123` (sudah diset lewat `SEED_*_PASSWORD` sebelum seed dijalankan).
- [ ] Kotak "Akun demo" di halaman login sudah otomatis hilang (Vercel selalu build dengan `NODE_ENV=production`, jadi ini otomatis aman).
- [ ] Data menu/harga/pegawai sudah disesuaikan dengan warung pelanggan, bukan data contoh.
- [ ] Database Neon pelanggan terpisah dari pelanggan lain (project Neon baru per pelanggan, bukan database yang dipakai bersama).

## Backup Data Pelanggan

Neon otomatis menyimpan riwayat (point-in-time restore) beberapa hari ke belakang bahkan di paket gratis. Untuk jaga-jaga tambahan, sebaiknya sesekali export data lewat `pg_dump` (tersedia di dashboard Neon → Connection Details → cara koneksi via `psql`/`pg_dump`) dan simpan salinannya di tempat terpisah (Google Drive, dsb).

## Kalau Nanti Mau Naik Kelas ke SaaS Multi-Tenant

Kalau pelanggan sudah banyak dan proses deploy manual per pelanggan (1 project Vercel + 1 database Neon tiap kali) mulai merepotkan, langkah lanjutannya adalah membangun versi **multi-tenant**: satu aplikasi, satu database besar, tiap pelanggan diberi `tenantId` sehingga data mereka otomatis terpisah secara logis, dan bisa ditambah sistem langganan/pembayaran otomatis. Ini pengerjaan besar (butuh perubahan skema database + middleware tenant + billing), jadi baru worth it kalau permintaan sudah cukup banyak untuk menutup biaya pengembangannya.
