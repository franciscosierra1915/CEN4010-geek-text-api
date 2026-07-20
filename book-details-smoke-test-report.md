# Book-Details Smoke Test Report

Feature owner: Francisco Sierra
Run at: 2026-07-16T22:06:19.932Z
Target: http://localhost:3000

**Result: 10/10 checks passed**

| # | Check | Method | Endpoint | Expected | Actual | Result | Notes |
|---|---|---|---|---|---|---|---|
| 1 | Server is up | GET | `/health` | 200 | 200 | PASS |  |
| 2 | Retrieve all books | GET | `/api/books` | 200 | 200 | PASS | count=30 |
| 3 | Retrieve book by valid ISBN | GET | `/api/books/isbn/9781718500099` | 200 | 200 | PASS | title="Bug Bounty Bootcamp: The Guide to Finding and Reporting Web Vulnerabilities", averageRating=null |
| 4 | 404 on nonexistent ISBN | GET | `/api/books/isbn/0000000000000` | 404 | 404 | PASS |  |
| 5 | Create a new book | POST | `/api/books` | 201 | 201 | PASS | created id=31 |
| 6 | 400 on missing required field | POST | `/api/books` | 400 | 400 | PASS |  |
| 7 | Create a new author | POST | `/api/authors` | 201 | 201 | PASS | created id=11 |
| 8 | 400 on missing required fields | POST | `/api/authors` | 400 | 400 | PASS |  |
| 9 | Retrieve books by valid author id | GET | `/api/authors/7/books` | 200 | 200 | PASS | count=7 |
| 10 | 404 on nonexistent author id | GET | `/api/authors/999999/books` | 404 | 404 | PASS |  |
