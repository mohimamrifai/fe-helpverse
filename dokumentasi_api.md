# HELPVerse API Documentation

## Overview

This document provides comprehensive documentation for the HELPVerse API, a RESTful backend service for event management and ticketing system built with Node.js, Express, and MongoDB.

## Base URL

```
http://localhost:5000
```

## Authentication

The API uses JSON Web Tokens (JWT) for authentication. Tokens are obtained through the login endpoint and should be included in the `Authorization` header as a Bearer token for protected endpoints.

Example:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Pesan error dalam bahasa Indonesia"
}
```

## Role-Based Authorization

The system implements three user roles with different permissions:

1. **Admin**: Full access to all endpoints
2. **Event Organizer**: Can create and manage their own events
3. **User**: Can browse events and make bookings

## API Endpoints

### Authentication

#### Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "rememberMe": boolean
}
```

**Response:**
```json
{
  "success": true,
  "token": "JWT_TOKEN_HERE",
  "data": {
    "id": "user_id",
    "username": "string",
    "fullName": "string",
    "email": "string",
    "role": "admin" | "eventOrganizer" | "user"
  }
}
```

#### Register Event Organizer

**Endpoint:** `POST /api/auth/register`

**Description:** Register a new event organizer account

**Request Body:**
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

**Response:**
```json
{
  "success": true,
  "token": "JWT_TOKEN_HERE",
  "data": {
    "id": "user_id",
    "username": "string",
    "fullName": "string",
    "role": "eventOrganizer"
  }
}
```

#### Get Current User

**Endpoint:** `GET /api/auth/me`

**Description:** Get the current authenticated user's details

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "username": "string",
    "fullName": "string",
    "email": "string",
    "role": "admin" | "eventOrganizer" | "user",
    "phone": "string",
    "organizationName": "string"
  }
}
```

#### Logout

**Endpoint:** `GET /api/auth/logout`

**Description:** Logout the current user

**Response:**
```json
{
  "success": true,
  "message": "Anda berhasil keluar dari sistem"
}
```

### Events

#### Get All Events

**Endpoint:** `GET /api/events`

**Description:** Retrieve a list of all events

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `search`: string (optional)
- `sort`: string (comma-separated fields, prefix with - for descending order)
- `select`: string (comma-separated fields to include)

**Response:**
```json
{
  "success": true,
  "count": number,
  "pagination": {
    "next": { "page": number, "limit": number },
    "prev": { "page": number, "limit": number }
  },
  "data": [
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
      "createdAt": "date",
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
  ]
}
```

#### Get Event Detail

**Endpoint:** `GET /api/events/:id`

**Description:** Get details of a specific event

**Response:**
```json
{
  "success": true,
  "data": {
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
    "createdAt": "date",
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
    "bookings": [
      {
        "id": "string",
        "user": "string",
        "totalAmount": number,
        "paymentStatus": "pending" | "completed" | "refunded" | "failed",
        "bookingStatus": "pending" | "confirmed" | "cancelled",
        "bookingDate": "date",
        "createdAt": "date"
      }
    ],
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
}
```

#### Create Event (Event Organizer only)

**Endpoint:** `POST /api/events`

**Description:** Create a new event

**Authentication:** Required (Event Organizer only)

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "date": "string",
  "time": "string",
  "location": "string",
  "capacity": number,
  "image": "string",
  "seatArrangement": {
    "rows": number,
    "columns": number,
    "seats": [
      {
        "id": "string",
        "status": "available",
        "price": number
      }
    ]
  },
  "ticketTypes": [
    {
      "name": "string",
      "price": number,
      "category": "string",
      "description": "string",
      "quantity": number,
      "maxPerOrder": number
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Acara berhasil dibuat",
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "date": "string",
    "time": "string",
    "location": "string",
    "totalSeats": number,
    "availableSeats": number,
    "organizer": "string",
    "published": boolean,
    "approvalStatus": "pending",
    "createdAt": "date"
  }
}
```

### Bookings

#### Get Single Booking

**Endpoint:** `GET /api/bookings/:id`

**Description:** Get details of a specific booking

**Authentication:** Required (User who made booking, Event Organizer, or Admin)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "user": {
      "id": "string",
      "username": "string",
      "fullName": "string",
      "email": "string",
      "phone": "string"
    },
    "event": {
      "id": "string",
      "name": "string",
      "description": "string",
      "location": "string",
      "date": "string",
      "time": "string",
      "organizer": {
        "id": "string",
        "name": "string",
        "email": "string"
      }
    },
    "tickets": [
      {
        "ticket": {
          "id": "string",
          "name": "string",
          "price": number,
          "category": "string",
          "description": "string",
          "formattedPrice": "RM XX.XX"
        },
        "quantity": number,
        "price": number,
        "formattedPrice": "RM XX.XX"
      }
    ],
    "seats": [
      {
        "id": "string",
        "status": "booked",
        "price": number
      }
    ],
    "totalAmount": number,
    "formattedTotalAmount": "RM XX.XX",
    "paymentMethod": "credit_card" | "bank_transfer" | "paypal" | "e-wallet" | "debit_card",
    "paymentStatus": "pending" | "completed" | "refunded" | "failed",
    "bookingStatus": "pending" | "confirmed" | "cancelled",
    "transactionId": "string",
    "bookingDate": "date",
    "createdAt": "date"
  }
}
```

#### Create Booking

**Endpoint:** `POST /api/bookings`

**Description:** Create a new booking for an event

**Authentication:** Required

**Request Body:**
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

**Response:**
```json
{
  "success": true,
  "message": "Pemesanan berhasil dibuat",
  "data": {
    "id": "string",
    "user": "string (user_id)",
    "event": "string (event_id)",
    "tickets": [
      {
        "ticketType": "string (ticket_id)",
        "quantity": number,
        "price": number
      }
    ],
    "seats": [
      {
        "id": "string",
        "status": "booked",
        "price": number
      }
    ],
    "totalAmount": number,
    "paymentMethod": "string",
    "paymentStatus": "pending",
    "bookingStatus": "pending",
    "transactionId": "string",
    "bookingDate": "date",
    "createdAt": "date"
  }
}
```

#### Get User Bookings

**Endpoint:** `GET /api/bookings/user/:userId`

**Description:** Get all bookings for a specific user

**Authentication:** Required (User who made bookings or Admin)

**Response:**
```json
{
  "success": true,
  "count": number,
  "data": [
    {
      "id": "string",
      "event": {
        "id": "string",
        "name": "string",
        "description": "string",
        "location": "string",
        "date": "string",
        "time": "string",
        "image": "string",
        "organizer": {
          "id": "string",
          "name": "string",
          "email": "string"
        }
      },
      "tickets": [
        {
          "ticket": {
            "id": "string",
            "name": "string",
            "price": number,
            "category": "string",
            "description": "string",
            "formattedPrice": "RM XX.XX"
          },
          "quantity": number,
          "price": number,
          "formattedPrice": "RM XX.XX"
        }
      ],
      "seats": [
        {
          "id": "string",
          "row": "string",
          "seatNumber": "string",
          "status": "booked",
          "price": number
        }
      ],
      "totalAmount": number,
      "formattedTotalAmount": "RM XX.XX",
      "paymentMethod": "credit_card" | "bank_transfer" | "paypal" | "e-wallet" | "debit_card",
      "paymentStatus": "pending" | "completed" | "refunded" | "failed",
      "bookingStatus": "pending" | "confirmed" | "cancelled",
      "transactionId": "string",
      "bookingDate": "date",
      "createdAt": "date"
    }
  ]
}
```

#### Get Event Bookings

**Endpoint:** `GET /api/bookings/event/:eventId`

**Description:** Get all bookings for a specific event

**Authentication:** Required (Event Organizer who created the event or Admin)

**Response:**
```json
{
  "success": true,
  "count": number,
  "data": [
    {
      "id": "string",
      "user": {
        "id": "string",
        "name": "string",
        "email": "string",
        "phone": "string"
      },
      "tickets": [
        {
          "ticket": {
            "id": "string",
            "name": "string",
            "price": number,
            "category": "string",
            "description": "string",
            "formattedPrice": "RM XX.XX"
          },
          "quantity": number,
          "price": number,
          "formattedPrice": "RM XX.XX"
        }
      ],
      "seats": [
        {
          "id": "string",
          "row": "string",
          "seatNumber": "string",
          "section": "string",
          "status": "booked",
          "price": number
        }
      ],
      "totalAmount": number,
      "formattedTotalAmount": "RM XX.XX",
      "paymentMethod": "credit_card" | "bank_transfer" | "paypal" | "e-wallet" | "debit_card",
      "paymentStatus": "pending" | "completed" | "refunded" | "failed",
      "bookingStatus": "pending" | "confirmed" | "cancelled",
      "transactionId": "string",
      "bookingDate": "date",
      "createdAt": "date"
    }
  ]
}
```

### Seats

#### Get Seats

**Endpoint:** `GET /api/seats`

**Description:** Get all seats with optional filtering

**Query Parameters:**
- `event`: string (Event ID to filter by)
- `ticketType`: string (Ticket Type ID to filter by)
- `status`: string (Status to filter by: 'available', 'reserved', 'booked')

**Response:**
```json
{
  "success": true,
  "count": number,
  "data": [
    {
      "id": "string",
      "seatNumber": "string",
      "section": "string",
      "row": "string",
      "status": "available" | "reserved" | "booked",
      "price": number,
      "formattedPrice": "RM XX.XX",
      "ticketType": {
        "id": "string",
        "name": "string",
        "category": "string",
        "price": number
      },
      "event": "string",
      "booking": "string",
      "createdAt": "date"
    }
  ]
}
```

#### Get Single Seat

**Endpoint:** `GET /api/seats/:id`

**Description:** Get details of a specific seat

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "seatNumber": "string",
    "section": "string",
    "row": "string",
    "status": "available" | "reserved" | "booked",
    "price": number,
    "formattedPrice": "RM XX.XX",
    "ticketType": {
      "id": "string",
      "name": "string",
      "category": "string",
      "price": number
    },
    "event": {
      "id": "string",
      "title": "string",
      "date": "string",
      "venue": "string"
    },
    "booking": "string",
    "createdAt": "date"
  }
}
```

#### Create Seat

**Endpoint:** `POST /api/seats`

**Description:** Create a new seat

**Authentication:** Required (Admin or Event Organizer)

**Request Body:**
```json
{
  "seatNumber": "string",
  "section": "string",
  "row": "string",
  "status": "available",
  "price": number,
  "ticketType": "string",
  "event": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Kursi berhasil dibuat",
  "data": {
    "id": "string",
    "seatNumber": "string",
    "section": "string",
    "row": "string",
    "status": "available",
    "price": number,
    "ticketType": "string",
    "event": "string",
    "createdAt": "date"
  }
}
```

#### Create Bulk Seats

**Endpoint:** `POST /api/seats/bulk`

**Description:** Create multiple seats at once

**Authentication:** Required (Admin or Event Organizer)

**Request Body:**
```json
{
  "event": "string",
  "ticketType": "string",
  "section": "string",
  "rows": "A-E" | ["A", "B", "C"] | "A",
  "seatsPerRow": number,
  "basePrice": number,
  "seatNumbering": "alpha" | "numeric"
}
```

**Response:**
```json
{
  "success": true,
  "count": number,
  "message": "string",
  "data": {
    "section": "string",
    "rows": ["string"],
    "seatsPerRow": number,
    "totalSeats": number
  }
}
```

#### Update Seat

**Endpoint:** `PUT /api/seats/:id`

**Description:** Update a seat's information

**Authentication:** Required (Admin or Event Organizer)

**Request Body:**
```json
{
  "status": "available" | "reserved" | "booked",
  "price": number
}
```

**Response:**
```json
{
  "success": true,
  "message": "Kursi berhasil diupdate",
  "data": {
    "id": "string",
    "seatNumber": "string",
    "section": "string",
    "row": "string",
    "status": "string",
    "price": number,
    "ticketType": "string",
    "event": "string",
    "booking": "string",
    "createdAt": "date"
  }
}
```

### Error Responses

All API endpoints may return the following error responses:

```json
{
  "statusCode": number,
  "message": "string",
  "error": "string"
}
```

Common status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Data Models

### User
- `id`: String (MongoDB ObjectId)
- `name`: String
- `email`: String (unique)
- `phone`: String
- `password`: String (hashed)
- `role`: String (admin | event_organizer | user)
- `organizationName`: String (untuk event_organizer)
- `createdAt`: Date

### Event
- `id`: String (MongoDB ObjectId)
- `name`: String
- `description`: String
- `date`: String
- `time`: String
- `location`: String
- `image`: String
- `totalSeats`: Number
- `availableSeats`: Number
- `published`: Boolean
- `approvalStatus`: String (pending | approved | rejected)
- `approvalNotes`: String
- `ticketTypes`: Array of ObjectId (ref: Ticket)
- `seatArrangement`: {
  - `rows`: Number
  - `columns`: Number
  - `seats`: Array of {
    - `id`: String
    - `status`: String (available | reserved | selected)
    - `price`: Number
  }
}
- `organizer`: ObjectId (ref: User)
- `promotionalOffers`: Array of {
  - `code`: String
  - `discountType`: String (percentage | fixed)
  - `discountValue`: Number
  - `maxUses`: Number
  - `currentUses`: Number
  - `validFrom`: Date
  - `validUntil`: Date
  - `active`: Boolean
}
- `createdAt`: Date

### Ticket
- `id`: String (MongoDB ObjectId)
- `name`: String
- `description`: String
- `price`: Number
- `category`: String
- `quantity`: Number
- `available`: Number
- `maxPerOrder`: Number
- `event`: ObjectId (ref: Event)
- `saleStartDate`: Date
- `saleEndDate`: Date
- `createdAt`: Date

### Seat
- `id`: String (MongoDB ObjectId)
- `seatNumber`: String
- `section`: String
- `row`: String
- `status`: String (available | reserved | booked)
- `price`: Number
- `ticketType`: ObjectId (ref: Ticket)
- `event`: ObjectId (ref: Event)
- `booking`: ObjectId (ref: Booking, optional)
- `createdAt`: Date

### Booking
- `id`: String (MongoDB ObjectId)
- `user`: ObjectId (ref: User)
- `event`: ObjectId (ref: Event)
- `tickets`: Array of {
  - `ticket`: ObjectId (ref: Ticket)
  - `quantity`: Number
  - `price`: Number
}
- `seats`: Array of ObjectId (ref: Seat)
- `totalAmount`: Number
- `paymentMethod`: String (credit_card | bank_transfer | paypal | e-wallet | debit_card)
- `paymentStatus`: String (pending | completed | refunded | failed)
- `bookingStatus`: String (pending | confirmed | cancelled)
- `transactionId`: String
- `bookingDate`: Date
- `createdAt`: Date

## Data Seeding

Untuk mempopulasi database dengan data testing, aplikasi menyediakan script seeding.

### Menjalankan Seed

```bash
# Menjalankan seed data dengan npm
npm run seed

# Atau menjalankan langsung dengan node
node seeders/seed.js
```

### Hasil Seeding

Proses seeding akan membuat data berikut di database:

1. **Users**:
   - Admin (role: 'admin')
   - Event Organizer (role: 'event_organizer')
   - User biasa (role: 'user')

2. **Events**:
   Enam acara demo dengan detail lengkap seperti tanggal, lokasi, dan kapasitas.

3. **Tickets**:
   Setiap event memiliki tepat 3 tipe tiket:
   - VIP: Tiket premium dengan harga tertinggi
   - Regular: Tiket standar dengan harga menengah
   - Economy: Tiket ekonomis dengan harga terendah
   
   Jumlah kursi untuk setiap tipe tiket adalah angka genap acak antara 100-300.

4. **Seats**:
   Konfigurasi tempat duduk untuk setiap tipe tiket dengan layout optimal berdasarkan jumlah kursi.

5. **Bookings**:
   Contoh pemesanan tiket dengan berbagai status (confirmed, pending, cancelled).

### Kredensial Login

Setelah seeding berhasil, Anda dapat menggunakan kredensial berikut untuk login:

```
Admin: amir@malaysiaevents.com / password123
Event Organizer: nurul@malayorganizer.com / password123 
User: razak@example.com.my / password123
```

> **Perhatian**: Menjalankan seed akan menghapus semua data yang ada di database terlebih dahulu.