// ─────────────────────────────────────────────────────────────────────────────
// backend/server.js
// Entry point for the SchillerIndia Services backend
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

let connectDB;
try {
  connectDB = require('./config/db');
} catch (e) {
  try {
    connectDB = require('./db');
  } catch (err) {
    console.error("Could not find db.js in ./config/db or ./db", err);
    throw err;
  }
}

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const divisionsRouter = require('./routes/divisions');
const empRouter = require('./routes/emp');
const inwardRouter = require('./routes/inward');
const outwardRouter = require('./routes/outward');
const shortshipmentRouter = require('./routes/shortshipment');
const dodRouter = require('./routes/dod');
const doaRouter = require('./routes/doa');
const accoutRouter = require('./routes/accout');
const batteryRouter = require('./routes/battery');
const medilogRouter = require('./routes/medilog');
const aoutRouter = require('./routes/aout');
const ashortRouter = require('./routes/ashort');

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allows the HTML frontend (served from any origin during dev) to reach this API.
// In production, replace the origin with your actual domain.
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:5500', 'null'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve static frontend ─────────────────────────────────────────────────────
// Makes both index.html and login.html available at http://localhost:3001/
app.use(express.static(path.join(__dirname, '..', 'public', 'frontend')));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/divisions', divisionsRouter);
app.use('/api/emp', empRouter);
app.use('/api/inward', inwardRouter);
app.use('/api/outward', outwardRouter);
app.use('/api/shortshipment', shortshipmentRouter);
app.use('/api/dod', dodRouter);
app.use('/api/doa', doaRouter);
app.use('/api/accout', accoutRouter);
app.use('/api/battery', batteryRouter);
app.use('/api/medilog', medilogRouter);
app.use('/api/aout', aoutRouter);
app.use('/api/ashort', ashortRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler for unknown API paths ────────────────────────────────────────
app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

// ── Catch-all: send frontend for any non-API route ───────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'frontend', 'index.html'));
});

// ── Connect to MongoDB Atlas, then start HTTP server ─────────────────────────
async function startServer() {
  await connectDB(); // Will exit(1) on failure

  app.listen(PORT, () => {
    console.log(`\n🚀  SchillerIndia backend running at http://localhost:${PORT}`);
    console.log(`📂  Serving frontend from /public/frontend/`);
    console.log(`🔐  Auth API ready at http://localhost:${PORT}/api/auth/login\n`);
  });
}

startServer();
