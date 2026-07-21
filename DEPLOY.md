# Panduan Deploy untuk Dijual ke Pelanggan

Dokumen ini untuk **Anda (penjual/pengelola)**, bukan untuk pelanggan. Model yang dipakai: **satu instance terpisah per pelanggan** — tiap warung yang beli mendapat aplikasi dan database miliknya sendiri, sepenuhnya terpisah dari pelanggan lain. Pelanggan hanya menerima link + akun login, tidak perlu sentuh kode sama sekali.

## Kenapa model ini?

- Tidak perlu bongkar arsitektur (kode saat ini memang didesain untuk satu warung/satu database).
- Data antar pelanggan otomatis terisolasi total (tidak mungkin bocor ke pelanggan lain, karena literally beda database & deployment).
- Bisa mulai jual **hari ini** tanpa investasi development lanjutan.
- Trade-off: setiap ada pelanggan baru, Anda perlu deploy instance baru (memakan waktu, tapi bisa dijadikan checklist/SOP yang cepat setelah dilakukan beberapa kali).

## Rekomendasi Hosting: Railway

[Railway](https://railway.app) dipilih karena:
- Mendukung Next.js langsung dari GitHub repo (tidak perlu konfigurasi server manual).
- Punya **persistent volume**, jadi database SQLite yang dipakai aplikasi ini tetap aman tersimpan (tidak hilang tiap deploy) — tidak perlu migrasi ke Postgres.
- Ada paket gratis/murah untuk mulai, HTTPS otomatis, dan domain gratis (`namaanda.up.railway.app`) atau bisa pasang domain sendiri.

## Langkah Deploy Satu Instance Pelanggan Baru

1. **Buat New Project di Railway** → "Deploy from GitHub repo" → pilih repo `geprek-razqa`, branch `claude/warung-makan-geprek-rzqa-razn79` (atau branch utama setelah di-merge).
2. **Tambahkan Volume**: Settings → Volumes → mount di path `/app/prisma` (supaya file `dev.db` persisten antar restart/redeploy).
3. **Set Environment Variables** di tab Variables:
   ```
   DATABASE_URL=file:./prisma/dev.db
   AUTH_SECRET=<generate string acak, minimal 32 karakter — lihat cara di bawah>
   NODE_ENV=production
   SEED_ADMIN_PASSWORD=<password unik untuk pelanggan ini>
   SEED_KASIR_PASSWORD=<password unik untuk pelanggan ini>
   SEED_DAPUR_PASSWORD=<password unik untuk pelanggan ini>
   ```
   Generate `AUTH_SECRET` acak, contoh lewat terminal: `openssl rand -base64 32`
4. **Set Build & Start Command** (biasanya otomatis terdeteksi, tapi pastikan):
   - Build: `npm run build`
   - Start: `npx prisma migrate deploy && npm run db:seed && npm run start` (khusus **deploy pertama kali** saja — setelah itu ganti Start Command menjadi `npx prisma migrate deploy && npm run start` saja, supaya data pelanggan tidak ter-reset setiap restart).
5. **Deploy**, tunggu selesai, lalu buka URL yang diberikan Railway.
6. **Login sebagai admin** dengan password yang Anda set di `SEED_ADMIN_PASSWORD`, lalu:
   - Buka **Pengaturan** → isi nama warung, alamat, telepon, footer struk sesuai pelanggan.
   - Buka **Menu & Resep** → sesuaikan menu, harga, dan resep bahan baku milik warung pelanggan (data seed adalah contoh generik "Geprek Rzqa").
   - Buka **Pegawai** → sesuaikan nama pegawai/kasir/dapur sesuai staf pelanggan.
7. **Serahkan ke pelanggan**: berikan URL Railway (atau domain custom) + username/password admin. Sarankan pelanggan ganti password lewat menu Pegawai setelah pertama kali pakai.

## Checklist Keamanan Sebelum Diserahkan ke Pelanggan

- [ ] `AUTH_SECRET` unik per pelanggan (jangan pernah dipakai ulang / dibagi antar pelanggan).
- [ ] Password admin/kasir/dapur **bukan** `geprek123` (sudah diset lewat `SEED_*_PASSWORD`).
- [ ] `NODE_ENV=production` sudah diset (ini otomatis menyembunyikan kotak "Akun demo" di halaman login).
- [ ] Data menu/harga/pegawai sudah disesuaikan dengan warung pelanggan, bukan data contoh.
- [ ] Volume database sudah aktif (supaya data tidak hilang saat aplikasi restart/redeploy).

## Backup Data Pelanggan

Karena tiap pelanggan punya database SQLite sendiri (file `prisma/dev.db` di volume Railway), sebaiknya:
- Jadwalkan download/backup berkala file database itu (Railway punya fitur backup volume, atau bisa dilakukan manual via `railway run` / shell).
- Simpan salinan backup di tempat terpisah (Google Drive, dsb.) untuk jaga-jaga.

## Kalau Nanti Mau Naik Kelas ke SaaS Multi-Tenant

Kalau pelanggan sudah banyak dan proses deploy manual per pelanggan mulai merepotkan, langkah lanjutannya adalah membangun versi **multi-tenant**: satu aplikasi, satu database besar (biasanya Postgres), tiap pelanggan diberi `tenantId` sehingga data mereka otomatis terpisah secara logis, dan bisa ditambah sistem langganan/pembayaran otomatis. Ini pengerjaan besar (butuh perubahan skema database + middleware tenant + billing), jadi baru worth it kalau permintaan sudah cukup banyak untuk menutup biaya pengembangannya.
