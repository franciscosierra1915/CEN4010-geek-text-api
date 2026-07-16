/**
 * @file seed.js
 * @description Database seed script for the Geek Text API.
 *
 * Populates the PostgreSQL database with realistic sample data for local
 * development and testing. Running this script gives every developer on the
 * team an identical, predictable dataset to work against.
 *
 * How to run:
 *   npx prisma db seed          (uses the "prisma.seed" script in package.json)
 *   node prisma/seed.js         (run directly)
 *   npm run prisma:seed         (npm convenience alias)
 *
 * What gets created (in dependency order):
 *   1. Genres        (5)  — book categories
 *   2. Publishers    (5)  — publishing houses, each with a discount percentage
 *   3. Authors       (10) — real tech-book authors with biographies
 *   4. Users         (5)  — test accounts with plaintext passwords (DEV ONLY)
 *   5. Credit Cards  (3)  — stored as last-four-digits only (PCI-safe)
 *   6. Books         (30) — 6 per genre, linked to author/publisher/genre
 *   7. Ratings       (25) — star ratings (1–5) per user/book pair
 *   8. Comments      (20) — written reviews linked to user and book
 *   9. Cart Items    (10) — books currently in users' shopping carts
 *  10. Wishlists      (5) — named lists per user
 *  11. Wishlist Items (15) — books saved to those wishlists
 *
 * ⚠️  SECURITY NOTE: Passwords are stored in plaintext here for development
 *     convenience only. In production, hash passwords with bcrypt before storing.
 *
 * @module prisma/seed
 */

const { PrismaClient } = require('@prisma/client'); // Import the auto-generated Prisma client

/**
 * Shared Prisma instance used for all database operations in this script.
 * @type {import('@prisma/client').PrismaClient}
 */
const prisma = new PrismaClient();

/**
 * @function main
 * @summary  Orchestrates the full seed operation in the correct dependency order.
 * @async
 *
 * Tables with foreign-key dependencies must be cleared in child-first order
 * (children before parents) to avoid constraint violations, and created in
 * parent-first order (parents before children) for the same reason.
 *
 * @returns {Promise<void>}
 */
async function main() {
  console.log('🌱 Seeding Geek Text database...\n');

  // ── Step 1: Clear Existing Data ───────────────────────────────────────────
  // TRUNCATE ... RESTART IDENTITY resets every table's auto-increment sequence
  // back to 1. deleteMany() (plain SQL DELETE) only empties the rows — it
  // leaves the sequence wherever it was, so every reseed pushed ids higher
  // (Publishers became 6-10, then 11-15, ...), breaking any hardcoded id used
  // in Postman requests, demo scripts, or docs. CASCADE also truncates any
  // dependent rows automatically, so listing every table is just documentation.
  await prisma.$executeRaw`
    TRUNCATE TABLE
      "Comment", "Rating", "WishlistItem", "Wishlist", "CartItem", "CreditCard",
      "Book", "User", "Author", "Publisher", "Genre"
    RESTART IDENTITY CASCADE;
  `;
  console.log('✓ Cleared existing data and reset id sequences');

  // ── Step 2: Create Genres ─────────────────────────────────────────────────
  // Genres are top-level categories with no foreign-key dependencies,
  // so they are safe to create first.
  // Created sequentially (not Promise.all) so ids land in this exact order
  // every time. Promise.all fires all five inserts concurrently, and Postgres
  // can commit them in any order — so "Software Engineering = id 1" was never
  // actually guaranteed, even right after a sequence reset.
  const softwareEng            = await prisma.genre.create({ data: { name: 'Software Engineering' } });
  const artificialIntelligence = await prisma.genre.create({ data: { name: 'Artificial Intelligence' } });
  const cybersecurity          = await prisma.genre.create({ data: { name: 'Cybersecurity' } });
  const cloudComputing         = await prisma.genre.create({ data: { name: 'Cloud Computing' } });
  const dataScience            = await prisma.genre.create({ data: { name: 'Data Science' } });
  console.log('✓ Created 5 genres');

  // ── Step 3: Create Publishers ─────────────────────────────────────────────
  // discountPercent stores the publisher-wide discount (e.g. 10 = 10% off).
  // This value is used by the Book Browsing feature when filtering by publisher.
  // Sequential for the same reason as Genres above — this guarantees
  // O'Reilly Media is always publisher id 1, No Starch Press is id 2, etc.,
  // so demo scripts and Postman bodies can safely hardcode publisherId values.
  const oreilly       = await prisma.publisher.create({ data: { name: "O'Reilly Media",       discountPercent: 10 } });
  const noStarch      = await prisma.publisher.create({ data: { name: 'No Starch Press',      discountPercent: 15 } });
  const addisonWesley = await prisma.publisher.create({ data: { name: 'Addison-Wesley',       discountPercent: 5  } });
  const manning       = await prisma.publisher.create({ data: { name: 'Manning Publications', discountPercent: 20 } });
  const packt         = await prisma.publisher.create({ data: { name: 'Packt Publishing',     discountPercent: 25 } });
  console.log('✓ Created 5 publishers');

  // ── Step 4: Create Authors ────────────────────────────────────────────────
  // Author records are independent of books, so they can be created here.
  // Each biography is a short paragraph that appears on the book-detail page.
  // Sequential — same reasoning as Genres/Publishers above. This also fixes
  // the book-linking data below: anything assuming e.g. "Robert Martin = author
  // id 1" now actually holds, instead of depending on Postgres's commit order.
  const robertMartin    = await prisma.author.create({ data: { firstName: 'Robert',  lastName: 'Martin',      biography: 'Known as "Uncle Bob", Robert C. Martin is a software engineer and author of Clean Code and Clean Architecture.' } });
  const martinKleppmann = await prisma.author.create({ data: { firstName: 'Martin',  lastName: 'Kleppmann',   biography: 'Researcher and engineer at Cambridge, author of Designing Data-Intensive Applications.' } });
  const andrewHunt      = await prisma.author.create({ data: { firstName: 'Andrew',  lastName: 'Hunt',        biography: 'Co-author of The Pragmatic Programmer and founding member of the Agile Alliance.' } });
  const davidThomas     = await prisma.author.create({ data: { firstName: 'David',   lastName: 'Thomas',      biography: 'Co-author of The Pragmatic Programmer and advocate for practical software craftsmanship.' } }); // reserved for future use
  const ianGoodfellow   = await prisma.author.create({ data: { firstName: 'Ian',     lastName: 'Goodfellow',  biography: 'Pioneer in deep learning and GANs, former research scientist at OpenAI and Google Brain.' } });
  const andriyBurkov    = await prisma.author.create({ data: { firstName: 'Andriy',  lastName: 'Burkov',      biography: 'Machine learning practitioner and author of The Hundred-Page Machine Learning Book.' } });
  const bruceSchneier   = await prisma.author.create({ data: { firstName: 'Bruce',   lastName: 'Schneier',    biography: 'Internationally renowned security technologist and author of multiple books on cryptography and security.' } });
  const kelseyHightower = await prisma.author.create({ data: { firstName: 'Kelsey',  lastName: 'Hightower',   biography: 'Developer advocate at Google and co-author of Kubernetes: Up and Running.' } });
  const geneKim         = await prisma.author.create({ data: { firstName: 'Gene',    lastName: 'Kim',         biography: 'Researcher and author known for The Phoenix Project and The DevOps Handbook.' } });
  const martinFowler    = await prisma.author.create({ data: { firstName: 'Martin',  lastName: 'Fowler',      biography: 'Chief scientist at Thoughtworks and author of Refactoring and Patterns of Enterprise Application Architecture.' } });
  console.log('✓ Created 10 authors');

  // ── Step 5: Create Users ──────────────────────────────────────────────────
  // Five test accounts — one per developer/feature area — with a shared plaintext
  // password. ⚠️ Replace with bcrypt-hashed passwords before any production deploy.
  // Sequential for the same id-determinism reason as above.
  const alice  = await prisma.user.create({ data: { username: 'alice_dev',  email: 'alice@geektext.com',  password: 'password123', firstName: 'Alice',  lastName: 'Johnson',  homeAddress: '123 Maple St, Miami, FL 33101' } });
  const bob    = await prisma.user.create({ data: { username: 'bob_codes',  email: 'bob@geektext.com',    password: 'password123', firstName: 'Bob',    lastName: 'Williams', homeAddress: '456 Oak Ave, Orlando, FL 32801' } });
  const carlos = await prisma.user.create({ data: { username: 'carlos_ml',  email: 'carlos@geektext.com', password: 'password123', firstName: 'Carlos', lastName: 'Rivera',   homeAddress: '789 Pine Rd, Tampa, FL 33601' } });
  const diana  = await prisma.user.create({ data: { username: 'diana_sec',  email: 'diana@geektext.com',  password: 'password123', firstName: 'Diana',  lastName: 'Chen',     homeAddress: '321 Elm Blvd, Jacksonville, FL 32099' } });
  const evan   = await prisma.user.create({ data: { username: 'evan_cloud', email: 'evan@geektext.com',   password: 'password123', firstName: 'Evan',   lastName: 'Torres',   homeAddress: '654 Cedar Ln, Tallahassee, FL 32301' } });
  console.log('✓ Created 5 users');

  // ── Step 6: Create Credit Cards ───────────────────────────────────────────
  // Only the last four digits of each card number are stored (PCI-DSS compliance).
  // The full card number is NEVER stored in the database.
  await Promise.all([
    prisma.creditCard.create({ data: { userId: alice.id,  cardholderName: 'Alice Johnson',  lastFour: '4242', cardType: 'Visa',       expirationMonth: 12, expirationYear: 2027 } }),
    prisma.creditCard.create({ data: { userId: bob.id,    cardholderName: 'Bob Williams',   lastFour: '5555', cardType: 'Mastercard', expirationMonth: 6,  expirationYear: 2026 } }),
    prisma.creditCard.create({ data: { userId: carlos.id, cardholderName: 'Carlos Rivera',  lastFour: '3782', cardType: 'Amex',       expirationMonth: 9,  expirationYear: 2028 } }),
  ]);
  console.log('✓ Created 3 credit cards');

  // ── Step 7: Create Books ──────────────────────────────────────────────────
  // 30 real tech titles — 6 per genre — each linked to an author, publisher, and genre
  // via their auto-generated integer IDs.
  // Array index comments (e.g. "index 0–5") are referenced later when building
  // ratings, comments, cart items, and wishlist items.
  const bookData = [

    // ── Software Engineering (array indices 0–5) ──────────────────────────
    { isbn: '9780132350884', title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      description: 'A guide to writing clean, readable, and maintainable code using best practices and real-world examples.',
      price: 49.99, yearPublished: 2008, copiesSold: 1250000,
      authorId: robertMartin.id, publisherId: addisonWesley.id, genreId: softwareEng.id },

    { isbn: '9780135957059', title: 'The Pragmatic Programmer: Your Journey to Mastery',
      description: 'Timeless advice on software craftsmanship covering personal responsibility, coding practices, and career development.',
      price: 54.99, yearPublished: 2019, copiesSold: 980000,
      authorId: andrewHunt.id, publisherId: addisonWesley.id, genreId: softwareEng.id },

    { isbn: '9780201485677', title: 'Refactoring: Improving the Design of Existing Code',
      description: 'A disciplined technique for restructuring existing code without changing its external behavior, with a comprehensive catalog of refactoring methods.',
      price: 59.99, yearPublished: 2018, copiesSold: 750000,
      authorId: martinFowler.id, publisherId: addisonWesley.id, genreId: softwareEng.id },

    { isbn: '9780134494166', title: "Clean Architecture: A Craftsman's Guide to Software Structure and Design",
      description: "Robert Martin's definitive guide to building architectures that are easy to understand, develop, and maintain.",
      price: 44.99, yearPublished: 2017, copiesSold: 620000,
      authorId: robertMartin.id, publisherId: addisonWesley.id, genreId: softwareEng.id },

    { isbn: '9780135974445', title: 'The Clean Coder: A Code of Conduct for Professional Programmers',
      description: 'Practical advice on estimation, handling pressure, time management, and collaborative coding.',
      price: 39.99, yearPublished: 2011, copiesSold: 430000,
      authorId: robertMartin.id, publisherId: addisonWesley.id, genreId: softwareEng.id },

    { isbn: '9780321125217', title: 'Domain-Driven Design: Tackling Complexity in the Heart of Software',
      description: 'A framework for organizing software around the domain model, focusing on the core business logic.',
      price: 64.99, yearPublished: 2003, copiesSold: 510000,
      authorId: martinFowler.id, publisherId: addisonWesley.id, genreId: softwareEng.id },

    // ── Artificial Intelligence (array indices 6–11) ───────────────────────
    { isbn: '9780262035613', title: 'Deep Learning',
      description: 'The definitive textbook on deep learning — covering theory, architectures, and applications by three pioneers in the field.',
      price: 79.99, yearPublished: 2016, copiesSold: 890000,
      authorId: ianGoodfellow.id, publisherId: manning.id, genreId: artificialIntelligence.id },

    { isbn: '9781999579517', title: 'The Hundred-Page Machine Learning Book',
      description: 'A concise yet comprehensive overview of machine learning covering core algorithms, neural networks, and practical applications.',
      price: 34.99, yearPublished: 2019, copiesSold: 320000,
      authorId: andriyBurkov.id, publisherId: manning.id, genreId: artificialIntelligence.id },

    { isbn: '9781617296574', title: 'Machine Learning Engineering',
      description: 'A practical guide to deploying and scaling machine learning models in production environments.',
      price: 59.99, yearPublished: 2020, copiesSold: 210000,
      authorId: andriyBurkov.id, publisherId: manning.id, genreId: artificialIntelligence.id },

    { isbn: '9781492032649', title: 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow',
      description: 'Practical tools and techniques for building intelligent systems, from data preprocessing to training production-grade models.',
      price: 69.99, yearPublished: 2022, copiesSold: 760000,
      authorId: ianGoodfellow.id, publisherId: oreilly.id, genreId: artificialIntelligence.id },

    { isbn: '9781800564305', title: 'Python Deep Learning',
      description: 'Build neural networks and deep learning models using Python, TensorFlow, and PyTorch with hands-on projects.',
      price: 44.99, yearPublished: 2021, copiesSold: 180000,
      authorId: andriyBurkov.id, publisherId: packt.id, genreId: artificialIntelligence.id },

    { isbn: '9781492041139', title: 'Natural Language Processing with Transformers',
      description: 'A practical guide to building NLP applications using Hugging Face Transformers, covering BERT, GPT, and more.',
      price: 64.99, yearPublished: 2022, copiesSold: 290000,
      authorId: ianGoodfellow.id, publisherId: oreilly.id, genreId: artificialIntelligence.id },

    // ── Cybersecurity (array indices 12–17) ───────────────────────────────
    { isbn: '9781593278519', title: 'Hacking: The Art of Exploitation',
      description: 'A foundational guide to understanding hacking techniques including shellcode, buffer overflows, and network exploitation.',
      price: 49.99, yearPublished: 2008, copiesSold: 415000,
      authorId: bruceSchneier.id, publisherId: noStarch.id, genreId: cybersecurity.id },

    { isbn: '9781718501188', title: "The Web Application Hacker's Handbook",
      description: 'A comprehensive guide to finding and exploiting vulnerabilities in web applications, from SQL injection to XSS.',
      price: 54.99, yearPublished: 2021, copiesSold: 305000,
      authorId: bruceSchneier.id, publisherId: noStarch.id, genreId: cybersecurity.id },

    { isbn: '9781617294907', title: 'Security Engineering: A Guide to Building Dependable Distributed Systems',
      description: 'A thorough treatment of building secure distributed systems covering cryptography, authentication, and access control.',
      price: 69.99, yearPublished: 2020, copiesSold: 195000,
      authorId: bruceSchneier.id, publisherId: manning.id, genreId: cybersecurity.id },

    { isbn: '9781593276980', title: 'Practical Malware Analysis',
      description: 'A hands-on guide to dissecting malicious software covering static analysis, dynamic analysis, and reverse engineering.',
      price: 59.99, yearPublished: 2012, copiesSold: 380000,
      authorId: bruceSchneier.id, publisherId: noStarch.id, genreId: cybersecurity.id },

    { isbn: '9781718500099', title: 'Bug Bounty Bootcamp: The Guide to Finding and Reporting Web Vulnerabilities',
      description: 'An in-depth guide to hunting for web vulnerabilities and participating in bug bounty programs responsibly.',
      price: 44.99, yearPublished: 2021, copiesSold: 145000,
      authorId: bruceSchneier.id, publisherId: noStarch.id, genreId: cybersecurity.id },

    { isbn: '9781492096313', title: 'Learning Kali Linux: Security Testing, Penetration Testing, and Ethical Hacking',
      description: 'A practical introduction to penetration testing using Kali Linux, covering tools, methodologies, and reporting.',
      price: 54.99, yearPublished: 2022, copiesSold: 220000,
      authorId: bruceSchneier.id, publisherId: oreilly.id, genreId: cybersecurity.id },

    // ── Cloud Computing (array indices 18–23) ─────────────────────────────
    { isbn: '9781492046530', title: 'Kubernetes: Up and Running',
      description: 'A practical guide to deploying, managing, and scaling containerized applications with Kubernetes.',
      price: 59.99, yearPublished: 2022, copiesSold: 520000,
      authorId: kelseyHightower.id, publisherId: oreilly.id, genreId: cloudComputing.id },

    { isbn: '9781950508020', title: 'The Phoenix Project: A Novel About IT, DevOps, and Helping Your Business Win',
      description: 'A business novel that illustrates DevOps principles through the story of an IT manager struggling to save a critical project.',
      price: 29.99, yearPublished: 2018, copiesSold: 1100000,
      authorId: geneKim.id, publisherId: noStarch.id, genreId: cloudComputing.id },

    { isbn: '9781942788003', title: 'The DevOps Handbook: How to Create World-Class Agility, Reliability, and Security',
      description: 'Practical guidance for implementing DevOps practices covering continuous delivery, infrastructure as code, and organizational culture.',
      price: 49.99, yearPublished: 2021, copiesSold: 670000,
      authorId: geneKim.id, publisherId: noStarch.id, genreId: cloudComputing.id },

    { isbn: '9781617295461', title: 'Docker in Practice',
      description: 'Practical techniques for using Docker in real-world development workflows, from building images to orchestrating containers.',
      price: 44.99, yearPublished: 2019, copiesSold: 280000,
      authorId: kelseyHightower.id, publisherId: manning.id, genreId: cloudComputing.id },

    { isbn: '9781492046614', title: 'Terraform: Up and Running',
      description: 'A guide to provisioning and managing cloud infrastructure with Terraform, covering AWS, GCP, and Azure.',
      price: 54.99, yearPublished: 2022, copiesSold: 340000,
      authorId: kelseyHightower.id, publisherId: oreilly.id, genreId: cloudComputing.id },

    { isbn: '9781492076988', title: 'Site Reliability Engineering: How Google Runs Production Systems',
      description: "Google engineers explain how they build, deploy, and maintain large-scale reliable systems using SRE principles.",
      price: 74.99, yearPublished: 2016, copiesSold: 480000,
      authorId: kelseyHightower.id, publisherId: oreilly.id, genreId: cloudComputing.id },

    // ── Data Science (array indices 24–29) ────────────────────────────────
    { isbn: '9781449373320', title: 'Designing Data-Intensive Applications',
      description: 'A deep dive into the architecture of modern data systems covering databases, streams, consistency, and scalability.',
      price: 69.99, yearPublished: 2017, copiesSold: 920000,
      authorId: martinKleppmann.id, publisherId: oreilly.id, genreId: dataScience.id },

    { isbn: '9781491957660', title: 'Python for Data Analysis',
      description: 'A comprehensive guide to data manipulation and analysis in Python using pandas, NumPy, and Jupyter.',
      price: 59.99, yearPublished: 2022, copiesSold: 680000,
      authorId: martinKleppmann.id, publisherId: oreilly.id, genreId: dataScience.id },

    { isbn: '9781617296062', title: 'Data Science Bookcamp',
      description: 'A project-driven introduction to data science using Python, covering probability, statistics, and machine learning through hands-on problems.',
      price: 54.99, yearPublished: 2021, copiesSold: 150000,
      authorId: andriyBurkov.id, publisherId: manning.id, genreId: dataScience.id },

    { isbn: '9781492041140', title: 'SQL for Data Scientists: A Beginner Guide for Building Datasets for Analysis',
      description: 'A practical guide to using SQL for data wrangling, exploratory analysis, and building datasets for machine learning.',
      price: 44.99, yearPublished: 2021, copiesSold: 210000,
      authorId: martinKleppmann.id, publisherId: oreilly.id, genreId: dataScience.id },

    { isbn: '9781800200937', title: 'Data Engineering with Python',
      description: 'Covers tools and techniques for building robust data pipelines with Apache Kafka, Airflow, Spark, and more.',
      price: 49.99, yearPublished: 2020, copiesSold: 175000,
      authorId: martinKleppmann.id, publisherId: packt.id, genreId: dataScience.id },

    { isbn: '9781492072942', title: 'Fundamentals of Data Engineering',
      description: 'A practical guide to the data engineering lifecycle — from ingestion and storage to transformation and serving.',
      price: 64.99, yearPublished: 2022, copiesSold: 290000,
      authorId: andriyBurkov.id, publisherId: oreilly.id, genreId: dataScience.id },
  ];

  // Insert books one at a time (not in parallel) so the `books` array is built
  // in the same order as bookData — array indices are used below to link ratings,
  // comments, cart items, and wishlist items to specific books.
  const books = [];
  for (const b of bookData) {
    const book = await prisma.book.create({ data: b }); // Insert one book row and get back its DB record (with auto-generated id)
    books.push(book);                                   // Keep the returned record so we can reference book.id below
  }
  console.log(`✓ Created ${books.length} books`);

  // ── Step 8: Create Ratings ────────────────────────────────────────────────
  // Each rating links a user to a book with a 1–5 star score.
  // The DB enforces a unique constraint on (userId, bookId) — one rating per user per book.
  // Array indices refer to the `books` array built in the previous step.
  const ratingsData = [
    // Alice's ratings — software engineering and distributed systems enthusiast
    { userId: alice.id,  bookId: books[0].id,  score: 5 },  // Clean Code
    { userId: alice.id,  bookId: books[1].id,  score: 5 },  // The Pragmatic Programmer
    { userId: alice.id,  bookId: books[6].id,  score: 4 },  // Deep Learning
    { userId: alice.id,  bookId: books[18].id, score: 5 },  // Kubernetes: Up and Running
    { userId: alice.id,  bookId: books[24].id, score: 5 },  // Designing Data-Intensive Applications
    // Bob's ratings
    { userId: bob.id,    bookId: books[0].id,  score: 4 },  // Clean Code
    { userId: bob.id,    bookId: books[2].id,  score: 5 },  // Refactoring
    { userId: bob.id,    bookId: books[7].id,  score: 4 },  // The Hundred-Page ML Book
    { userId: bob.id,    bookId: books[19].id, score: 5 },  // The Phoenix Project
    { userId: bob.id,    bookId: books[25].id, score: 4 },  // Python for Data Analysis
    // Carlos's ratings — ML focus
    { userId: carlos.id, bookId: books[6].id,  score: 5 },  // Deep Learning
    { userId: carlos.id, bookId: books[7].id,  score: 5 },  // The Hundred-Page ML Book
    { userId: carlos.id, bookId: books[8].id,  score: 3 },  // Machine Learning Engineering
    { userId: carlos.id, bookId: books[24].id, score: 5 },  // Designing Data-Intensive Applications
    { userId: carlos.id, bookId: books[26].id, score: 4 },  // Data Science Bookcamp
    // Diana's ratings — cybersecurity and DevOps focus
    { userId: diana.id,  bookId: books[12].id, score: 5 },  // Hacking: The Art of Exploitation
    { userId: diana.id,  bookId: books[13].id, score: 4 },  // The Web Application Hacker's Handbook
    { userId: diana.id,  bookId: books[15].id, score: 5 },  // Practical Malware Analysis
    { userId: diana.id,  bookId: books[18].id, score: 4 },  // Kubernetes: Up and Running
    { userId: diana.id,  bookId: books[20].id, score: 5 },  // The DevOps Handbook
    // Evan's ratings — cloud-native and infrastructure focus
    { userId: evan.id,   bookId: books[18].id, score: 5 },  // Kubernetes: Up and Running
    { userId: evan.id,   bookId: books[20].id, score: 4 },  // The DevOps Handbook
    { userId: evan.id,   bookId: books[21].id, score: 5 },  // Docker in Practice
    { userId: evan.id,   bookId: books[22].id, score: 4 },  // Terraform: Up and Running
    { userId: evan.id,   bookId: books[3].id,  score: 5 },  // Clean Architecture
  ];

  // Insert ratings sequentially — Prisma does not support bulk insert in one call here
  for (const r of ratingsData) {
    await prisma.rating.create({ data: r });
  }
  console.log(`✓ Created ${ratingsData.length} ratings`);

  // ── Step 9: Create Comments ───────────────────────────────────────────────
  // Written book reviews linked to the user who wrote them and the book they reviewed.
  // Unlike ratings, a user can technically leave multiple comments on the same book
  // (no unique constraint on userId + bookId for Comment), but seed data has one per pair.
  const commentsData = [
    { userId: alice.id,  bookId: books[0].id,  text: 'Changed the way I think about writing code. Every developer should read this.' },
    { userId: bob.id,    bookId: books[0].id,  text: 'Excellent principles, though some examples feel dated. The core ideas are timeless.' },
    { userId: carlos.id, bookId: books[6].id,  text: 'The definitive deep learning reference. Dense but worth every page.' },
    { userId: diana.id,  bookId: books[12].id, text: 'Best introduction to exploitation techniques I have found. The shellcode sections are brilliant.' },
    { userId: evan.id,   bookId: books[18].id, text: 'Kubernetes can be intimidating, but this book makes it accessible step by step.' },
    { userId: alice.id,  bookId: books[24].id, text: 'Kleppmann covers distributed systems in a way that is rigorous but never overwhelming. A must-read.' },
    { userId: bob.id,    bookId: books[1].id,  text: 'Timeless advice that applies to any language or framework. A career-essential read.' },
    { userId: carlos.id, bookId: books[7].id,  text: 'Perfect for someone who wants a solid ML foundation without drowning in math.' },
    { userId: diana.id,  bookId: books[13].id, text: 'Extremely practical. I use the techniques covered here regularly in my security work.' },
    { userId: evan.id,   bookId: books[19].id, text: 'The Phoenix Project is the best DevOps teaching story I have ever read. Highly recommended.' },
    { userId: alice.id,  bookId: books[2].id,  text: 'Fowler walks you through real refactoring decisions. The catalog alone is worth the price.' },
    { userId: bob.id,    bookId: books[25].id, text: 'pandas and NumPy explained clearly with real datasets. Great daily reference.' },
    { userId: carlos.id, bookId: books[8].id,  text: 'A solid bridge between ML theory and production deployment.' },
    { userId: diana.id,  bookId: books[15].id, text: 'Practical Malware Analysis is required reading for any malware analyst. Comprehensive.' },
    { userId: evan.id,   bookId: books[20].id, text: 'The DevOps Handbook gave our team a shared vocabulary and concrete practices to adopt.' },
    { userId: alice.id,  bookId: books[3].id,  text: 'Excellent companion to Clean Code. The boundary and plugin architecture sections are gold.' },
    { userId: bob.id,    bookId: books[22].id, text: 'Terraform transformed how our team manages infrastructure. This book gets you there fast.' },
    { userId: carlos.id, bookId: books[26].id, text: 'Great project-based approach to learning data science. Keeps the theory grounded.' },
    { userId: diana.id,  bookId: books[16].id, text: 'An honest look at the bug bounty process. Realistic expectations and great methodology tips.' },
    { userId: evan.id,   bookId: books[21].id, text: 'Docker in Practice covers real scenarios you will actually face, not just toy examples.' },
  ];

  for (const c of commentsData) {
    await prisma.comment.create({ data: c });
  }
  console.log(`✓ Created ${commentsData.length} comments`);

  // ── Step 10: Create Shopping Cart Items ───────────────────────────────────
  // Each CartItem represents a book that a user has added to their cart but not yet purchased.
  // The DB enforces a unique constraint on (userId, bookId) — one cart entry per book per user.
  // quantity > 1 means the user wants multiple copies of that book.
  const cartData = [
    { userId: alice.id,  bookId: books[5].id,  quantity: 1 }, // Alice wants Domain-Driven Design
    { userId: alice.id,  bookId: books[9].id,  quantity: 2 }, // Alice wants 2 copies of Hands-On ML
    { userId: bob.id,    bookId: books[14].id, quantity: 1 }, // Bob wants Security Engineering
    { userId: bob.id,    bookId: books[22].id, quantity: 1 }, // Bob wants Terraform: Up and Running
    { userId: carlos.id, bookId: books[10].id, quantity: 1 }, // Carlos wants Python Deep Learning
    { userId: diana.id,  bookId: books[17].id, quantity: 1 }, // Diana wants Learning Kali Linux
    { userId: diana.id,  bookId: books[23].id, quantity: 1 }, // Diana wants Site Reliability Engineering
    { userId: evan.id,   bookId: books[27].id, quantity: 1 }, // Evan wants SQL for Data Scientists
    { userId: evan.id,   bookId: books[4].id,  quantity: 1 }, // Evan wants The Clean Coder
    { userId: carlos.id, bookId: books[29].id, quantity: 2 }, // Carlos wants 2 copies of Fundamentals of Data Engineering
  ];

  for (const c of cartData) {
    await prisma.cartItem.create({ data: c });
  }
  console.log(`✓ Created ${cartData.length} cart items`);

  // ── Step 11: Create Wishlists and Wishlist Items ───────────────────────────
  // Each user gets one named wishlist, and each wishlist gets three book entries.
  // The DB enforces: no two wishlists for the same user can share a name,
  // and no book can appear twice in the same wishlist.

  // Create one wishlist per user, named after their reading focus
  const aliceWishlist  = await prisma.wishlist.create({ data: { userId: alice.id,  name: 'Backend Engineering Reads' } });
  const bobWishlist    = await prisma.wishlist.create({ data: { userId: bob.id,    name: 'DevOps Must-Haves' } });
  const carlosWishlist = await prisma.wishlist.create({ data: { userId: carlos.id, name: 'AI Reading List' } });
  const dianaWishlist  = await prisma.wishlist.create({ data: { userId: diana.id,  name: 'Security Arsenal' } });
  const evanWishlist   = await prisma.wishlist.create({ data: { userId: evan.id,   name: 'Cloud Architecture' } });

  // Create wishlist items — 3 books per wishlist (15 total)
  const wishlistItemsData = [
    // Alice's backend engineering wishlist
    { wishlistId: aliceWishlist.id,  bookId: books[0].id  },  // Clean Code
    { wishlistId: aliceWishlist.id,  bookId: books[24].id },  // Designing Data-Intensive Applications
    { wishlistId: aliceWishlist.id,  bookId: books[2].id  },  // Refactoring
    // Bob's DevOps wishlist
    { wishlistId: bobWishlist.id,    bookId: books[19].id },  // The Phoenix Project
    { wishlistId: bobWishlist.id,    bookId: books[20].id },  // The DevOps Handbook
    { wishlistId: bobWishlist.id,    bookId: books[21].id },  // Docker in Practice
    // Carlos's AI wishlist
    { wishlistId: carlosWishlist.id, bookId: books[6].id  },  // Deep Learning
    { wishlistId: carlosWishlist.id, bookId: books[7].id  },  // The Hundred-Page ML Book
    { wishlistId: carlosWishlist.id, bookId: books[11].id },  // Natural Language Processing with Transformers
    // Diana's security wishlist
    { wishlistId: dianaWishlist.id,  bookId: books[12].id },  // Hacking: The Art of Exploitation
    { wishlistId: dianaWishlist.id,  bookId: books[13].id },  // The Web Application Hacker's Handbook
    { wishlistId: dianaWishlist.id,  bookId: books[16].id },  // Bug Bounty Bootcamp
    // Evan's cloud architecture wishlist
    { wishlistId: evanWishlist.id,   bookId: books[18].id },  // Kubernetes: Up and Running
    { wishlistId: evanWishlist.id,   bookId: books[22].id },  // Terraform: Up and Running
    { wishlistId: evanWishlist.id,   bookId: books[23].id },  // Site Reliability Engineering
  ];

  for (const w of wishlistItemsData) {
    await prisma.wishlistItem.create({ data: w });
  }
  console.log(`✓ Created 5 wishlists with ${wishlistItemsData.length} items`);

  // ── Final Summary ─────────────────────────────────────────────────────────
  // Print a structured summary so the developer can confirm every record was created.
  console.log('\n✅ Seeding complete! Summary:');
  console.log('   Genres:         5');
  console.log('   Publishers:     5');
  console.log('   Authors:       10');
  console.log('   Users:          5');
  console.log('   Credit Cards:   3');
  console.log('   Books:         30');
  console.log(`   Ratings:       ${ratingsData.length}`);
  console.log(`   Comments:      ${commentsData.length}`);
  console.log(`   Cart Items:    ${cartData.length}`);
  console.log('   Wishlists:      5');
  console.log(`   Wishlist Items:${wishlistItemsData.length}`);
}

// ── Script Entry Point ────────────────────────────────────────────────────────

/**
 * Execute main() and handle the promise outcome:
 *   - On success: Prisma disconnects gracefully and the process exits normally.
 *   - On failure: The error is printed, Prisma disconnects, and the process
 *                 exits with code 1 so CI/CD pipelines detect the failure.
 */
main()
  .catch((e) => {
    console.error('❌ Seed failed:', e); // Print the full error so developers can diagnose the problem
    process.exit(1);                     // Non-zero exit code signals failure to npm/npx/CI
  })
  .finally(async () => {
    await prisma.$disconnect(); // Always close the database connection pool on exit (success or failure)
  });
