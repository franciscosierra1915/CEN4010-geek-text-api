// src/server.js
// Geek Text API — Express Application Entry Point

require('dotenv').config();
const express = require('express');
const cors    = require('cors');

// ── Route Imports ────────────────────────────────────────────────────────────
const bookRoutes = require('./routes/books.routes');
// Future sprint routes — uncomment as each feature is implemented:
// const profileRoutes  = require('./routes/profiles.routes');
// const cartRoutes     = require('./routes/cart.routes');
// const ratingRoutes   = require('./routes/ratings.routes');
// const wishlistRoutes = require('./routes/wishlists.routes');

// ── App Setup ────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());               // Allow cross-origin requests (needed for frontend integration)
app.use(express.json());       // Parse incoming JSON request bodies

// ── Health Check ─────────────────────────────────────────────────────────────
// GET /health  — quick sanity check that the server is alive
app.get('/health', (req, res) => {
  res.status(200).json({
    status:    'OK',
    message:   'Geek Text API is running',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/books',     bookRoutes);
// app.use('/api/users',     profileRoutes);
// app.use('/api/cart',      cartRoutes);
// app.use('/api/ratings',   ratingRoutes);
// app.use('/api/wishlists', wishlistRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// Must have 4 parameters for Express to recognize it as an error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Geek Text API running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Books:        http://localhost:${PORT}/api/books`);
});

module.exports = app;
