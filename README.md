# HELPVerse - Event Management System

## Routes and Pages

### Public Routes
- `/` - Homepage (accessible to all users)
- `/login` - Login page
- `/register/event-organizer` - Event Organizer registration page
- `/event/:id` - Event detail page
- `/event/:id/book` - Event booking page

### Protected Routes (Event Organizer)
- `/event/create` - Create new event page
  - Multi-step form for event creation
  - Includes event details, ticket types, and seat arrangement

### User Roles
The application supports three types of users:
1. Admin
2. Event Organizer
3. Regular User

### Features
- Event creation and management
- Ticket booking system
- Seat arrangement
- User authentication
- Role-based access control

## API Documentation

### Authentication
#### Login
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string",
    "rememberMe": boolean
  }
  ```
- **Response**:
  ```json
  {
    "token": "string",
    "user": {
      "id": "string",
      "username": "string",
      "role": "admin" | "eventOrganizer" | "user"
    }
  }
  ```

#### Register Event Organizer
- **Endpoint**: `POST /api/auth/register/event-organizer`
- **Request Body**:
  ```json
  {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "organizationName": "string",
    "password": "string",
    "agreeTerms": boolean
  }
  ```

### Events
#### Get All Events
- **Endpoint**: `GET /api/events`
- **Query Parameters**:
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
  - `search`: string (optional)
- **Response**:
  ```json
  {
    "events": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "date": "string",
        "time": "string",
        "location": "string",
        "capacity": number,
        "image": "string",
        "ticketTypes": [
          {
            "id": "string",
            "name": "string",
            "price": string,
            "limit": string,
            "rows": number,
            "columns": number
          }
        ]
      }
    ],
    "total": number,
    "page": number,
    "limit": number
  }
  ```

#### Get Event Detail
- **Endpoint**: `GET /api/events/:id`
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "date": "string",
    "time": "string",
    "location": "string",
    "capacity": number,
    "image": "string",
    "ticketTypes": [
      {
        "id": "string",
        "name": "string",
        "price": string,
        "limit": string,
        "rows": number,
        "columns": number
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
    }
  }
  ```

#### Create Event (Event Organizer only)
- **Endpoint**: `POST /api/events`
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "date": "string",
    "time": "string",
    "location": "string",
    "capacity": number,
    "image": "string",
    "ticketTypes": [
      {
        "name": "string",
        "price": string,
        "limit": string,
        "rows": number,
        "columns": number
      }
    ]
  }
  ```

### Bookings
#### Create Booking
- **Endpoint**: `POST /api/events/:id/bookings`
- **Request Body**:
  ```json
  {
    "ticketTypeId": "string",
    "seats": ["string"],
    "quantity": number
  }
  ```
- **Response**:
  ```json
  {
    "bookingId": "string",
    "eventId": "string",
    "ticketTypeId": "string",
    "seats": ["string"],
    "quantity": number,
    "totalAmount": number
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
- 500: Internal Server Error# fe-helpverse
