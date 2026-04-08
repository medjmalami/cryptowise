# API Integration Guide

## Overview

The frontend is now fully integrated with the backend authentication and chat endpoints. This document describes the integration architecture and how to use it.

## Architecture

### API Client Layer (`frontend/lib/api/`)

**client.ts** - Core fetch wrapper with:
- Automatic token injection in Authorization headers
- Token refresh on 401 errors
- Credential support for refresh token cookies
- Error handling with custom HttpError class

**types.ts** - TypeScript definitions for all API requests/responses

**auth.service.ts** - Authentication endpoints:
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout

**chat.service.ts** - Chat endpoints:
- `POST /chat` - Send message to AI

### Authentication Flow

1. **Login/Signup**: User provides credentials → API returns `accessToken` + sets `refreshToken` cookie
2. **Token Storage**: Access token stored in memory (React state) for XSS protection
3. **API Requests**: Access token automatically added to `Authorization: Bearer <token>` header
4. **App Initialization**: On load, calls `/auth/refresh` to restore session from refresh cookie
5. **Token Expiry**: On 401 error, automatically attempts refresh before failing
6. **Logout**: Calls `/auth/logout` to clear refresh cookie + clears local state

### Chat Flow

1. User sends message through UI
2. Frontend calls `POST /chat` with message (no authentication required)
3. Backend forwards to LLM (Ollama/Qwen) and returns response
4. Frontend displays AI response
5. Conversations stored locally in localStorage

## Environment Setup

### Backend

1. Navigate to `backend/nodeGateway`
2. Create `.env` file (if not exists):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/cryptowise
JWT_ACCESS_SECRET=your-secret-key-minimum-32-characters
JWT_REFRESH_SECRET=your-secret-key-minimum-32-characters
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
LLM_API_URL=http://localhost:11434/v1
LLM_MODEL=qwen2.5:3b
```
3. Start backend: `bun dev`

### Frontend

1. Navigate to `frontend`
2. Environment file `.env.local` already created:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```
3. Start frontend: `npm run dev`

## Running the Application

### Start Backend (Terminal 1)
```bash
cd backend/nodeGateway
bun dev
```

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

### Access Application
Open browser to: `http://localhost:3000`

## Testing the Integration

### 1. Sign Up Flow
1. Navigate to `/signup`
2. Enter name, email, password
3. Submit form
4. Should redirect to `/chat` on success
5. Check browser dev tools → Network tab → Should see POST to `/auth/signup`
6. Response should include `accessToken` and user data

### 2. Login Flow
1. Navigate to `/login`
2. Enter email and password
3. Submit form
4. Should redirect to `/chat` on success
5. Check Network tab → POST to `/auth/signin`

### 3. Token Refresh
1. After login, refresh the page
2. Check Network tab → POST to `/auth/refresh` should be called
3. App should restore session without requiring login

### 4. Chat Flow
1. In `/chat`, send a message
2. Check Network tab → POST to `/chat`
3. Should see AI response appear in conversation

### 5. Logout Flow
1. Click logout in settings/menu
2. Check Network tab → POST to `/auth/logout`
3. Should redirect to login page

## Error Handling

All API errors are caught and displayed via toast notifications:

- **401 Unauthorized**: Invalid credentials or expired token
- **400 Bad Request**: Validation errors (weak password, invalid email, etc.)
- **500 Server Error**: Backend issues

Errors are extracted from the API response and shown to users with helpful messages.

## API Endpoints Reference

### Authentication

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/signup` | No | Register new user |
| POST | `/auth/signin` | No | Login user |
| POST | `/auth/refresh` | Cookie | Refresh access token |
| POST | `/auth/logout` | Cookie | Logout user |

### Chat

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/chat` | No | Send message to AI |

## Security Features

- **Access tokens in memory**: Protected from XSS attacks
- **HTTP-only refresh cookies**: Protected from JavaScript access
- **Token rotation**: New refresh token on each refresh
- **Automatic token refresh**: Seamless UX on token expiry
- **CORS with credentials**: Secure cross-origin requests

## Known Limitations

1. **Conversations not synced**: Currently stored in localStorage only
2. **No profile update API**: Profile changes are local-only
3. **No account deletion API**: Deletion only clears local state
4. **Chat not authenticated**: Anyone can send messages without login
5. **No conversation history API**: Backend has schema but no endpoints yet

## Future Improvements

- [ ] Implement conversation management endpoints (CRUD)
- [ ] Add authentication to chat endpoint
- [ ] Sync conversations to backend database
- [ ] Implement profile update endpoint
- [ ] Add account deletion endpoint
- [ ] Add message history pagination
- [ ] Implement streaming responses for chat
- [ ] Add WebSocket support for real-time updates

## Troubleshooting

### "Failed to fetch" errors
- Ensure backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS is configured on backend

### Token refresh fails
- Check refresh token cookie exists (dev tools → Application → Cookies)
- Verify `JWT_REFRESH_SECRET` matches between backend restarts
- Cookie must have `httpOnly: true` and correct domain

### Chat responses not working
- Ensure Ollama is running: `ollama serve`
- Verify model is installed: `ollama pull qwen2.5:3b`
- Check `LLM_API_URL` in backend `.env`

### Build errors
- Run `npm install` in frontend directory
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run build`
