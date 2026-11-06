const mongoose = require('mongoose');

let dbConnected = false;

function hasValidMongoUri(uri) {
  if (!uri || typeof uri !== 'string') return false;
  if (
    uri.includes('<username>') ||
    uri.includes('<password>') ||
    uri.includes('<admin>')
  ) {
    return false;
  }
  return uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!hasValidMongoUri(uri)) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'MONGODB_URI is missing or still contains placeholder values in production environment.'
      );
    }
    console.warn('\n┌──────────────────────────────────────────────────────────────────────────┐');
    console.warn('│ [DEV MODE] MONGODB_URI in server/.env still has placeholder credentials. │');
    console.warn('│ Running with pre-seeded In-Memory Craft Store for instant preview.       │');
    console.warn('│ Paste your MongoDB Atlas URI in server/.env & run `npm run seed` anytime │');
    console.warn('└──────────────────────────────────────────────────────────────────────────┘\n');
    dbConnected = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    dbConnected = true;
    console.log(`MongoDB Atlas Connected: ${conn.connection.host} (${conn.connection.name})`);
    return true;
  } catch (err) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Fatal MongoDB Connection Error:', err.message);
      process.exit(1);
    }
    console.warn(`MongoDB connection failed (${err.message}). Falling back to In-Memory Store in dev mode.`);
    dbConnected = false;
    return false;
  }
}

function isDbConnected() {
  return dbConnected && mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  isDbConnected,
  hasValidMongoUri,
};
