# Testing Next.js API Routes

## 1. Start the Development Server

```bash
cd "/Users/macbookpro/Documents/coding projects/CodeKingdom/CodeKingdom/nextjs-app"
npm run dev
```

The server will start at `http://localhost:3000`

## 2. Test Routes

### Option A: Using curl (Terminal)

#### Test User Registration
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123",
    "age": 10
  }'
```

This will return a JWT token. Save it for other requests.

#### Test User Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

#### Test Get Profile (replace TOKEN with actual token)
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Test Story Game Progress
```bash
curl -X GET http://localhost:3000/api/story-game/progress \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Test Execute Code
```bash
curl -X POST http://localhost:3000/api/story-game/execute \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "move_to(\"forest_clearing\")"
  }'
```

### Option B: Using Browser (for GET requests only)

1. First, register/login to get a token
2. Open browser console (F12)
3. Run this JavaScript:
```javascript
fetch('http://localhost:3000/api/story-game/progress', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

### Option C: Using Postman or Insomnia

1. Create a new request
2. Set method (GET/POST)
3. Set URL: `http://localhost:3000/api/users/register` (or other endpoint)
4. For POST: Add JSON body
5. For protected routes: Add header `Authorization: Bearer YOUR_TOKEN`

## 3. Available Endpoints

### Public Routes (No Auth Required)
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user

### Protected Routes (Require JWT Token)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/story-game/progress` - Get story game progress
- `POST /api/story-game/execute` - Execute Python code
- `POST /api/story-game/hint` - Purchase hint
- `POST /api/story-game/reset` - Reset story progress

## 4. Quick Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

# Register a user
echo "Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123",
    "age": 10
  }')

echo "Register response: $REGISTER_RESPONSE"

# Extract token (requires jq: brew install jq)
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')
echo "Token: $TOKEN"

# Test story game progress
echo "\nTesting story game progress..."
curl -X GET http://localhost:3000/api/story-game/progress \
  -H "Authorization: Bearer $TOKEN"
```

Make it executable: `chmod +x test-api.sh`
Run it: `./test-api.sh`

## 5. Common Issues

- **401 Unauthorized**: Make sure you're including the `Authorization: Bearer TOKEN` header
- **500 Server Error**: Check that MongoDB is running and `.env.local` has correct `MONGODB_URI`
- **Connection refused**: Make sure `npm run dev` is running
