# Dokumentasi Frontend - HELPVerse Ticketing System

## Ringkasan API

Dokumentasi ini menyediakan informasi komprehensif tentang cara mengintegrasikan frontend dengan backend HELPVerse Ticketing System API.

## Base URL API

```
http://localhost:5000
```

## Format Response API

Semua respons API mengikuti format yang konsisten:

### Respons Sukses
```json
{
  "success": true,
  "data": { ... }
}
```

### Respons Error
```json
{
  "success": false,
  "message": "Pesan error dalam bahasa Indonesia"
}
```

## Autentikasi

API menggunakan JSON Web Tokens (JWT) untuk autentikasi. Token diperoleh melalui endpoint login dan harus disertakan dalam header `Authorization` sebagai Bearer token untuk endpoint yang dilindungi.

Contoh:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Login

**Endpoint:** `POST /api/auth/login`

**Body Request:**
```json
{
  "email": "string",
  "password": "string",
  "rememberMe": boolean
}
```

### Register

**Endpoint:** `POST /api/auth/register`

**Body Request:**
```json
{
  "username": "string",
  "fullName": "string",
  "email": "string",
  "password": "string",
  "role": "eventOrganizer",
  "phone": "string",
  "organizationName": "string",
  "agreeTerms": true
}
```

## Endpoint Utama

### Mendapatkan Semua Events

**Endpoint:** `GET /api/events`

**Parameter Query (Opsional):**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `search`: string (pencarian berdasarkan nama/deskripsi/lokasi)
- `sort`: string (urutan field, awalan - untuk descending)
- `select`: string (field yang ingin ditampilkan, dipisahkan koma)

### Mendapatkan Detail Event

**Endpoint:** `GET /api/events/:id`

**Catatan Penting:**
- Respons akan menyertakan `seatArrangement` yang berisi semua informasi kursi untuk event
- Field `seats` dalam `seatArrangement` berisi array dari semua kursi yang tersedia
- Tidak ada batasan jumlah kursi yang ditampilkan dalam respons

### Membuat Booking

**Endpoint:** `POST /api/bookings`

**Body Request:**
```json
{
  "event": "string (event_id)",
  "tickets": [
    {
      "ticketType": "string (ticket_id)",
      "quantity": number
    }
  ],
  "seats": [
    {
      "id": "string (seat_id)"
    }
  ],
  "paymentMethod": "credit_card" | "bank_transfer" | "paypal" | "e-wallet" | "debit_card"
}
```

## Struktur Data Utama

### Event

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "date": "string",
  "time": "string",
  "location": "string",
  "image": "string",
  "totalSeats": number,
  "availableSeats": number,
  "published": boolean,
  "approvalStatus": "pending" | "approved" | "rejected",
  "approvalNotes": "string",
  "organizer": {
    "id": "string",
    "name": "string",
    "email": "string"
  },
  "ticketTypes": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "price": number,
      "formattedPrice": "RM XX.XX",
      "category": "string",
      "available": number,
      "quantity": number,
      "maxPerOrder": number
    }
  ],
  "seatArrangement": {
    "rows": number,
    "columns": number,
    "seats": [
      {
        "id": "string",
        "status": "available" | "reserved" | "selected",
        "price": number
      }
    ]
  },
  "promotionalOffers": [
    {
      "code": "string",
      "discountType": "percentage" | "fixed",
      "discountValue": number,
      "maxUses": number,
      "currentUses": number,
      "validFrom": "date",
      "validUntil": "date",
      "active": boolean
    }
  ]
}
```

### Seat

Model data kursi yang akan ditampilkan dalam `seatArrangement`:

```json
{
  "id": "string",
  "status": "available" | "reserved" | "booked",
  "price": number
}
```

## Panduan Implementasi

### Menampilkan Layout Kursi

Saat menampilkan layout kursi untuk sebuah event, perhatikan bahwa API akan mengembalikan semua data kursi dalam response. Tidak ada batasan jumlah kursi yang ditampilkan, sehingga Anda dapat mengakses dan menampilkan semua kursi yang tersedia untuk event tersebut.

Gunakan properti `rows` dan `columns` dalam `seatArrangement` untuk mengatur tata letak visual kursi, serta array `seats` untuk menentukan status dan harga masing-masing kursi.

### Contoh Penggunaan untuk Menampilkan Kursi

```javascript
// Mendapatkan data event
const fetchEventData = async (eventId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/events/${eventId}`);
    const data = await response.json();
    
    if (data.success) {
      const event = data.data;
      renderSeatArrangement(event.seatArrangement);
    }
  } catch (error) {
    console.error('Error fetching event data:', error);
  }
};

// Render layout kursi
const renderSeatArrangement = (seatArrangement) => {
  const { rows, columns, seats } = seatArrangement;
  
  // Buat grid layout berdasarkan rows dan columns
  const seatGrid = document.getElementById('seat-grid');
  seatGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  
  // Pastikan semua kursi ditampilkan
  seats.forEach((seat, index) => {
    const seatElement = document.createElement('div');
    seatElement.className = `seat ${seat.status}`;
    seatElement.dataset.id = seat.id;
    seatElement.dataset.price = seat.price;
    
    // Tambahkan event listener untuk pemilihan kursi
    seatElement.addEventListener('click', () => {
      if (seat.status === 'available') {
        selectSeat(seat.id);
      }
    });
    
    seatGrid.appendChild(seatElement);
  });
  
  console.log(`Total kursi ditampilkan: ${seats.length}`);
};
```

## Panduan Pemecahan Masalah

### Masalah Umum

1. **Kursi tidak ditampilkan lengkap**
   - Pastikan Anda menggunakan endpoint `GET /api/events/:id` untuk mendapatkan detail event lengkap
   - Tidak ada batasan jumlah kursi yang ditampilkan di API, semua kursi akan dikembalikan

2. **Pemilihan kursi tidak terupdate**
   - Gunakan endpoint `PUT /api/seats/:id` untuk memperbarui status kursi
   - Status kursi: "available", "reserved", "booked"

3. **Format harga tidak konsisten**
   - API menyediakan `formattedPrice` untuk format mata uang yang konsisten (RM XX.XX)
   - Gunakan field ini untuk menampilkan harga di UI

## Informasi Tambahan

Frontend harus dapat menangani:
- Validasi token JWT dan refresh token
- Manajemen state untuk keranjang belanja dan kursi terpilih
- Tampilan responsif untuk layout kursi pada berbagai ukuran layar
- Penanganan error dan retry untuk request API yang gagal

## Kontak Pengembangan

Untuk pertanyaan teknis atau klarifikasi, silakan hubungi tim backend melalui ticket sistem atau email support. 