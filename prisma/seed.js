// prisma/seed.js
// Geek Text API — Database Seed
// Populates the database with realistic tech-book data for development and testing.
// Run with: npx prisma db seed

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Geek Text database...\n');

  // ─────────────────────────────────────────────
  //  CLEAR EXISTING DATA (order matters — children before parents)
  // ─────────────────────────────────────────────
  await prisma.comment.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.creditCard.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();
  await prisma.author.deleteMany();
  await prisma.publisher.deleteMany();
  await prisma.genre.deleteMany();
  console.log('✓ Cleared existing data');

  // ─────────────────────────────────────────────
  //  GENRES
  // ─────────────────────────────────────────────
  const [
    softwareEng,
    artificialIntelligence,
    cybersecurity,
    cloudComputing,
    dataScience,
  ] = await Promise.all([
    prisma.genre.create({ data: { name: 'Software Engineering' } }),
    prisma.genre.create({ data: { name: 'Artificial Intelligence' } }),
    prisma.genre.create({ data: { name: 'Cybersecurity' } }),
    prisma.genre.create({ data: { name: 'Cloud Computing' } }),
    prisma.genre.create({ data: { name: 'Data Science' } }),
  ]);
  console.log('✓ Created 5 genres');

  // ─────────────────────────────────────────────
  //  PUBLISHERS  (discountPercent = % off cover price)
  // ─────────────────────────────────────────────
  const [oreilly, noStarch, addisonWesley, manning, packt] = await Promise.all([
    prisma.publisher.create({ data: { name: "O'Reilly Media",       discountPercent: 10 } }),
    prisma.publisher.create({ data: { name: 'No Starch Press',      discountPercent: 15 } }),
    prisma.publisher.create({ data: { name: 'Addison-Wesley',       discountPercent: 5  } }),
    prisma.publisher.create({ data: { name: 'Manning Publications', discountPercent: 20 } }),
    prisma.publisher.create({ data: { name: 'Packt Publishing',     discountPercent: 25 } }),
  ]);
  console.log('✓ Created 5 publishers');

  // ─────────────────────────────────────────────
  //  AUTHORS
  // ─────────────────────────────────────────────
  const [
    robertMartin,
    martinKleppmann,
    andrewHunt,
    davidThomas,
    ianGoodfellow,
    andriyBurkov,
    bruceSchneier,
    kelseyHightower,
    geneKim,
    martinFowler,
  ] = await Promise.all([
    prisma.author.create({ data: { firstName: 'Robert',  lastName: 'Martin',      biography: 'Known as "Uncle Bob", Robert C. Martin is a software engineer and author of Clean Code and Clean Architecture.' } }),
    prisma.author.create({ data: { firstName: 'Martin',  lastName: 'Kleppmann',   biography: 'Researcher and engineer at Cambridge, author of Designing Data-Intensive Applications.' } }),
    prisma.author.create({ data: { firstName: 'Andrew',  lastName: 'Hunt',        biography: 'Co-author of The Pragmatic Programmer and founding member of the Agile Alliance.' } }),
    prisma.author.create({ data: { firstName: 'David',   lastName: 'Thomas',      biography: 'Co-author of The Pragmatic Programmer and advocate for practical software craftsmanship.' } }),
    prisma.author.create({ data: { firstName: 'Ian',     lastName: 'Goodfellow',  biography: 'Pioneer in deep learning and GANs, former research scientist at OpenAI and Google Brain.' } }),
    prisma.author.create({ data: { firstName: 'Andriy',  lastName: 'Burkov',      biography: 'Machine learning practitioner and author of The Hundred-Page Machine Learning Book.' } }),
    prisma.author.create({ data: { firstName: 'Bruce',   lastName: 'Schneier',    biography: 'Internationally renowned security technologist and author of multiple books on cryptography and security.' } }),
    prisma.author.create({ data: { firstName: 'Kelsey',  lastName: 'Hightower',   biography: 'Developer advocate at Google and co-author of Kubernetes: Up and Running.' } }),
    prisma.author.create({ data: { firstName: 'Gene',    lastName: 'Kim',         biography: 'Researcher and author known for The Phoenix Project and The DevOps Handbook.' } }),
    prisma.author.create({ data: { firstName: 'Martin',  lastName: 'Fowler',      biography: 'Chief scientist at Thoughtworks and author of Refactoring and Patterns of Enterprise Application Architecture.' } }),
  ]);
  console.log('✓ Created 10 authors');

  // ─────────────────────────────────────────────
  //  USERS  (passwords are plaintext for dev only — use bcrypt in production)
  // ─────────────────────────────────────────────
  const [alice, bob, carlos, diana, evan] = await Promise.all([
    prisma.user.create({ data: { username: 'alice_dev',  email: 'alice@geektext.com',  password: 'password123', firstName: 'Alice',  lastName: 'Johnson',  homeAddress: '123 Maple St, Miami, FL 33101' } }),
    prisma.user.create({ data: { username: 'bob_codes',  email: 'bob@geektext.com',    password: 'password123', firstName: 'Bob',    lastName: 'Williams', homeAddress: '456 Oak Ave, Orlando, FL 32801' } }),
    prisma.user.create({ data: { username: 'carlos_ml',  email: 'carlos@geektext.com', password: 'password123', firstName: 'Carlos', lastName: 'Rivera',   homeAddress: '789 Pine Rd, Tampa, FL 33601' } }),
    prisma.user.create({ data: { username: 'diana_sec',  email: 'diana@geektext.com',  password: 'password123', firstName: 'Diana',  lastName: 'Chen',     homeAddress: '321 Elm Blvd, Jacksonville, FL 32099' } }),
    prisma.user.create({ data: { username: 'evan_cloud', email: 'evan@geektext.com',   password: 'password123', firstName: 'Evan',   lastName: 'Torres',   homeAddress: '654 Cedar Ln, Tallahassee, FL 32301' } }),
  ]);
  console.log('✓ Created 5 users');

  // ─────────────────────────────────────────────
  //  CREDIT CARDS  (last four digits only — never store full card numbers)
  // ─────────────────────────────────────────────
  await Promise.all([
    prisma.creditCard.create({ data: { userId: alice.id,  cardholderName: 'Alice Johnson',  lastFour: '4242', cardType: 'Visa',       expirationMonth: 12, expirationYear: 2027 } }),
    prisma.creditCard.create({ data: { userId: bob.id,    cardholderName: 'Bob Williams',   lastFour: '5555', cardType: 'Mastercard', expirationMonth: 6,  expirationYear: 2026 } }),
    prisma.creditCard.create({ data: { userId: carlos.id, cardholderName: 'Carlos Rivera',  lastFour: '3782', cardType: 'Amex',       expirationMonth: 9,  expirationYear: 2028 } }),
  ]);
  console.log('✓ Created 3 credit cards');

  // ─────────────────────────────────────────────
  //  BOOKS  (30 tech titles across all 5 genres)
  // ─────────────────────────────────────────────
  const bookData = [
    // ── Software Engineering (index 0–5) ─────────────────────────────────
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

    // ── Artificial Intelligence (index 6–11) ─────────────────────────────
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

    // ── Cybersecurity (index 12–17) ───────────────────────────────────────
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

    // ── Cloud Computing (index 18–23) ─────────────────────────────────────
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

    // ── Data Science (index 24–29) ────────────────────────────────────────
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

  const books = [];
  for (const b of bookData) {
    const book = await prisma.book.create({ data: b });
    books.push(book);
  }
  console.log(`✓ Created ${books.length} books`);

  // ─────────────────────────────────────────────
  //  RATINGS  (25 ratings across all users and books)
  // ─────────────────────────────────────────────
  const ratingsData = [
    { userId: alice.id,  bookId: books[0].id,  score: 5 },
    { userId: alice.id,  bookId: books[1].id,  score: 5 },
    { userId: alice.id,  bookId: books[6].id,  score: 4 },
    { userId: alice.id,  bookId: books[18].id, score: 5 },
    { userId: alice.id,  bookId: books[24].id, score: 5 },
    { userId: bob.id,    bookId: books[0].id,  score: 4 },
    { userId: bob.id,    bookId: books[2].id,  score: 5 },
    { userId: bob.id,    bookId: books[7].id,  score: 4 },
    { userId: bob.id,    bookId: books[19].id, score: 5 },
    { userId: bob.id,    bookId: books[25].id, score: 4 },
    { userId: carlos.id, bookId: books[6].id,  score: 5 },
    { userId: carlos.id, bookId: books[7].id,  score: 5 },
    { userId: carlos.id, bookId: books[8].id,  score: 3 },
    { userId: carlos.id, bookId: books[24].id, score: 5 },
    { userId: carlos.id, bookId: books[26].id, score: 4 },
    { userId: diana.id,  bookId: books[12].id, score: 5 },
    { userId: diana.id,  bookId: books[13].id, score: 4 },
    { userId: diana.id,  bookId: books[15].id, score: 5 },
    { userId: diana.id,  bookId: books[18].id, score: 4 },
    { userId: diana.id,  bookId: books[20].id, score: 5 },
    { userId: evan.id,   bookId: books[18].id, score: 5 },
    { userId: evan.id,   bookId: books[20].id, score: 4 },
    { userId: evan.id,   bookId: books[21].id, score: 5 },
    { userId: evan.id,   bookId: books[22].id, score: 4 },
    { userId: evan.id,   bookId: books[3].id,  score: 5 },
  ];
  for (const r of ratingsData) {
    await prisma.rating.create({ data: r });
  }
  console.log(`✓ Created ${ratingsData.length} ratings`);

  // ─────────────────────────────────────────────
  //  COMMENTS  (20 comments)
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  //  SHOPPING CART ITEMS  (10 items)
  // ─────────────────────────────────────────────
  const cartData = [
    { userId: alice.id,  bookId: books[5].id,  quantity: 1 },
    { userId: alice.id,  bookId: books[9].id,  quantity: 2 },
    { userId: bob.id,    bookId: books[14].id, quantity: 1 },
    { userId: bob.id,    bookId: books[22].id, quantity: 1 },
    { userId: carlos.id, bookId: books[10].id, quantity: 1 },
    { userId: diana.id,  bookId: books[17].id, quantity: 1 },
    { userId: diana.id,  bookId: books[23].id, quantity: 1 },
    { userId: evan.id,   bookId: books[27].id, quantity: 1 },
    { userId: evan.id,   bookId: books[4].id,  quantity: 1 },
    { userId: carlos.id, bookId: books[29].id, quantity: 2 },
  ];
  for (const c of cartData) {
    await prisma.cartItem.create({ data: c });
  }
  console.log(`✓ Created ${cartData.length} cart items`);

  // ─────────────────────────────────────────────
  //  WISHLISTS & WISHLIST ITEMS  (5 wishlists, 15 items)
  // ─────────────────────────────────────────────
  const aliceWishlist   = await prisma.wishlist.create({ data: { userId: alice.id,  name: 'Backend Engineering Reads' } });
  const bobWishlist     = await prisma.wishlist.create({ data: { userId: bob.id,    name: 'DevOps Must-Haves' } });
  const carlosWishlist  = await prisma.wishlist.create({ data: { userId: carlos.id, name: 'AI Reading List' } });
  const dianaWishlist   = await prisma.wishlist.create({ data: { userId: diana.id,  name: 'Security Arsenal' } });
  const evanWishlist    = await prisma.wishlist.create({ data: { userId: evan.id,   name: 'Cloud Architecture' } });

  const wishlistItemsData = [
    { wishlistId: aliceWishlist.id,  bookId: books[0].id  },
    { wishlistId: aliceWishlist.id,  bookId: books[24].id },
    { wishlistId: aliceWishlist.id,  bookId: books[2].id  },
    { wishlistId: bobWishlist.id,    bookId: books[19].id },
    { wishlistId: bobWishlist.id,    bookId: books[20].id },
    { wishlistId: bobWishlist.id,    bookId: books[21].id },
    { wishlistId: carlosWishlist.id, bookId: books[6].id  },
    { wishlistId: carlosWishlist.id, bookId: books[7].id  },
    { wishlistId: carlosWishlist.id, bookId: books[11].id },
    { wishlistId: dianaWishlist.id,  bookId: books[12].id },
    { wishlistId: dianaWishlist.id,  bookId: books[13].id },
    { wishlistId: dianaWishlist.id,  bookId: books[16].id },
    { wishlistId: evanWishlist.id,   bookId: books[18].id },
    { wishlistId: evanWishlist.id,   bookId: books[22].id },
    { wishlistId: evanWishlist.id,   bookId: books[23].id },
  ];
  for (const w of wishlistItemsData) {
    await prisma.wishlistItem.create({ data: w });
  }
  console.log(`✓ Created 5 wishlists with ${wishlistItemsData.length} items`);

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

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
