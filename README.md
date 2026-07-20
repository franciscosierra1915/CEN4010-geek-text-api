# Geek Text API

**Course:** CEN 4010 — Principles of Software Engineering  
**Institution:** Florida International University (FIU)  
**Project:** Geek Text — Online Tech Bookstore  
**Layer:** Backend REST API  
**Repository:** https://github.com/franciscosierra1915/CEN4010-geek-text-api  

---

## Team — Group 9: GeekText Architects

| Name | Role | Feature |
|---|---|---|
| Francisco Sierra | Scrum Master (Sprint 1 & 2) · Feature Owner | Book Details |
| Guillermo Yepez | Product Owner (Sprint 1) · Feature Owner | Book Rating & Commenting |
| Shreya Sureshbabu Banumathi | Feature Owner | Book Browsing & Sorting |
| Stewart Smith Jr | Feature Owner | Profile Management |
| Santiago Suli Ramirez | Feature Owner | Shopping Cart |
| Hiram Torres-Marin | Feature Owner | Wishlist Management |

**Sprint Schedule**

| Sprint | Dates | Goal | Review Date |
|---|---|---|---|
| Sprint 1 | May 18 – May 31 | Team setup, roles, architecture, GitHub, backlog | June 2 |
| Sprint 2 | June 1 – June 14 | Database schema, seed data, first working GET endpoints | June 16 |
| Sprint 3 | June 15 – June 28 | Individual feature endpoints (all 6 features) | June 30 |
| Sprint 4 | June 29 – July 12 | Integration, remaining endpoints, documentation | July 14 |
| Sprint 5 | July 13 – July 26 | Final polish, Swagger docs, demo preparation | July 28 |

---

## Table of Contents

1. [What Is This Project?](#1-what-is-this-project)
2. [How the Application Works (Big Picture)](#2-how-the-application-works-big-picture)
3. [Technologies & Tools Used](#3-technologies--tools-used)
4. [Project Structure](#4-project-structure)
5. [Feature Branches & Team Ownership](#5-feature-branches--team-ownership)
6. [Getting Started — Step-by-Step Setup](#6-getting-started--step-by-step-setup)
7. [Environment Variables (.env file)](#7-environment-variables-env-file)
8. [Available Commands (npm Scripts)](#8-available-commands-npm-scripts)
9. [API Endpoints (What the Server Can Do Right Now)](#9-api-endpoints-what-the-server-can-do-right-now)
10. [Database Overview](#10-database-overview)
11. [Git Branching Strategy](#11-git-branching-strategy)
12. [Team Working Agreements](#12-team-working-agreements)

---

## 1. What Is This Project?

**Geek Text** is a fictional online bookstore that specializes in technology books. Think of it like Amazon, but only for tech books.

This repository contains the **backend API** — the "brain" of the application. It is the server-side program that:

- Stores and manages all the data (books, users, ratings, carts, wishlists, etc.) in a database.
- Listens for requests from a frontend (website/app) or testing tools.
- Responds with data in a structured format called **JSON**.

> **Analogy:** Imagine a restaurant. The frontend (website) is the menu and the dining room — what the customer sees. The backend API is the kitchen — it receives orders, processes them, and sends back the food (data). The database is the pantry where all the ingredients (data) are stored.

---

## 2. How the Application Works (Big Picture)

Here is the flow of a typical request through the system:

```
[Browser / Frontend App]
         |
         |  HTTP Request  (e.g. GET /api/books)
         v
[Express Server — src/server.js]
         |
         |  Routes the request to the right handler
         v
[Router — src/routes/books.routes.js]
         |
         |  Calls the right controller function
         v
[Controller — src/controllers/books.controller.js]
         |
         |  Queries the database using Prisma
         v
[Prisma ORM]
         |
         |  Runs SQL queries
         v
[PostgreSQL Database]
         |
         |  Returns rows of data
         v
[Controller builds a JSON response]
         |
         v
[Browser / Frontend App receives JSON]
```

Each layer has one job:
| Layer | File | Job |
|---|---|---|
| Server | `src/server.js` | Start the app, apply middleware, connect all routes |
| Router | `src/routes/books.routes.js` | Map URL paths to controller functions |
| Controller | `src/controllers/books.controller.js` | Run business logic, query the DB, send response |
| Schema | `prisma/schema.prisma` | Define the shape of the database tables |
| Seed | `prisma/seed.js` | Fill the database with sample data for testing |

---

## 3. Technologies & Tools Used

You don't need to be an expert in all of these before you start — just read each definition so you know what it is and where it is used.

---

### JavaScript
**What it is:** A programming language originally built to make web pages interactive. It now runs on servers too (via Node.js), making it one of the only languages that works on both the frontend and the backend.

**Where it's used in this project:** Every `.js` file in the `src/` and `prisma/` folders is written in JavaScript.

---

### Node.js
**What it is:** A program that lets you run JavaScript code on your computer (or a server) *outside* of a browser. Before Node.js existed, JavaScript could only run inside a web browser.

**Where it's used in this project:** Node.js is the engine that runs our Express server. When you type `node src/server.js`, Node.js reads and executes that file.

**How to check if you have it:** Open your terminal and type:
```
node --version
```
You should see something like `v20.x.x`.

---

### npm (Node Package Manager)
**What it is:** A tool that comes bundled with Node.js. It lets you download and manage *packages* (pre-written libraries of code that other developers have published). Instead of writing everything from scratch, we install packages that solve common problems.

**Where it's used in this project:** When you run `npm install`, npm reads `package.json` and downloads all the packages the project needs into a folder called `node_modules/`.

**How to check if you have it:**
```
npm --version
```

---

### Express.js
**What it is:** A minimal web framework for Node.js. It makes it easy to create a web server and define URL routes (i.e., "when someone visits `/api/books`, run this function").

**Where it's used in this project:** `src/server.js` creates the Express app. `src/routes/books.routes.js` uses Express's `Router` to define the API endpoints.

**Think of it like:** The traffic control system of our server — it directs each incoming request to the right handler function.

---

### PostgreSQL
**What it is:** A free, open-source *relational database* — a program that stores data in organized tables (like Excel spreadsheets), with rows and columns. Tables can be linked together through relationships (hence "relational"). It uses a language called **SQL** to read and write data.

**Where it's used in this project:** All application data (books, users, ratings, etc.) is stored in a PostgreSQL database named `geek_text_api` running on your local machine.

**How to check if you have it:**
```
psql --version
```

---

### Prisma (ORM)
**What it is:** Prisma is an **ORM** (Object-Relational Mapper). An ORM is a tool that lets you interact with a database using the programming language you already know (JavaScript) instead of writing raw SQL.

Without Prisma you'd write:
```sql
SELECT * FROM "Book" WHERE isbn = '9780132350884';
```

With Prisma you write:
```js
prisma.book.findUnique({ where: { isbn: '9780132350884' } });
```

Prisma also reads your `schema.prisma` file and uses it to create the actual database tables automatically.

**Where it's used in this project:**
- `prisma/schema.prisma` — defines all the database tables (called *models*) and their columns (called *fields*).
- `prisma/seed.js` — uses the Prisma client to insert sample data.
- `src/controllers/books.controller.js` — uses the Prisma client to query the database when handling API requests.

---

### dotenv
**What it is:** A package that reads a file called `.env` and loads the values inside it as environment variables — configuration values your program needs but that should never be hardcoded in the source code (like database passwords or API keys).

**Where it's used in this project:** `src/server.js` calls `require('dotenv').config()` at the very top, which loads `DATABASE_URL` and `PORT` from the `.env` file before anything else runs.

---

### CORS (cors package)
**What it is:** CORS stands for **Cross-Origin Resource Sharing**. By default, browsers block JavaScript running on one domain (e.g., `localhost:5173`) from calling an API on a different domain (e.g., `localhost:3000`). The `cors` package adds special HTTP headers that tell the browser "it's okay, this API allows requests from other origins."

**Where it's used in this project:** `src/server.js` applies `app.use(cors())` globally so the future frontend can communicate with this API during development.

---

### nodemon
**What it is:** A development tool that watches your project files and automatically restarts the Node.js server every time you save a change. Without it, you'd have to manually stop and restart the server after every edit.

**Where it's used in this project:** The `npm run dev` command uses nodemon instead of plain `node` so you get automatic reloads while coding.

---

### JSON (JavaScript Object Notation)
**What it is:** A lightweight, human-readable format for representing structured data. It looks like this:
```json
{
  "title": "Clean Code",
  "price": 49.99,
  "author": { "firstName": "Robert", "lastName": "Martin" }
}
```
All API responses in this project are JSON.

**Where it's used in this project:** Every response sent by the server is JSON. Express's `res.json()` method automatically converts a JavaScript object to JSON and sets the correct Content-Type header.

---

### Git
**What it is:** A version control system — a tool that tracks every change made to your code over time. It lets multiple developers work on the same project simultaneously without overwriting each other's work.

**Where it's used in this project:** The entire codebase is tracked with Git. Each developer works on their own branch and submits a Pull Request to merge into `main`.

---

### GitHub
**What it is:** A website that hosts Git repositories online so the whole team can share code. It also provides Pull Requests, code review, and the project board.

**Repository URL:** https://github.com/franciscosierra1915/CEN4010-geek-text-api

---

## 4. Project Structure

```
Geek Text API/
│
├── prisma/
│   ├── schema.prisma       ← Defines ALL database tables and their columns
│   └── seed.js             ← Inserts sample books, users, ratings, etc. for testing
│
├── src/
│   ├── controllers/
│   │   └── books.controller.js  ← Logic for book-related API requests
│   │
│   ├── routes/
│   │   └── books.routes.js      ← Maps URL paths to controller functions
│   │
│   └── server.js                ← Entry point: starts the server
│
├── .env                    ← Your secret config (NOT committed to GitHub)
├── .gitignore              ← Tells Git which files/folders to ignore
├── package.json            ← Project metadata and list of dependencies
├── package-lock.json       ← Exact version lock of every installed package
└── README.md               ← This file
```

> **Important:** The `node_modules/` folder (where npm puts downloaded packages) is listed in `.gitignore` and is **never committed to GitHub**. Each developer runs `npm install` locally to generate their own copy.

---

## 5. Feature Branches & Team Ownership

Each feature is developed in its own isolated Git branch. Here is the current branch map:

| Branch Name | Feature | Owner |
|---|---|---|
| `main` | Stable production code — merged, reviewed code only | All |
| `Book-Details` | Book Details — view a single book's full information | Francisco Sierra |
| `Book-Browsing-and-Sorting` | Book Browsing & Sorting — filter by genre, top sellers, rating, publisher | Shreya Sureshbabu Banumathi |
| `Profile-Management` | Profile Management — create and manage user profiles and credit cards | Stewart Smith Jr |
| `Shopping-Cart` | Shopping Cart — add/remove books, update quantities | Santiago Suli Ramirez |
| `Ratings-and-Comments` | Ratings & Comments — submit and view star ratings and written reviews | Guillermo Yepez |
| `Wishlist-Management` | Wishlist Management — create wishlists, add/remove books | Hiram Torres-Marin |

**Rule:** Never commit directly to `main`. Always work on your feature branch.

---

## 6. Getting Started — Step-by-Step Setup

Follow every step in order. If you skip a step and something breaks, come back and make sure you didn't miss anything.

### Step 1 — Install the Prerequisites

You need three programs installed on your computer before anything else will work.

#### A. Install Node.js (includes npm automatically)

1. Go to https://nodejs.org
2. Download the **LTS** version (the one labeled "Recommended For Most Users").
3. Run the installer and follow the prompts.
4. Verify it worked by opening your terminal and typing:
   ```
   node --version
   npm --version
   ```
   Both commands should print a version number (not an error).

#### B. Install PostgreSQL

1. Go to https://www.postgresql.org/download/ and choose your operating system.
2. Download and run the installer. When asked to set a password for the `postgres` user, **write it down** — you'll need it.
3. Verify it worked:
   ```
   psql --version
   ```
   You should see something like `psql (PostgreSQL) 16.x`.

#### C. Install Git

1. Go to https://git-scm.com/downloads and download Git for your OS.
2. Run the installer (default settings are fine).
3. Verify it worked:
   ```
   git --version
   ```

---

### Step 2 — Clone the Repository

"Cloning" means downloading a copy of the repository from GitHub to your computer.

1. Open your terminal (on Mac: search for "Terminal"; on Windows: use "Git Bash" or "Command Prompt").
2. Navigate to the folder where you want to store the project. For example, to put it on your Desktop:
   ```bash
   cd ~/Desktop
   ```
3. Clone the repo:
   ```bash
   git clone https://github.com/franciscosierra1915/CEN4010-geek-text-api.git
   ```
4. Move into the newly created project folder:
   ```bash
   cd CEN4010-geek-text-api
   ```

---

### Step 3 — Install Project Dependencies

The project uses several third-party packages (Express, Prisma, etc.). npm downloads them all with one command:

```bash
npm install
```

This reads `package.json`, downloads every package listed there, and places them in a `node_modules/` folder. It may take a minute. When it finishes, you should see a summary line like `added 123 packages`.

---

### Step 4 — Create the Database

PostgreSQL needs a database created before Prisma can connect to it. Run these commands in your terminal:

```bash
psql -U postgres
```

This opens the PostgreSQL interactive terminal. You may be prompted for the password you set during installation. Then type:

```sql
CREATE DATABASE geek_text_api;
\q
```

The `\q` command quits the PostgreSQL terminal and returns you to your regular terminal.

> **Tip (Mac users):** If `psql -U postgres` fails, try `psql -U $(whoami)` instead — on some Mac installations the default user is your system username.

---

### Step 5 — Create the .env File

The `.env` file stores secret configuration values that should never be committed to GitHub (like your database password). You need to create this file yourself on your local machine.

1. In the root of the project folder, create a new file named exactly `.env` (note the dot at the start).
2. Paste the following content into it, replacing the values with your own:

```
DATABASE_URL="postgresql://YOUR_POSTGRES_USERNAME:YOUR_POSTGRES_PASSWORD@localhost:5432/geek_text_api?schema=public"
PORT=3000
```

**How to fill in the values:**

| Placeholder | Replace with |
|---|---|
| `YOUR_POSTGRES_USERNAME` | Your PostgreSQL username. On Mac this is often your system username. On Windows it's often `postgres`. |
| `YOUR_POSTGRES_PASSWORD` | The password you chose when installing PostgreSQL. If you didn't set one, remove `:YOUR_POSTGRES_PASSWORD` entirely (leave just the `@`). |

**Example for a Mac user with no password:**
```
DATABASE_URL="postgresql://johndoe@localhost:5432/geek_text_api?schema=public"
PORT=3000
```

**Example for a Windows user with a password:**
```
DATABASE_URL="postgresql://postgres:mypassword123@localhost:5432/geek_text_api?schema=public"
PORT=3000
```

> **Why is this file not on GitHub?** The `.gitignore` file tells Git to ignore `.env`. This protects your credentials — you should never commit passwords or secret keys to a shared repository.

---

### Step 6 — Run the Database Migration

Prisma reads `prisma/schema.prisma` and creates the actual tables in your PostgreSQL database. Run:

```bash
npx prisma migrate dev --name init
```

What this does:
1. Connects to your PostgreSQL database using the `DATABASE_URL` from `.env`.
2. Reads `prisma/schema.prisma` to understand the table structure.
3. Generates a SQL file that creates all the tables.
4. Runs that SQL file against your database.
5. Generates the Prisma Client JavaScript code in `node_modules/@prisma/client`.

You should see output ending in something like `✔ Generated Prisma Client`.

---

### Step 7 — Seed the Database with Sample Data

The seed script fills the empty database with 30 books, 5 users, ratings, comments, and more — so you have realistic data to work with immediately.

```bash
npm run prisma:seed
```

You should see output like:
```
🌱 Seeding Geek Text database...
✓ Cleared existing data
✓ Created 5 genres
✓ Created 5 publishers
✓ Created 10 authors
✓ Created 5 users
...
✅ Seeding complete!
```

> You can run this command any time you want to reset the database back to its original sample state.

---

### Step 8 — Start the Development Server

```bash
npm run dev
```

You should see:
```
✅ Geek Text API running at http://localhost:3000
   Health check: http://localhost:3000/health
   Books:        http://localhost:3000/api/books
```

The server is now running and listening for requests. Leave this terminal window open while you work — if you close it, the server stops.

---

### Step 9 — Test That It Works

Open your web browser and go to:

- **Health check:** http://localhost:3000/health
  - Should show: `{ "status": "OK", "message": "Geek Text API is running", ... }`

- **All books:** http://localhost:3000/api/books
  - Should show a JSON list of 30 tech books.

- **One book by ISBN:** http://localhost:3000/api/books/isbn/9780132350884
  - Should show the full details for *Clean Code* including ratings and comments.

If you see JSON data in your browser, the setup is complete and working.

> **Tip:** Install the browser extension **JSON Formatter** (Chrome) or **JSONView** (Firefox) to make JSON responses easier to read in the browser.

---

### Step 10 — Switch to Your Feature Branch

Before writing any code, switch to your feature's branch so you don't accidentally work on `main`:

```bash
git checkout Book-Details
```

Replace `Book-Details` with the name of your feature's branch from the [table above](#5-feature-branches--team-ownership).

To confirm which branch you're on:
```bash
git branch
```
The branch with a `*` next to it is the one you're currently on.

---

## 7. Environment Variables (.env file)

| Variable | Example Value | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/geek_text_api?schema=public` | Tells Prisma how to connect to your PostgreSQL database |
| `PORT` | `3000` | The port number the Express server listens on |

**Never commit the `.env` file to GitHub.** It is already listed in `.gitignore` to prevent this.

---

## 8. Available Commands (npm Scripts)

Run all of these from inside the project folder in your terminal.

| Command | What it does |
|---|---|
| `npm install` | Downloads all packages listed in `package.json` into `node_modules/` |
| `npm run dev` | Starts the server in development mode with auto-reload (uses nodemon) |
| `npm start` | Starts the server in production mode (no auto-reload) |
| `npm run prisma:migrate` | Reads `schema.prisma` and applies any new changes to the database |
| `npm run prisma:seed` | Runs `prisma/seed.js` to fill the database with sample data |
| `npx prisma studio` | Opens a visual database browser in your browser at http://localhost:5555 |

> **What is `npx`?** It's a tool that comes with npm. While `npm` installs packages, `npx` lets you *run* a package's command-line tool directly without installing it globally. For example, `npx prisma studio` runs Prisma's built-in GUI tool.

---

## 9. API Endpoints - Feature Documentation

An **endpoint** is a URL + HTTP method combination that the server responds to. Documentation for every feature is listed below:

### Health Check

| Method | URL | Description |
|---|---|---|
| `GET` | `/health` | Confirms the server is running. Returns status `OK`. |

### Book Details - Francisco Sierra

| Method | URL | Description |
|---|---|---|

### Rating and Comments - Guillermo Yepez

| Method | URL | Description |
|---|---|---|
| `GET` | `/api/books/:bookId/ratings/average` | Calculates the strict decimal average rating for a specific book. |
| `GET` | `/api/books/:bookId/ratings` | Retrieves all individual user rating records for a given book. |
| `GET`  | `/api/books/:bookId/comments` | Retrieves a sorted, paginated list of all text reviews/comments left for a book. |
| `POST` | `/api/ratings` | Creates a new rating or updates an existing rating for a user on a 1-5 star scale. |
| `POST` | `/api/comments` | Creates or updates a text-based book review/comment. |

### Shopping Cart

> Implemented on the `Shopping-Cart` feature branch. The endpoints below reflect that branch's implementation.

| Method | URL | Description |
|---|---|---|
| `GET` | `/api/cart/:userId` | Returns the user's cart: every `CartItem` joined with its book, author, and publisher discount, plus computed line totals and a subtotal. Returns `404` if the user doesn't exist, or an empty cart (`items: []`, totals `0`) if they exist but haven't added anything yet. |
| `POST` | `/api/cart/:userId/items` | Adds a book to the user's cart. If the book is already in the cart, its quantity is **incremented** instead of creating a duplicate row. Requires `bookId` in the JSON body; `quantity` defaults to `1` when omitted. Returns `404` if the user or book doesn't exist. |

**`GET /api/cart/:userId` — response shape**

```json
{
  "userId": 1,
  "itemCount": 2,
  "totalQuantity": 3,
  "subtotal": 142.47,
  "items": [
    {
      "cartItemId": 7,
      "bookId": 1,
      "title": "Clean Code",
      "author": "Robert Martin",
      "coverImage": "https://.../clean-code.jpg",
      "quantity": 2,
      "unitPrice": 49.99,
      "discountPercent": 5,
      "discountedUnitPrice": 47.49,
      "lineTotal": 94.98
    }
  ]
}
```

- `unitPrice` is the book's list price; `discountedUnitPrice` applies the book's **publisher** discount (`Publisher.discountPercent`) — the cart, not the book, is where discounts get applied.
- `lineTotal` = `discountedUnitPrice × quantity`, rounded to 2 decimals. `subtotal` is the sum of every item's `lineTotal`.
- `itemCount` is the number of distinct books in the cart (rows); `totalQuantity` is the total copies across all of them.

**`POST /api/cart/:userId/items` — request/response**

```json
// Request body
{ "bookId": 3, "quantity": 2 }

// 201 response
{
  "message": "Book added to cart.",
  "data": { "id": 7, "userId": 1, "bookId": 3, "quantity": 2 }
}
```

- Adding a book that's already in the cart **increments** the existing row's quantity rather than inserting a second one — enforced by the `@@unique([userId, bookId])` constraint on `CartItem` and applied atomically via a Prisma `upsert`.
- There's no stock/inventory check yet: the `Book` model doesn't track available stock, so only a "quantity must be a positive integer" check is applied.
- Removing items or updating an existing item's quantity directly (rather than adding more) isn't implemented yet.

**Error responses (both endpoints)**

| Status | When |
|---|---|
| `400` | `userId` (URL param) or `bookId` / `quantity` (request body) is missing or not a positive integer. |
| `404` | The referenced user or book doesn't exist. |
| `500` | Unexpected database error. |

### Planned Endpoints (Sprint 3+)

| Method | URL | Description |
|---|---|---|
| `GET` | `/api/books/genre/:genre` | Returns all books belonging to the specified genre. |
| `GET` | `/api/books/top-sellers` | Returns the ten highest-selling books. |
| `GET` | `/api/books/rating/:minRating` | Returns books whose average rating is greater than or equal to the specified rating. |
| `GET` | `/api/books/publisher/:publisherId` | Returns books from a specific publisher with the publisher discount applied to the displayed price. |

### Profile Management - Stewart Smith Jr.

| Method | URL | Description |
|---|---|---|
| `POST` | `/api/users` | Creates a new user profile. |
| `GET` | `/api/users` | Retrieves all user profiles. |
| `GET` | `/api/users/:username` | Retrieves the profile information for the specified user. |
| `PUT` | `/api/users/:username` | Updates all profile information for the specified user. |
| `PATCH` | `/api/users/:username/password` | Updates the password for the specified user. |
| `PATCH` | `/api/users/:username/firstName` | Updates the first name for the specified user. |
| `PATCH` | `/api/users/:username/lastName` | Updates the last name for the specified user. |
| `PATCH` | `/api/users/:username/homeAddress` | Updates the home address for the specified user. |
| `PATCH` | `/api/users/:username/role` | Updates the role assigned to the specified user. |
| `POST` | `/api/users/:username/credit-card` | Adds a new credit card to the specified user's account. |
| `GET` | `/api/users/:username/credit-card` | Retrieves all credit cards associated with the specified user. |

| Method | URL | Description |
|---|---|---|

### Shopping Cart - Santiago Suli Ramirez

| Method | URL | Description |
|---|---|---|

### Wishlist Management - Hiram Torres-Marin

| Method | URL | Description |
|---|---|---|
| `POST` | `/api/wishlists` | Creates a new wishlists. |
| `POST` | `/api/wishlists/:wishlistId/books/:bookId` | Adds a book to a wishlist. |
| `GET` | `/api/wishlists/:wishlistId/books` | Views the books in the wishlist. |
| `DELETE` | `/api/wishlists/:wishlistId/books/:bookId/move-to-cart` | Moves a book from the wishlist to the shopping cart and deletes it from the wishlist. |

| Method | URL | Description |
|---|---|---|
| `GET` | `/api/books/genre/:genreId` | Book Browsing — filter by genre |
| `GET` | `/api/books/top-sellers` | Book Browsing — top 10 by copies sold |
| `GET` | `/api/books/rating/:minRating` | Book Browsing — filter by minimum rating |
| `GET` | `/api/books/publisher/:publisherId` | Book Browsing — filter by publisher |
| `GET` | `/api/users/:id` | Profile Management — get user profile |
| `POST` | `/api/users` | Profile Management — create user |
| `POST` | `/api/ratings` | Ratings & Comments — submit a rating |
| `GET` | `/api/wishlists/:userId` | Wishlist Management — get user's wishlists |

---

## 10. Database Overview

The database is named `geek_text_api` and contains the following tables (defined in `prisma/schema.prisma`):

| Table | What it stores |
|---|---|
| `Book` | All books — title, ISBN, price, description, copies sold, etc. |
| `Author` | Author names and biographies |
| `Publisher` | Publisher names and their discount percentages |
| `Genre` | Book categories (e.g. Software Engineering, AI, Cybersecurity) |
| `User` | Registered customer accounts |
| `CreditCard` | Saved payment methods (last 4 digits only — never full card number) |
| `CartItem` | Books a user has added to their shopping cart |
| `Wishlist` | Named wishlists created by users |
| `WishlistItem` | Individual books saved inside a wishlist |
| `Rating` | Star ratings (1–5) submitted by users for specific books |
| `Comment` | Written reviews submitted by users for specific books |

### How Tables Relate to Each Other

```
Genre ──── Book ──── Author
            │
            └── Publisher
            │
            ├── Rating ──── User ──── CreditCard
            │
            ├── Comment ─── User
            │
            ├── CartItem ── User
            │
            └── WishlistItem ── Wishlist ── User
```

Each `Book` belongs to exactly one `Genre`, one `Author`, and one `Publisher`. Each `User` can have many `Rating`s, `Comment`s, `CartItem`s, and `Wishlist`s.

### Viewing the Database Visually

Prisma includes a built-in browser-based GUI called **Prisma Studio** that lets you view and edit data in any table without writing SQL:

```bash
npx prisma studio
```

Then open http://localhost:5555 in your browser.

---

## 11. Git Branching Strategy

### The Golden Rules

1. **Never commit directly to `main`.** The `main` branch only contains stable, reviewed, working code.
2. **Always work on your feature branch.** Every feature has its own branch (see [Section 5](#5-feature-branches--team-ownership)).
3. **Open a Pull Request (PR) when your feature is done.** At least one teammate must review and approve before it can be merged into `main`.

### Daily Workflow

```bash
# 1. Make sure you're on your feature branch
git checkout Book-Details

# 2. Pull the latest changes from GitHub before you start coding
git pull origin Book-Details

# 3. Write your code...

# 4. Check what files you've changed
git status

# 5. Stage the files you want to include in the commit
git add src/controllers/books.controller.js

# 6. Commit with a clear, descriptive message
git commit -m "Add endpoint to create a new book"

# 7. Push your changes up to GitHub
git push origin Book-Details
```

### Keeping Your Branch Up to Date With Main

If new code has been merged into `main` while you were working on your branch, pull those changes into your branch to avoid conflicts later:

```bash
git checkout Book-Details
git merge main
```

---

## 12. Team Working Agreements

These rules were agreed upon by the whole team and apply to everyone equally.

### Communication
- All urgent team updates and coordination happen in the official team communication channel.

### Standup / Weekly Syncs
- Attendance is **required** for both weekly syncs.
- If you cannot attend, post your status update in the team channel **before** the meeting starts.
- Status format: *What did I do since last sync? What will I do next? Is anything blocking me?*

### GitHub Project Board
- Every developer must update the GitHub Project board **immediately** whenever the status of their work changes.
- Move your card: `To Do` → `In Progress` → `In Review` → `Done`.

### Blocker Escalation
- Document any technical blocker immediately in the team channel.
- Assign a specific teammate as the owner to help resolve it — don't leave it unassigned.

### Code Accountability
- Each feature owner is fully responsible for understanding and being able to explain every line of their own implementation during code reviews and the final demo.
- Do not copy-paste code you don't understand.

### Sprint Capacity
- Work effort is estimated in hours.
- Maximum allocation: **8 hours per 2-week sprint** (4 hours per week per person).

---

---

*CEN 4010 — Group 9: GeekText Architects · Florida International University*  
*Last updated: May 2026 — Sprint 2 backend foundation complete (Francisco Sierra)*
