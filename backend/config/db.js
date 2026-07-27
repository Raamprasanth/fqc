// ─────────────────────────────────────────────────────────────────────────────
// backend/config/db.js
// Mongoose connection to MongoDB Atlas
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in .env');
  }

  try {
    await mongoose.connect(uri, {
      // These options are safe defaults for Atlas
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('✅  MongoDB Atlas connected:', mongoose.connection.host);

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Retrying...');
      isConnected = false;
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌  MongoDB connection error:', err.message);
    });
  } catch (err) {
    console.error('❌  Failed to connect to MongoDB Atlas:', err.message);
    process.exit(1); // Exit — can't run without DB
  }
}

module.exports = connectDB;
