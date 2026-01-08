# Auth Service - Uchenab University LMS

Authentication service for Library Management System with 10 pre-registered Uchenab University students.

## Pre-registered Users

All users have the default password: `password123`

| ID | Username  | Email                      | Full Name        |
|----|-----------|----------------------------|------------------|
| 1  | amina     | amina@uchenab.edu.pk       | Amina Khan       |
| 2  | ayesha    | ayesha@uchenab.edu.pk      | Ayesha Ahmed     |
| 3  | zoha      | zoha@uchenab.edu.pk        | Zoha Malik       |
| 4  | zubria    | zubria@uchenab.edu.pk      | Zubria Aslam     |
| 5  | abdullah  | abdullah@uchenab.edu.pk    | Abdullah Hassan  |
| 6  | nasir     | nasir@uchenab.edu.pk       | Nasir Ali        |
| 7  | asad      | asad@uchenab.edu.pk        | Asad Mahmood     |
| 8  | ijaz      | ijaz@uchenab.edu.pk        | Ijaz Hussain     |
| 9  | fatima    | fatima@uchenab.edu.pk      | Fatima Zahra     |
| 10 | hassan    | hassan@uchenab.edu.pk      | Hassan Raza      |

## API Endpoints

### POST /auth/login
Login with username/email and password

**Request:**
```json
{
  "username": "amina",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "username": "amina",
      "email": "amina@uchenab.edu.pk",
      "fullName": "Amina Khan",
      "role": "student"
    }
  }
}
```

### GET /auth/validate
Validate JWT token

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "id": 1,
      "username": "amina",
      "email": "amina@uchenab.edu.pk",
      "fullName": "Amina Khan",
      "role": "student"
    }
  }
}
```

## Installation

```bash
cd auth-service
npm install
```

## Running the Service

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The service will run on port 3001.

## Features

- ✅ 10 pre-registered Uchenab University students
- ✅ Only registered users can login
- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ Token validation endpoint
- ✅ 24-hour token expiration
- ✅ User list endpoint

## Security Note

⚠️ In production:
- Move JWT_SECRET to environment variables
- Use strong, unique passwords
- Implement rate limiting
- Add HTTPS
- Store passwords securely
