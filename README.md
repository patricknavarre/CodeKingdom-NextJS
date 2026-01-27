# CodeKingdom - Next.js Version

This is the Next.js migration of CodeKingdom.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local`:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NEXT_PUBLIC_API_URL=/api
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Migration Status

See `NEXTJS_MIGRATION_GUIDE.md` for detailed migration progress.

## Project Structure

```
nextjs-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── page.tsx           # Home page
│   └── layout.tsx         # Root layout
├── models/                # Mongoose models
├── lib/                   # Utilities (MongoDB, auth)
├── components/            # React components (to be migrated)
└── public/                # Static assets
```

## Next Steps

1. Complete API route migration
2. Migrate React components and pages
3. Update routing from React Router to Next.js
4. Test all functionality
5. Deploy to Vercel
