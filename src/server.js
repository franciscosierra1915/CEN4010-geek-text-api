/**
 * @file server.js
 * @description Entry point for the Geek Text REST API.
 *
 * This file creates and configures the Express application:
 *   1. Loads environment variables from the .env file.
 *   2. Applies global middleware (CORS, JSON body parsing).
 *   3. Registers a health-check endpoint so ops tooling can verify the server is alive.
 *   4. Mounts feature routers under /api/* prefixes.
 *   5. Adds a 404 catch-all and a global error handler.
 *   6. Starts the HTTP server on the configured PORT.
 *
 * @module server
 */

// Load environment variables (DATABASE_URL, PORT, etc.) from the .env file
// before any other module that might need them.
require('dotenv').config();

const express = require('express'); // Web framework for routing and middleware
const cors    = require('cors');    // Middleware that adds CORS headers so browsers on other origins can call this API

// ── Route Imports ────────────────────────────────────────────────────────────
// Each feature area lives in its own router file under src/routes/.
const bookRoutes = require('./routes/books.routes');

// Future sprint routes — uncomment each line as the corresponding feature branch is merged:
// const profileRoutes  = require('./routes/profiles.routes');  // Sprint 3 – User Profile Management
const cartRoutes     = require('./routes/cart.routes');       // Sprint 3 – Shopping Cart
// const ratingRoutes   = require('./routes/ratings.routes');    // Sprint 3 – Book Rating & Commenting
// const wishlistRoutes = require('./routes/wishlists.routes');  // Sprint 3 – Wishlist Management

// ── App Setup ────────────────────────────────────────────────────────────────

/** @type {import('express').Application} The configured Express application instance */
const app = express();

/**
 * The TCP port on which the server will listen.
 * Reads from the PORT environment variable; falls back to 3000 for local development.
 * @type {number|string}
 */
const PORT = process.env.PORT || 3000;

// ── Global Middleware ─────────────────────────────────────────────────────────

/**
 * Enable Cross-Origin Resource Sharing (CORS) for all routes and all origins.
 * This is required so the frontend (running on a different port or domain)
 * can make fetch/XHR calls to this API without being blocked by the browser.
 */
app.use(cors());

/**
 * Automatically parse incoming request bodies that have Content-Type: application/json.
 * After this middleware runs, handler functions can access the parsed body via req.body.
 */
app.use(express.json());

// ── Health Check Endpoint ─────────────────────────────────────────────────────

/**
 * @route   GET /health
 * @summary Quick sanity check — verifies the server process is running and responsive.
 * @access  Public
 *
 * Useful for:
 *   - Load balancers that need to confirm the instance is healthy before routing traffic.
 *   - CI/CD pipelines that poll until the server is up before running integration tests.
 *   - Manual curl checks during development.
 *
 * @param {import('express').Request}  req - Express request object (not used here).
 * @param {import('express').Response} res - Express response object used to send the reply.
 * @returns {void} Responds with HTTP 200 and a JSON payload containing status and timestamp.
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status:    'OK',                       // Simple flag that monitoring tools can check
    message:   'Geek Text API is running', // Human-readable confirmation
    timestamp: new Date().toISOString(),   // ISO-8601 timestamp so the caller knows when the check ran
  });
});

// ── Feature Routers ───────────────────────────────────────────────────────────
// app.use(prefix, router) mounts a router so every route it defines is prefixed.
// Example: a route defined as GET / inside bookRoutes becomes GET /api/books.

app.use('/api/books', bookRoutes); // All book-related endpoints (browse, details, CRUD)

// Uncomment as each sprint's feature is implemented and its branch is merged:
// app.use('/api/users',     profileRoutes);  // User profile creation and management
// app.use('/api/cart',      cartRoutes);     // Add-to-cart, update quantity, checkout
// app.use('/api/ratings',   ratingRoutes);   // Star ratings and written comments
// app.use('/api/wishlists', wishlistRoutes); // Create wishlists and move items to cart

// ── 404 Catch-All ─────────────────────────────────────────────────────────────

/**
 * Handles any request that didn't match a registered route.
 * Must be placed AFTER all routers so it only catches truly unmatched paths.
 *
 * @param {import('express').Request}  req - Incoming request (used to read method and URL).
 * @param {import('express').Response} res - Response used to send the 404 error.
 * @returns {void} Responds with HTTP 404 and a descriptive error message.
 */
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────

/**
 * Catches any error passed to next(err) anywhere in the application.
 * Express identifies error-handling middleware by its 4-argument signature —
 * all four parameters must be declared even if `next` is not used here.
 *
 * @param {Error}                      err  - The error object forwarded by next(err).
 * @param {import('express').Request}  req  - Incoming request (not used directly here).
 * @param {import('express').Response} res  - Response used to send the error reply.
 * @param {import('express').NextFunction} next - Required 4th param for Express to recognize this as an error handler.
 * @returns {void} Responds with HTTP 500 and a generic error message to avoid leaking internals.
 */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Log the full stack trace server-side so developers can debug, but
  // never expose internal stack traces to the client (security risk).
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start the HTTP Server ─────────────────────────────────────────────────────

/**
 * Bind the Express app to the chosen port and start accepting connections.
 * The callback runs once the server is listening, printing helpful URLs to the console.
 */
app.listen(PORT, () => {
  console.log(`✅ Geek Text API running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Books:        http://localhost:${PORT}/api/books`);
});

/**
 * Export the configured app so it can be imported by integration tests
 * without binding a port (test runners typically manage the port themselves).
 */
module.exports = app;
