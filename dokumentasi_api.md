# HelpVerse - Web Ticketing Platform API

## Deskripsi Proyek
HelpVerse adalah platform ticketing event yang memungkinkan event organizer untuk membuat dan mempublikasikan event, serta memungkinkan pengguna untuk membeli tiket event secara online.

## Teknologi Stack
- **Backend**: Node.js dengan Express.js
- **Database**: MongoDB dengan Mongoose sebagai ODM
- **Package Manager**: pnpm
- **Language**: TypeScript
- **Authentication**: JWT (JSON Web Token)

## Struktur Proyek
```
helpverse/
├── src/
│   ├── config/          # Konfigurasi aplikasi dan database
│   ├── controllers/     # Business logic
│   ├── middlewares/     # Middleware untuk auth, validasi, dll
│   ├── models/          # Schema dan model database
│   ├── routes/          # API endpoints
│   ├── services/        # Logika bisnis kompleks
│   ├── utils/           # Helper functions
│   ├── seeders/         # Data seeders
│   ├── types/           # TypeScript type definitions
│   ├── validators/      # Request validation
│   └── app.ts           # Entry point aplikasi
├── .env                 # Environment variables
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies dan scripts
└── README.md            # Dokumentasi proyek
```

## Role Pengguna
HelpVerse memiliki 3 role pengguna utama:
1. **User** - Pengguna biasa yang dapat melihat dan membeli tiket event
2. **Event Organizer** - Dapat membuat dan mengelola event mereka sendiri
3. **Admin** - Memiliki akses penuh untuk mengelola semua data dan melakukan approval event

## Model Data

### User Model
```typescript
{
  username: string;         // Unique username
  email: string;            // Unique email address
  password: string;         // Hashed password
  fullName: string;         // User's full name
  phone: string;            // Contact number
  organizerName?: string;   // Required for event organizers
  role: "user" | "eventOrganizer" | "admin";
  createdAt: Date;
  updatedAt: Date;
}
```

### Event Model
```typescript
{
  name: string;             // Event name
  description: string;      // Detailed event description
  date: Date;               // Event date
  time: string;             // Start time
  location: string;         // Physical location
  image: string;            // Event cover image URL
  tickets: [Ticket];        // Array of ticket types
  totalSeats: number;       // Total capacity
  availableSeats: number;   // Remaining seats
  promotionalOffers: [Offer]; // Special discounts
  tags: [string];           // Event tags for search
  createdBy: User;          // Reference to organizer
  createdAt: Date;
  updatedAt: Date;
}
```

### Ticket Model
```typescript
{
  name: string;             // Ticket type name
  description: string;      // Ticket description
  price: number;            // Price in currency
  quantity: number;         // Total available
  startDate: Date;          // Sales start date
  endDate: Date;            // Sales end date
  seatArrangement: {
    rows: number;
    columns: number;
  };
  bookedSeats: [{           // Tracking which seats are taken
    row: number;
    column: number;
    bookingId: string;
  }];
}
```

### Order Model
```typescript
{
  user: User;               // Reference to buyer
  event: Event;             // Reference to event
  tickets: [{
    ticketType: string;     // Reference to ticket type
    quantity: number;       // Number of tickets
    seats: [{row: number, column: number}]; // Selected seats
    price: number;          // Price at purchase time
  }];
  totalAmount: number;      // Total amount paid
  discount: number;         // Discount applied if any
  promoCode?: string;       // Promo code used if any
  status: ""confirmed";
  paymentInfo: {
    method: string;
    transactionId: string;
    paidAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/register/event-organizer` - Register event organizer
- `POST /api/auth/login` - Login user (menggunakan username atau email)
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Events
- `GET /api/events` - Get all published events with pagination & filtering
- `GET /api/events/:id` - Get detailed event information
- `POST /api/events` - Create new event (Event Organizer/Admin)
- `PUT /api/events/:id` - Update event (Owner/Admin)
- `DELETE /api/events/:id` - Delete event (Owner/Admin)

### Tickets
- `GET /api/events/:id/tickets` - Get available tickets for event
- `GET /api/events/:id/tickets/:ticketId/seats` - Get seat availability

### Orders
- `POST /api/orders` - Create new order/booking
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order

#### Order Request Format
Berikut adalah format JSON yang diharapkan untuk membuat pemesanan tiket baru:

```json
{
  "eventId": "string",           // ID event yang akan dipesan (MongoDB ObjectId)
  "tickets": [                   // Array tiket yang dipesan
    {
      "ticketType": "string",    // Nama jenis tiket (contoh: "VIP", "Regular", "Economy")
      "quantity": number,        // Jumlah tiket yang dipesan
      "seats": [                 // Array kursi yang dipilih (opsional jika event menggunakan seat arrangement)
        {
          "row": number,         // Nomor baris kursi
          "column": number       // Nomor kolom kursi
        }
      ]
    }
  ],
  "promoCode": "string",         // Kode promo (opsional)
  "paymentInfo": {               // Informasi pembayaran
    "method": "string",          // Metode pembayaran (contoh: "credit_card", "paypal", dll)
    "transactionId": "string"    // ID transaksi pembayaran
  }
}
```

Catatan penting:
- `eventId`: Wajib ada dan harus berupa MongoDB ObjectId yang valid
- `tickets`: Wajib berupa array dengan minimal satu item
- Jika `seats` disertakan, jumlah kursi yang dipilih harus sama dengan `quantity`
- `paymentInfo` wajib diisi untuk memproses pembayaran

### Upload
- `POST /api/uploads/image` - Upload gambar (perlu autentikasi)
- `DELETE /api/uploads/image` - Hapus gambar (perlu autentikasi)

### Admin
- `GET /api/admin/events` - Get all events (including unpublished)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/stats` - Get platform statistics

## Format Login Request
Untuk login, API mendukung dua format:

### Format Baru (menggunakan identifier):
```json
{
  "identifier": "username_atau_email@example.com",
  "password": "password123"
}
```

### Format Lama (menggunakan email):
```json
{
  "email": "email@example.com",
  "password": "password123"
}
```

## Data Seeders
Aplikasi harus menyediakan data seeders untuk:
1. Admin account
2. Event Organizer account
3. Regular User account
4. Sample Events
5. Sample Promotional Offers

## Fitur Keamanan & Validasi
- Password hashing menggunakan bcrypt
- JWT authentication dengan refresh token
- Input validation menggunakan Joi/Express Validator
- Rate limiting untuk mencegah brute force attacks
- CORS configuration sesuai dengan CLIENT_URL di .env

## Tugas Prioritas
1. Setup project structure dan environment
2. Implementasi authentication dan user management
3. Implementasi CRUD operations untuk events
5. Implementasi ticket & seat management
6. Implementasi order & booking system

## Contoh Event Data
```javascript
{
  name: 'Tech Conference 2025',
  description: 'The premier tech event in Asia featuring talks from industry giants, workshops on emerging technologies, and networking opportunities. Topics include AI, blockchain, cloud computing, and digital transformation strategies.',
  date: '2025-05-01',
  time: '09:00:00',
  location: 'Kuala Lumpur Convention Centre, 50088 Kuala Lumpur',
  image: 'http://localhost:5173/event-1.png',
  tickets: [
    {
      name: 'VIP',
      description: 'VIP ticket for Tech Conference 2025',
      price: 100,
      quantity: 50,
      endDate: '2025-05-01',
      startDate: '2025-04-01',
      status: 'active',
      seatArrangement: {
        rows: 5,
        columns: 10,
      }
    },
    {
      name: 'Regular',
      description: 'Regular ticket for Tech Conference 2025', 
      price: 50,
      quantity: 80,
      endDate: '2025-05-01',
      startDate: '2025-04-01',
      status: 'active',
      seatArrangement: {
        rows: 8,
        columns: 10,
      }
    },
    {
      name: 'Economy',
      description: 'Economy ticket for Tech Conference 2025',
      price: 25,
      quantity: 100,
      endDate: '2025-05-01',
      startDate: '2025-04-01',
      status: 'active',
      seatArrangement: {
        rows: 10,
        columns: 10,
      }
    }
  ],
  totalSeats: 230,
  availableSeats: 230,
  published: true,
  approvalStatus: 'approved',
  tags: ['tech', 'conference', 'networking'],
  promotionalOffers: [
    {
      name: 'Early Bird',
      description: 'Early Bird ticket for Tech Conference 2025',
      code: 'EARLYBIRD',
      discountType: 'percentage',
      discountValue: 25,
      maxUses: 100,
      currentUses: 0,
      validFrom: '2025-04-01',
      validUntil: '2025-04-15',
      active: true
    }
  ],
  createdBy: {
    username: 'eventorganizer1',
    fullName: 'Event Organizer 1',
    email: 'eventorganizer1@malaysiaevents.com',
    phone: '0123456790',
    role: 'eventOrganizer'
  },
  createdAt: new Date(),
  updatedAt: new Date()
}
```
