# Library Management System - Pub/Sub Architecture

## Project Overview

A microservices-based Library Management System with event-driven communication using Redis Pub/Sub. The system handles book cataloging, borrowing, user management, and real-time notifications through independent, scalable services.

---

## System Architecture

- **Frontend**: React-based user interface
- **Backend Services**: 4 independent microservices (Auth, Book, Borrow, Notification)
- **Database**: MongoDB (separate database per service)
- **Message Queue**: Redis Pub/Sub for event-driven communication
- **Real-time**: Server-Sent Events (SSE) for live notifications

---

## Tech Stack

**Frontend:** React, Vite, React Router, Tailwind CSS, Shadcn UI, React Query, Zod

**Backend:** Node.js, Express.js, MongoDB, Mongoose, Redis, JWT, Nodemailer

**Additional:** Server-Sent Events (SSE)

---

## Software Requirements

- **Node.js**: v18.0.0 or higher
- **MongoDB**: v6.0 or higher
- **Redis**: v7.0 or higher
- **npm**: v9.0 or higher (comes with Node.js)
- **Git**: For cloning the repository

### Optional
- **Docker**: For containerized deployment
- **Postman/Thunder Client**: For API testing

---

## Hardware Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 5 GB free space
- **Network**: Internet connection for dependencies

### Recommended Requirements
- **CPU**: 4 cores or higher
- **RAM**: 8 GB or higher
- **Storage**: 10 GB free space (for databases and logs)
- **Network**: Stable internet connection

---

## Environment Variables

### Auth Service (Port 3000)
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/auth_db
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
```

### Book Service (Port 3001)
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/book_db
REDIS_URL=redis://localhost:6379
```

### Borrow Service (Port 3002)
```
PORT=3002
MONGODB_URI=mongodb://localhost:27017/borrow_db
BOOK_SERVICE_URL=http://localhost:3001
AUTH_SERVICE_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
```

### Notification Service (Port 3004)
```
PORT=3004
MONGODB_URI=mongodb://localhost:27017/notification_db
REDIS_HOST=localhost
REDIS_PORT=6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Frontend
```
VITE_AUTH_URL=http://localhost:3000
VITE_BOOKS_URL=http://localhost:3001
VITE_BORROW_URL=http://localhost:3002
VITE_NOTIFICATION_URL=http://localhost:3004
```

---

## Database Setup

**MongoDB Databases:**
- `auth_db` - User authentication and student data
- `book_db` - Book catalog and categories
- `borrow_db` - Borrowing records
- `notification_db` - Notifications and subscriptions

**Collections:**
- Auth: `users`
- Book: `books`, `categories`
- Borrow: `borrows`
- Notification: `notifications`, `categorysubscriptions`, `booksubscriptions`

---

## Ports & Services

| Service | Port | Base URL | Description |
|---------|------|----------|-------------|
| Auth Service | 3000 | `http://localhost:3000` | User authentication |
| Book Service | 3001 | `http://localhost:3001` | Book catalog |
| Borrow Service | 3002 | `http://localhost:3002` | Book borrowing |
| Notification Service | 3004 | `http://localhost:3004` | Notifications |
| Frontend | 5173 | `http://localhost:5173` | React app |
| Redis | 6379 | `redis://localhost:6379` | Message queue |

---

## API Endpoints

### 🔐 Auth Service (Port 3000)

**Base URL:** `http://localhost:3000/auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/login` | User login | No |
| POST | `/register` | Register student | Admin |
| GET | `/students` | Get all students | Admin |
| DELETE | `/students/:id` | Delete student | Admin |

### 📚 Book Service (Port 3001)

**Base URL:** `http://localhost:3001/api`

**Book Endpoints:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/books` | Get all books (with filters) | No |
| GET | `/books/:id` | Get book by ID | No |
| POST | `/books` | Add new book | Admin |
| PUT | `/books/:id` | Update book | Admin |
| DELETE | `/books/:id` | Delete book | Admin |
| PATCH | `/books/:id/decrease` | Decrease copies | Internal |
| PATCH | `/books/:id/increase` | Increase copies | Internal |

**Query Parameters:** `status`, `category`, `author`, `search`

**Category Endpoints:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/categories` | Get all categories | No |
| GET | `/categories/:id` | Get category by ID | No |
| POST | `/categories` | Create category | Admin |
| PUT | `/categories/:id` | Update category | Admin |
| DELETE | `/categories/:id` | Delete category | Admin |
| POST | `/categories/sync` | Sync categories | Admin |

**SSE Endpoint:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications/stream` | Real-time notifications stream |

### 📖 Borrow Service (Port 3002)

**Base URL:** `http://localhost:3002/api`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/borrows` | Borrow a book | Yes |
| PATCH | `/borrows/:borrowId/return` | Return a book | Yes |
| GET | `/borrows` | Get all borrows | Admin |
| GET | `/borrows/:borrowId` | Get borrow by ID | Yes |
| GET | `/borrows/user/:email` | Get user history | Yes |

### 🔔 Notification Service (Port 3004)

**Base URL:** `http://localhost:3004/api`

**Subscription Endpoints:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/subscriptions/category/subscribe` | Subscribe to category | Yes |
| POST | `/subscriptions/category/unsubscribe` | Unsubscribe from category | Yes |
| POST | `/subscriptions/book/subscribe` | Subscribe to book | Yes |
| POST | `/subscriptions/book/unsubscribe` | Unsubscribe from book | Yes |
| GET | `/subscriptions/user/:userId` | Get user subscriptions | Yes |
| GET | `/subscriptions/category/:categoryId/check/:userId` | Check category subscription | Yes |
| GET | `/subscriptions/book/:bookId/check/:userId` | Check book subscription | Yes |
| GET | `/subscriptions/category/:categoryId/subscribers` | Get category subscribers | Admin |
| GET | `/subscriptions/book/:bookId/subscribers` | Get book subscribers | Admin |

**Notification Endpoints:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/user-notifications/user/:userId` | Get user notifications | Yes |
| GET | `/user-notifications/user/:userId/unread-count` | Get unread count | Yes |
| PUT | `/user-notifications/:notificationId/read` | Mark as read | Yes |
| PUT | `/user-notifications/mark-all-read` | Mark all as read | Yes |
| DELETE | `/user-notifications/:notificationId` | Delete notification | Yes |
| DELETE | `/user-notifications/delete-all` | Delete all notifications | Yes |

**Monitoring Endpoints:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notifications/status` | Get service status | No |
| GET | `/notifications/events` | Get all events | No |
| GET | `/notifications/events/:type` | Get events by type | No |

**Health Check:** All services have `/health` endpoint

---

## Redis Pub/Sub Channels

| Channel | Publisher | Subscriber | Description |
|---------|-----------|------------|-------------|
| `BookBorrowed` | Borrow Service | Notification, Book Service | Book borrowed event |
| `BookReturned` | Borrow Service | Notification, Book Service | Book returned event |
| `UserDeleted` | Auth Service | Notification Service | User deleted event |
| `BookAdded` | Book Service | Notification Service | New book added |
| `BookUpdated` | Book Service | Notification Service | Book updated |

---

## How to Run the Project

### Prerequisites Setup

1. **Install Node.js** (v18+)
2. **Install MongoDB** and start service
3. **Install Redis** and start service

### Installation

```bash
# Clone repository
git clone <repository-url>
cd pub-sub

# Install backend dependencies
cd backend
npm run install:all

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

Create `.env` files in each service directory with environment variables listed above.

### Running Services

**Start each service in separate terminal:**

```bash
# Terminal 1 - Auth Service
cd backend/auth-service && npm start

# Terminal 2 - Book Service
cd backend/book-service && npm start

# Terminal 3 - Borrow Service
cd backend/borrow-service && npm start

# Terminal 4 - Notification Service
cd backend/notification-service && npm start

# Terminal 5 - Frontend
cd frontend && npm run dev
```

### Verify Services

Check health endpoints:
- `http://localhost:3000/health` - Auth Service
- `http://localhost:3001/health` - Book Service
- `http://localhost:3002/health` - Borrow Service
- `http://localhost:3004/health` - Notification Service

---

## Key Features

- Microservices Architecture
- Event-Driven Communication (Redis Pub/Sub)
- Real-time Notifications (SSE)
- Category Subscriptions
- Email Notifications
- Role-Based Access Control
- RESTful APIs
- Database Per Service Pattern

---

## Project Structure

```
pub-sub/
├── backend/
│   ├── auth-service/
│   ├── book-service/
│   ├── borrow-service/
│   └── notification-service/
├── frontend/
│   ├── src/
│   │   ├── modules/
│   │   ├── shared/
│   │   └── app/
│   └── public/
└── README.md
```

---

## License

This project is for educational purposes.
