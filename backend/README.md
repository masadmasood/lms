# Library Management System - Microservices Architecture

A learning-oriented backend implementation demonstrating true microservices architecture with Node.js and Express.js.

## 🏗️ Architecture Overview

This system consists of **four independent microservices**, each with its own Express app, runtime, and data store:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LIBRARY MANAGEMENT SYSTEM                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌──────────────┐                                                         │
│    │   Frontend   │                                                         │
│    │   (Client)   │                                                         │
│    └──────┬───────┘                                                         │
│           │                                                                  │
│           │ REST API (Only entry point)                                     │
│           ▼                                                                  │
│    ┌──────────────────────────────────────────────────────────────┐        │
│    │                    BORROW SERVICE                             │        │
│    │                  (Port 3003 - Orchestrator)                   │        │
│    │  • Issue books    • Return books    • Borrow records         │        │
│    └──────────┬───────────────────┬───────────────┬───────────────┘        │
│               │                   │               │                         │
│               │ REST              │ REST          │ Redis Pub/Sub           │
│               │ (sync)            │ (sync)        │ (async)                 │
│               ▼                   ▼               ▼                         │
│    ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐          │
│    │  BOOK SERVICE  │  │ MEMBER SERVICE │  │NOTIFICATION SERVICE│          │
│    │  (Port 3001)   │  │  (Port 3002)   │  │    (Port 3004)     │          │
│    │                │  │                │  │                    │          │
│    │ • List books   │  │ • List members │  │ • Subscribe events │          │
│    │ • Availability │  │ • Validate     │  │ • Log/Notify       │          │
│    └────────────────┘  └────────────────┘  └────────────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
server/
├── book-service/               # Book management microservice
│   ├── app.js                  # Express app entry point
│   ├── package.json            # Service dependencies
│   ├── .env                    # Environment configuration
│   ├── controllers/            # Request handlers
│   ├── routes/                 # API route definitions
│   ├── middleware/             # Error handling
│   └── data/                   # In-memory data store
│
├── member-service/             # Member management microservice
│   ├── app.js
│   ├── package.json
│   ├── .env
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── data/
│
├── borrow-service/             # Core orchestration microservice
│   ├── app.js
│   ├── package.json
│   ├── .env
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/               # External service clients
│   │   ├── bookServiceClient.js
│   │   ├── memberServiceClient.js
│   │   └── eventPublisher.js   # Redis Pub/Sub publisher
│   └── data/
│
├── notification-service/       # Event-driven notification service
│   ├── app.js
│   ├── package.json
│   ├── .env
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── services/
│       ├── eventSubscriber.js  # Redis Pub/Sub subscriber
│       └── eventHandlers.js    # Event processing logic
│
├── package.json                # Root package with convenience scripts
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (for native fetch API support)
- **Redis** (for Pub/Sub communication)

### Installing Redis

**Windows (using Chocolatey):**
```bash
choco install redis-64
```

**Windows (using Docker):**
```bash
docker run --name redis -p 6379:6379 -d redis
```

**macOS (using Homebrew):**
```bash
brew install redis
brew services start redis
```

### Installation

1. **Clone and navigate to the server directory:**
```bash
cd server
```

2. **Install dependencies for all services:**
```bash
npm run install:all
```

Or install individually:
```bash
npm run install:book
npm run install:member
npm run install:borrow
npm run install:notification
```

### Starting the Services

**Important:** Each service must be started in a **separate terminal**.

**Terminal 1 - Start Redis (if not already running):**
```bash
redis-server
```

**Terminal 2 - Book Service:**
```bash
npm run start:book
# Or: cd book-service && npm start
```

**Terminal 3 - Member Service:**
```bash
npm run start:member
# Or: cd member-service && npm start
```

**Terminal 4 - Borrow Service:**
```bash
npm run start:borrow
# Or: cd borrow-service && npm start
```

**Terminal 5 - Notification Service:**
```bash
npm run start:notification
# Or: cd notification-service && npm start
```

## 📡 API Reference

### Book Service (Port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | List all books |
| GET | `/api/books/:id` | Get book by ID |
| PATCH | `/api/books/:id/decrease` | Decrease available copies |
| PATCH | `/api/books/:id/increase` | Increase available copies |
| GET | `/health` | Health check |

### Member Service (Port 3002)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members` | List all members |
| GET | `/api/members/:id` | Get member by ID |
| GET | `/api/members/:id/validate` | Validate member for borrowing |
| GET | `/health` | Health check |

### Borrow Service (Port 3003) - **Frontend Entry Point**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/borrows` | Issue a book to a member |
| PATCH | `/api/borrows/:borrowId/return` | Return a borrowed book |
| GET | `/api/borrows` | List all borrow records |
| GET | `/api/borrows/:id` | Get borrow record by ID |
| GET | `/api/borrows/member/:memberId` | Get member's borrow history |
| GET | `/health` | Health check |

### Notification Service (Port 3004)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/status` | Get service status |
| GET | `/api/notifications/events` | Get all processed events |
| GET | `/api/notifications/events/:type` | Get events by type |
| GET | `/health` | Health check |

## 🧪 Testing the System

### 1. Check all services are healthy

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
```

### 2. List available books

```bash
curl http://localhost:3001/api/books
```

### 3. List library members

```bash
curl http://localhost:3002/api/members
```

### 4. Issue a book (via Borrow Service)

```bash
curl -X POST http://localhost:3003/api/borrows \
  -H "Content-Type: application/json" \
  -d '{"memberId": "member-001", "bookId": "book-001"}'
```

### 5. View borrow records

```bash
curl http://localhost:3003/api/borrows
```

### 6. Return a book

```bash
curl -X PATCH http://localhost:3003/api/borrows/{borrowId}/return
```

### 7. Check notification events

```bash
curl http://localhost:3004/api/notifications/events
```

## 🎯 Key Microservices Concepts Demonstrated

### 1. **Service Independence**
- Each service has its own `package.json`, dependencies, and runtime
- Services can be deployed, scaled, and updated independently
- No shared code between services

### 2. **Data Ownership**
- Book Service owns all book data
- Member Service owns all member data
- Borrow Service owns all borrow records
- No shared database

### 3. **Synchronous Communication (REST)**
- Borrow Service calls Book Service to check/update availability
- Borrow Service calls Member Service to validate members
- Clear request-response pattern

### 4. **Asynchronous Communication (Pub/Sub)**
- Borrow Service publishes events (BOOK_ISSUED, BOOK_RETURNED)
- Notification Service subscribes and reacts to events
- Publisher doesn't know or care about subscribers
- Fire-and-forget pattern

### 5. **Loose Coupling**
- Services communicate only through APIs and events
- No direct data access between services
- Services can fail independently

### 6. **Domain-Driven Design**
- Each service represents a bounded context
- Clear responsibility boundaries
- Single source of truth for each domain

## 🔮 Extensibility

This architecture makes it easy to add:

- **Analytics Service** - Subscribe to events for reporting
- **Fine Service** - Calculate and manage late fees
- **Email Service** - Send actual email notifications
- **Search Service** - Full-text search across books
- **Recommendation Service** - ML-based book recommendations
- **Database Persistence** - Replace in-memory with MongoDB, PostgreSQL, etc.

## 📊 Sample Data

### Books (book-service)
- book-001: Clean Code
- book-002: The Pragmatic Programmer
- book-003: Design Patterns
- book-004: Refactoring
- book-005: Domain-Driven Design

### Members (member-service)
- member-001: Alice Johnson (Premium)
- member-002: Bob Smith (Standard)
- member-003: Charlie Brown (Student)
- member-004: Diana Prince (Premium)
- member-005: Edward Norton (Standard - Inactive)

### Borrowing Limits
- Standard: 3 books
- Student: 5 books
- Premium: 10 books

## 🛠️ Environment Variables

Each service has its own `.env` file:

**Book Service:**
```
PORT=3001
SERVICE_NAME=book-service
```

**Member Service:**
```
PORT=3002
SERVICE_NAME=member-service
```

**Borrow Service:**
```
PORT=3003
SERVICE_NAME=borrow-service
BOOK_SERVICE_URL=http://localhost:3001
MEMBER_SERVICE_URL=http://localhost:3002
REDIS_HOST=localhost
REDIS_PORT=6379
MAX_BORROW_DAYS=14
```

**Notification Service:**
```
PORT=3004
SERVICE_NAME=notification-service
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 📝 License

MIT
