const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

function loadBooks() {
  if (!fs.existsSync('books.json')) return [];
  return JSON.parse(fs.readFileSync('books.json'));
}

app.get('/', (req, res) => {
  const books = loadBooks();
  res.render('index', { books });
});

app.get('/admin', (req, res) => {
  res.render('admin');
});

app.post('/admin', (req, res) => {
  const books = loadBooks();
  books.push({
    title: req.body.title,
    link: req.body.link,
    description: req.body.description
  });
  fs.writeFileSync('books.json', JSON.stringify(books, null, 2));
  res.redirect('/');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));