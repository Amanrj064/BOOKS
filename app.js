const express = require('express');
const session = require('express-session');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'supersecretkey', // Change this to something strong!
  resave: false,
  saveUninitialized: true
}));

// Helper to load/save books
const loadBooks = () => JSON.parse(fs.readFileSync('books.json', 'utf-8'));
const saveBooks = (books) => fs.writeFileSync('books.json', JSON.stringify(books, null, 2));

// Home page
app.get('/', (req, res) => {
  const books = loadBooks();
  res.render('index', { books, session: req.session });
});

// Login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '1234') { // Change password for security!
    req.session.isAdmin = true;
    res.redirect('/admin');
  } else {
    res.send('❌ Invalid credentials');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Admin form
app.get('/admin', (req, res) => {
  if (!req.session.isAdmin) {
    return res.redirect('/login');
  }
  res.render('admin');
});

// Handle add book
app.post('/admin', (req, res) => {
  if (!req.session.isAdmin) {
    return res.redirect('/login');
  }
  const books = loadBooks();
  books.push({
    title: req.body.title,
    link: req.body.link,
    description: req.body.description
  });
  saveBooks(books);
  res.redirect('/');
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
