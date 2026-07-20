#!/usr/bin/env node
/**
 * @file smoke-test-book-details.js
 * @description Automated smoke test suite for the Book-Details feature (Francisco Sierra).
 *
 * Covers every Book-Details endpoint, happy path + error case, matching the
 * "📚 Book Details (Francisco Sierra)" folder in the team's Postman collection:
 *   - GET  /api/books
 *   - GET  /api/books/isbn/:isbn            (valid + 404 case)
 *   - POST /api/books                       (valid + 400 case)
 *   - POST /api/authors                     (valid + 400 case)
 *   - GET  /api/authors/:id/books           (valid + 404 case)
 *
 * The script pulls a real book from GET /api/books and reuses its isbn/
 * authorId/genreId/publisherId for the rest of the checks, so it works
 * against whatever data is actually seeded — no hardcoded ids required.
 *
 * Prerequisites:
 *   1. The server is running:      npm run dev
 *   2. The database has data:      npm run prisma:seed   (if it's empty)
 *
 * Usage:
 *   node smoke-test-book-details.js
 *
 * Produces:
 *   - Console output with a PASS/FAIL line per check
 *   - book-details-smoke-test-report.md — hand this to your professor
 */

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:3000';
const fs = require('fs');
const path = require('path');

const results = [];

function record(name, method, url, expected, actualStatus, pass, notes) {
  results.push({ name, method, url, expected, actualStatus, pass, notes });
  const icon = pass ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon}  [${method}] ${url}  — ${name}`);
  if (!pass) {
    console.log(`         expected ${expected}, got ${actualStatus}${notes ? ' — ' + notes : ''}`);
  } else if (notes) {
    console.log(`         ${notes}`);
  }
}

async function run() {
  console.log(`\nRunning Book-Details smoke tests against ${BASE_URL}\n`);

  // ── 0. Health check ──────────────────────────────────────────────────────
  try {
    const res = await fetch(`${BASE_URL}/health`);
    record('Server is up', 'GET', '/health', 200, res.status, res.status === 200, '');
  } catch (e) {
    record('Server is up', 'GET', '/health', 200, 'NO CONNECTION', false,
      `Could not reach the server — is 'npm run dev' running on port 3000? (${e.message})`);
    return printReport();
  }

  // ── 1. GET /api/books ────────────────────────────────────────────────────
  let sampleBook = null;
  try {
    const res = await fetch(`${BASE_URL}/api/books`);
    const body = await res.json();
    const ok = res.status === 200 && Array.isArray(body.data) && typeof body.count === 'number';
    record('Retrieve all books', 'GET', '/api/books', 200, res.status, ok,
      ok ? `count=${body.count}` : `unexpected response shape: ${JSON.stringify(body).slice(0, 200)}`);
    if (ok && body.data.length > 0) sampleBook = body.data[0];
  } catch (e) {
    record('Retrieve all books', 'GET', '/api/books', 200, 'ERROR', false, e.message);
  }

  if (!sampleBook) {
    console.log('\n⚠️  No books came back from /api/books — the rest of the checks depend on');
    console.log('    real data. Run `npm run prisma:seed` and re-run this script.\n');
    return printReport();
  }

  // ── 2. GET /api/books/isbn/:isbn (valid) ────────────────────────────────
  try {
    const res = await fetch(`${BASE_URL}/api/books/isbn/${sampleBook.isbn}`);
    const body = await res.json();
    const ok = res.status === 200 && body.data && body.data.isbn === sampleBook.isbn && 'averageRating' in body.data;
    record('Retrieve book by valid ISBN', 'GET', `/api/books/isbn/${sampleBook.isbn}`, 200, res.status, ok,
      ok ? `title="${body.data.title}", averageRating=${body.data.averageRating}` : 'unexpected response shape');
  } catch (e) {
    record('Retrieve book by valid ISBN', 'GET', `/api/books/isbn/${sampleBook.isbn}`, 200, 'ERROR', false, e.message);
  }

  // ── 3. GET /api/books/isbn/:isbn (invalid) ──────────────────────────────
  const badIsbn = '0000000000000';
  try {
    const res = await fetch(`${BASE_URL}/api/books/isbn/${badIsbn}`);
    record('404 on nonexistent ISBN', 'GET', `/api/books/isbn/${badIsbn}`, 404, res.status, res.status === 404, '');
  } catch (e) {
    record('404 on nonexistent ISBN', 'GET', `/api/books/isbn/${badIsbn}`, 404, 'ERROR', false, e.message);
  }

  // ── 4. POST /api/books (valid — unique isbn every run) ──────────────────
  const newIsbn = `999${Date.now().toString().slice(-10)}`;
  try {
    const res = await fetch(`${BASE_URL}/api/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isbn: newIsbn,
        title: 'Smoke Test Book',
        description: 'Created by the automated Book-Details smoke test — safe to delete.',
        price: 19.99,
        yearPublished: 2026,
        authorId: sampleBook.authorId,
        genreId: sampleBook.genreId,
        publisherId: sampleBook.publisherId,
      }),
    });
    const body = await res.json();
    const ok = res.status === 201 && body.data && body.data.isbn === newIsbn;
    record('Create a new book', 'POST', '/api/books', 201, res.status, ok,
      ok ? `created id=${body.data.id}` : JSON.stringify(body).slice(0, 200));
  } catch (e) {
    record('Create a new book', 'POST', '/api/books', 201, 'ERROR', false, e.message);
  }

  // ── 5. POST /api/books (missing required field) ─────────────────────────
  try {
    const res = await fetch(`${BASE_URL}/api/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isbn: `998${Date.now().toString().slice(-10)}`,
        title: 'Missing Description Book',
        // description intentionally omitted
        price: 19.99,
        yearPublished: 2026,
        authorId: sampleBook.authorId,
        genreId: sampleBook.genreId,
        publisherId: sampleBook.publisherId,
      }),
    });
    record('400 on missing required field', 'POST', '/api/books', 400, res.status, res.status === 400, '');
  } catch (e) {
    record('400 on missing required field', 'POST', '/api/books', 400, 'ERROR', false, e.message);
  }

  // ── 6. POST /api/authors (valid) ────────────────────────────────────────
  const stamp = Date.now();
  try {
    const res = await fetch(`${BASE_URL}/api/authors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Smoke',
        lastName: `Test${stamp}`,
        biography: 'Created by the automated Book-Details smoke test — safe to delete.',
        publisherId: sampleBook.publisherId,
      }),
    });
    const body = await res.json();
    const ok = res.status === 201 && body.data && body.data.lastName === `Test${stamp}`;
    record('Create a new author', 'POST', '/api/authors', 201, res.status, ok,
      ok ? `created id=${body.data.id}` : JSON.stringify(body).slice(0, 200));
  } catch (e) {
    record('Create a new author', 'POST', '/api/authors', 201, 'ERROR', false, e.message);
  }

  // ── 7. POST /api/authors (missing required fields) ──────────────────────
  try {
    const res = await fetch(`${BASE_URL}/api/authors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'NoLastName' }),
    });
    record('400 on missing required fields', 'POST', '/api/authors', 400, res.status, res.status === 400, '');
  } catch (e) {
    record('400 on missing required fields', 'POST', '/api/authors', 400, 'ERROR', false, e.message);
  }

  // ── 8. GET /api/authors/:id/books (valid) ───────────────────────────────
  try {
    const res = await fetch(`${BASE_URL}/api/authors/${sampleBook.authorId}/books`);
    const body = await res.json();
    const ok = res.status === 200 && Array.isArray(body.data) && body.data.length > 0;
    record('Retrieve books by valid author id', 'GET', `/api/authors/${sampleBook.authorId}/books`, 200, res.status, ok,
      ok ? `count=${body.count}` : 'unexpected response shape');
  } catch (e) {
    record('Retrieve books by valid author id', 'GET', `/api/authors/${sampleBook.authorId}/books`, 200, 'ERROR', false, e.message);
  }

  // ── 9. GET /api/authors/:id/books (invalid id) ──────────────────────────
  try {
    const res = await fetch(`${BASE_URL}/api/authors/999999/books`);
    record('404 on nonexistent author id', 'GET', '/api/authors/999999/books', 404, res.status, res.status === 404, '');
  } catch (e) {
    record('404 on nonexistent author id', 'GET', '/api/authors/999999/books', 404, 'ERROR', false, e.message);
  }

  printReport();
}

function printReport() {
  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  console.log(`\n${passed}/${total} checks passed\n`);

  const lines = [];
  lines.push('# Book-Details Smoke Test Report');
  lines.push('');
  lines.push('Feature owner: Francisco Sierra');
  lines.push(`Run at: ${new Date().toISOString()}`);
  lines.push(`Target: ${BASE_URL}`);
  lines.push('');
  lines.push(`**Result: ${passed}/${total} checks passed**`);
  lines.push('');
  lines.push('| # | Check | Method | Endpoint | Expected | Actual | Result | Notes |');
  lines.push('|---|---|---|---|---|---|---|---|');
  results.forEach((r, i) => {
    lines.push(`| ${i + 1} | ${r.name} | ${r.method} | \`${r.url}\` | ${r.expected} | ${r.actualStatus} | ${r.pass ? 'PASS' : 'FAIL'} | ${(r.notes || '').replace(/\|/g, '/')} |`);
  });
  lines.push('');

  const reportPath = path.join(__dirname, 'book-details-smoke-test-report.md');
  fs.writeFileSync(reportPath, lines.join('\n'));
  console.log(`Report written to: ${reportPath}`);
}

run();
