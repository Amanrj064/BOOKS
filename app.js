const express = require('express');
const session = require('express-session');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'supersecretkey', 
  resave: false,
  saveUninitialized: true
}));

const loadBooks = () => JSON.parse(fs.readFileSync('books.json', 'utf-8'));
const saveBooks = (books) => fs.writeFileSync('books.json', JSON.stringify(books, null, 2));

// Home page with search + category filter
app.get('/', (req, res) => {
  let books = loadBooks();
  if (req.query.category) {
    books = books.filter(b => b.category === req.query.category);
  }
  if (req.query.q) {
    books = books.filter(b => b.title.toLowerCase().includes(req.query.q.toLowerCase()));
  }
  res.render('index', { books, session: req.session });
});

// View counter + redirect
app.get('/view/:index', (req, res) => {
  const books = loadBooks();
  const index = parseInt(req.params.index);
  if (!isNaN(index) && books[index]) {
    books[index].views = (books[index].views || 0) + 1;
    saveBooks(books);
    res.redirect(books[index].link);
  } else {
    res.send('Book not found');
  }
});

// Login
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '1234') {
    req.session.isAdmin = true;
    res.redirect('/admin');
  } else {
    res.send('❌ Invalid credentials');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Admin add book
app.get('/admin', (req, res) => {
  if (!req.session.isAdmin) return res.redirect('/login');
  res.render('admin');
});

app.post('/admin', (req, res) => {
  if (!req.session.isAdmin) return res.redirect('/login');
  const books = loadBooks();
  books.push({
    title: req.body.title,
    link: req.body.link,
    description: req.body.description,
    category: req.body.category,
    views: 0
  });
  saveBooks(books);
  res.redirect('/');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
