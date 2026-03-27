# Authentication API - Testing Guide

## Overview
Complete JWT-based authentication system with access tokens and refresh tokens (with token rotation).

## Endpoints Implemented

### 1. **POST /auth/signup** - User Registration
Register a new user account.

**Request:**
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "password123"
  }' \
  -c cookies.txt
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "testuser"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Also sets HTTP-only cookie:**
- `refreshToken` - 7 days expiration, secure, httpOnly, sameSite=strict

**Validation Rules:**
- Email: Must be valid email format
- Username: 3-30 characters, alphanumeric + underscore only
- Password: Minimum 6 characters

**Error Responses:**
- `400` - Validation failed, email/username already exists
- `500` - Internal server error

---

### 2. **POST /auth/signin** - User Login
Login with existing credentials.

**Request:**
```bash
curl -X POST http://localhost:3001/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "testuser"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Also sets HTTP-only cookie:**
- `refreshToken` - New refresh token (rotates on each login)

**Error Responses:**
- `400` - Validation failed
- `401` - Invalid credentials (generic message for security)
- `500` - Internal server error

---

### 3. **POST /auth/refresh** - Refresh Access Token
Get a new access token using the refresh token cookie.

**Request:**
```bash
curl -X POST http://localhost:3001/auth/refresh \
  -b cookies.txt \
  -c cookies.txt
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Also sets HTTP-only cookie:**
- `refreshToken` - New refresh token (token rotation implemented)

**Error Responses:**
- `401` - Refresh token not found, invalid, or expired
- `500` - Internal server error

**Note:** This endpoint implements **token rotation** - each refresh generates a new refresh token, invalidating the old one. This is a security best practice.

---

### 4. **POST /auth/logout** - User Logout
Clear refresh token and logout user.

**Request:**
```bash
curl -X POST http://localhost:3001/auth/logout \
  -b cookies.txt
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Actions:**
- Clears `refreshToken` from database
- Clears `refreshToken` HTTP-only cookie

**Error Responses:**
- `500` - Internal server error

---

## Using Protected Routes

### Authentication Middleware
To protect a route, use the `authenticate` middleware:

```typescript
import { authenticate } from "./middleware/auth.js";

// Example protected route
app.get("/protected", authenticate, (req, res) => {
  // req.userId is available here
  res.json({ message: "Protected data", userId: req.userId });
});
```

### Making Authenticated Requests
Include the access token in the Authorization header:

```bash
# Store access token from signup/signin response
ACCESS_TOKEN="your_access_token_here"

curl -X GET http://localhost:3001/protected \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## Complete Authentication Flow Example

### 1. Sign Up
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "johndoe",
    "password": "mypassword"
  }' \
  -c cookies.txt

# Save the accessToken from response
```

### 2. Make Authenticated Requests
```bash
# Use the access token from step 1
curl -X GET http://localhost:3001/protected \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 3. When Access Token Expires (after 15 minutes)
```bash
# Refresh to get new access token
curl -X POST http://localhost:3001/auth/refresh \
  -b cookies.txt \
  -c cookies.txt

# Use the new accessToken for subsequent requests
```

### 4. Sign Out
```bash
curl -X POST http://localhost:3001/auth/logout \
  -b cookies.txt
```

---

## Token Configuration

### Access Token
- **Lifetime:** 15 minutes
- **Storage:** Client-side (returned in response body)
- **Usage:** Include in Authorization header for API requests
- **Format:** `Authorization: Bearer <token>`

### Refresh Token
- **Lifetime:** 7 days
- **Storage:** HTTP-only cookie (protected from XSS)
- **Usage:** Automatically sent with /auth/refresh requests
- **Rotation:** Yes - new token issued on each refresh
- **Security:** Hashed before storing in database

---

## Security Features

✅ **Password Hashing** - bcrypt with 10 salt rounds  
✅ **JWT Tokens** - Separate secrets for access & refresh tokens  
✅ **Token Rotation** - Refresh tokens rotate on each use  
✅ **HTTP-Only Cookies** - Refresh token protected from XSS  
✅ **Generic Error Messages** - "Invalid credentials" for all auth failures  
✅ **Token Expiration** - Short-lived access tokens (15 min)  
✅ **Database Token Storage** - Refresh tokens hashed in database  
✅ **Input Validation** - Zod schema validation on all inputs

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  refresh_token TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## Environment Variables

Required in `.env`:
```env
# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crypto-wise

# Server
PORT=3001
```

**⚠️ IMPORTANT:** Change the JWT secrets in production to strong, random values!

---

## Testing with curl

### Complete Test Script
```bash
#!/bin/bash

# 1. Signup
echo "1. Testing Signup..."
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }' \
  -c cookies.txt)

echo "$SIGNUP_RESPONSE" | jq '.'
ACCESS_TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.accessToken')
echo "Access Token: $ACCESS_TOKEN"

# 2. Test protected route
echo -e "\n2. Testing Protected Route..."
curl -s -X GET http://localhost:3001/protected \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'

# 3. Refresh token
echo -e "\n3. Testing Token Refresh..."
REFRESH_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/refresh \
  -b cookies.txt \
  -c cookies.txt)

echo "$REFRESH_RESPONSE" | jq '.'
NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.accessToken')

# 4. Logout
echo -e "\n4. Testing Logout..."
curl -s -X POST http://localhost:3001/auth/logout \
  -b cookies.txt | jq '.'

# 5. Try to refresh after logout (should fail)
echo -e "\n5. Testing Refresh After Logout (should fail)..."
curl -s -X POST http://localhost:3001/auth/refresh \
  -b cookies.txt | jq '.'

# 6. Signin
echo -e "\n6. Testing Signin..."
curl -s -X POST http://localhost:3001/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' \
  -b cookies.txt \
  -c cookies.txt | jq '.'

echo -e "\nAll tests completed!"
```

Save as `test-auth.sh`, make executable with `chmod +x test-auth.sh`, and run `./test-auth.sh`.

---

## Common Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "too_small",
      "minimum": 6,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "Password must be at least 6 characters",
      "path": ["password"]
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

```json
{
  "error": "Authorization token required"
}
```

```json
{
  "error": "Invalid or expired token"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Files Created

```
src/
├── controllers/
│   └── authController.ts       # Signup, signin, refresh, logout logic
├── middleware/
│   └── auth.ts                 # JWT authentication middleware
├── routes/
│   └── authRoutes.ts          # Auth endpoint routes
├── utils/
│   ├── jwt.ts                 # JWT token generation & verification
│   └── password.ts            # Password hashing & comparison
├── validators/
│   └── authValidators.ts      # Zod validation schemas
└── index.ts                   # Updated with auth routes

.env                           # Updated with JWT configuration
```

---

## Next Steps

1. **Test the endpoints** using the curl commands above
2. **Protect existing routes** by adding the `authenticate` middleware
3. **Production hardening:**
   - Set `secure: true` for cookies when using HTTPS
   - Change JWT secrets to strong random values
   - Add rate limiting to prevent brute force attacks
   - Consider adding email verification
   - Add password reset functionality
4. **Frontend integration:**
   - Store access token in memory or localStorage
   - Implement automatic token refresh before expiry
   - Handle 401 errors by redirecting to login
