import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codekingdom';

// Debug logging
console.log('MONGODB_URI from env:', process.env.MONGODB_URI);
console.log('MONGODB_URI final value:', MONGODB_URI);
console.log('MONGODB_URI length:', MONGODB_URI?.length);
console.log('MONGODB_URI starts with mongodb:', MONGODB_URI?.startsWith('mongodb'));

if (!MONGODB_URI || MONGODB_URI.trim() === '') {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Validate URI before attempting connection
  if (!MONGODB_URI || !MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
    console.error('Invalid MONGODB_URI:', MONGODB_URI);
    throw new Error(`Invalid MONGODB_URI. Got: "${MONGODB_URI}". Expected format: mongodb://localhost:27017/codekingdom`);
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB Connected');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
