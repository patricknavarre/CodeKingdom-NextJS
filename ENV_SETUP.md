# Environment Variables Setup

## Backend (.env file)

Create a `.env` file in the `backend/` directory with:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## Next.js App (.env.local file)

Create a `.env.local` file in the `nextjs-app/` directory with:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NEXT_PUBLIC_API_URL=/api
```

## Notes

- Use the **same** `MONGODB_URI` and `JWT_SECRET` values in both files
- `.env.local` is automatically ignored by git (already in .gitignore)
- For the backend, you can use either `.env` or `.env.local` (dotenv loads both)
- If you're using MongoDB Atlas, your connection string will look like:
  `mongodb+srv://username:password@cluster.mongodb.net/codekingdom`

## Quick Setup

1. Copy the example file:
   ```bash
   # For backend
   cp backend/.env.example backend/.env
   
   # For Next.js app
   cp nextjs-app/.env.example nextjs-app/.env.local
   ```

2. Edit the files and add your actual values

3. Make sure your MongoDB is running (or use MongoDB Atlas)
