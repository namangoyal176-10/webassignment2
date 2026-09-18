const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connects to MongoDB with connection pooling and caching
 * suitable for both local long-running servers and Vercel serverless functions.
 */
async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel_db';
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION);
  const isLocalUri = MONGODB_URI.includes('127.0.0.1') || MONGODB_URI.includes('localhost');

  // When deployed on Vercel without a cloud MongoDB Atlas URI, skip local connection
  if (isServerless && isLocalUri) {
    console.warn('[MongoDB] Running on Vercel with localhost URI. MongoDB Atlas URI (mongodb+srv://...) required for cloud persistence.');
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log(`[MongoDB] Connected successfully to ${mongooseInstance.connection.name}`);
      return mongooseInstance;
    }).catch((err) => {
      cached.promise = null;
      console.error('[MongoDB] Connection error:', err.message);
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('[MongoDB] Connection failed:', e.message);
    return null;
  }

  return cached.conn;
}

module.exports = connectDB;

