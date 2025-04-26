# HelpVerse

HelpVerse adalah platform ticketing event yang memungkinkan event organizer untuk membuat dan mempublikasikan event, serta memungkinkan pengguna untuk membeli tiket event secara online.

## 📋 Daftar Isi

- [Tentang Aplikasi](#tentang-aplikasi)
- [Fitur Utama](#fitur-utama)
- [Cara Instalasi](#cara-instalasi)
- [Penggunaan Aplikasi](#penggunaan-aplikasi)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Pengembangan Lanjutan](#pengembangan-lanjutan)
- [Lisensi](#lisensi)

## 📌 Tentang Aplikasi

HelpVerse adalah platform ticketing event komprehensif yang memungkinkan:
- **Event Organizer** untuk membuat dan mengelola event
- **Pengguna** untuk mencari, memesan, dan membeli tiket event
- **Admin** untuk mengelola seluruh platform

Aplikasi ini dirancang untuk memberikan pengalaman yang mulus dalam mengelola dan menghadiri berbagai jenis event.

## ✨ Fitur Utama

### Manajemen Pengguna
- Registrasi dengan 3 role: User, Event Organizer, dan Admin
- Login/Logout dengan autentikasi JWT
- Profil pengguna dengan riwayat pembelian tiket

### Manajemen Event
- Pencarian dan filter event berdasarkan tanggal, lokasi, dan tag
- Halaman detail event dengan informasi komprehensif
- Galeri gambar event

### Sistem Tiket
- Berbagai tipe tiket dengan harga berbeda
- Pemilihan kursi berdasarkan denah venue
- Penerapan diskon dan kode promo

### Proses Pemesanan
- Pemesanan tiket event
- Sistem waiting list untuk event dengan tiket terbatas
- Manajemen pemesanan dan pembayaran

## 💻 Cara Instalasi

### Prasyarat
- [Node.js](https://nodejs.org/) (v18 atau lebih baru)
- [npm](https://www.npmjs.com/) atau [pnpm](https://pnpm.io/) (disarankan)
- Git

### Langkah Instalasi

1. **Clone repositori**
   ```bash
   git clone https://github.com/username/helpverse.git
   cd helpverse
   ```

2. **Instal dependensi**
   ```bash
   pnpm install
   ```
   
   Atau menggunakan npm:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit file `.env` dan sesuaikan dengan konfigurasi yang dibutuhkan.

4. **Jalankan aplikasi dalam mode development**
   ```bash
   pnpm dev
   ```
   
   Atau jika ingin menjalankan dengan proxy CORS:
   ```bash
   pnpm dev:cors
   ```

5. **Build untuk production**
   ```bash
   pnpm build
   ```

6. **Jalankan aplikasi production**
   ```bash
   pnpm start
   ```

## 🚀 Penggunaan Aplikasi

### Untuk Pengguna Umum
1. **Daftar/Login** ke aplikasi
2. **Cari event** yang ingin dihadiri
3. **Pilih tiket** yang diinginkan
4. **Pesan dan bayar** untuk mendapatkan tiket
5. **Lihat tiket** di halaman "My Bookings"

### Untuk Event Organizer
1. **Daftar sebagai Event Organizer** melalui `/register/event-organizer`
2. **Login** ke aplikasi
3. **Buat event baru** melalui `/event/create`
4. **Kelola event** yang telah dibuat
5. **Pantau penjualan tiket** dan statistiknya

### Fitur Waiting List
1. Jika event sudah terjual habis, pengguna dapat **bergabung ke waiting list**
2. Pengguna akan **menerima notifikasi** jika tiket tersedia
3. Pengguna dapat **membatalkan** pendaftaran waiting list di halaman "My Waiting List"

## 🛠️ Tech Stack

### Frontend
- React dengan React Router
- TypeScript
- Tailwind CSS
- Axios untuk HTTP request

### Development Tools
- Vite sebagai build tool
- ESLint dan TypeScript untuk type checking

## 📁 Struktur Proyek

```
helpverse/
├── app/                  # Kode sumber aplikasi
│   ├── components/       # Komponen React reusable
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Halaman utama aplikasi
│   ├── routes/           # Route components
│   ├── services/         # Service untuk API call
│   └── utils/            # Fungsi utilitas
├── public/               # Aset statis
├── .react-router/        # Konfigurasi React Router
├── node_modules/         # Dependensi
└── ...                   # File konfigurasi lainnya
```

## 🔧 Pengembangan Lanjutan

### Menjalankan Pengujian
```bash
pnpm test
```

### Type Checking
```bash
pnpm typecheck
```

### Konfigurasi CORS Proxy
Jika Anda mengalami masalah CORS saat development, gunakan:
```bash
pnpm proxy
```

## 📄 Lisensi

[MIT License](LICENSE)
