var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var helpers = require('../lib/helpers');
var Promise = require('bluebird');

function Books() {
  return knex('books');
}

function Authors_Books() {
  return knex('authors_books');
}

function Authors() {
  return knex('authors');
}

router.get('/', function(req, res, next) {
  Books().select().then(function (books) {
    Promise.all(books.map(function (book) {
      return helpers.getBookAuthors(book).then(function (authors) {
        book.authors = authors;
        return book;
      });
    }))
    .then(function (books) {
      res.render('books/index', {books: books})
    })
  })
  // get all books from Books
  // using Promise.all map over the array of books
  // for each book, get book authors
  // add a property to each book object that is an array of its author objects
  // pass an array of authors to the view using locals
});

router.get('/new', function(req, res, next) {
  res.render('books/new');
});

router.post('/', function (req, res, next) {
  var errors = [];
  if(!req.body.title.trim()){errors.push("Title cannot be blank")}
  if(!req.body.genre.trim()){errors.push("Genre cannot be blank")}
  if(!req.body.cover_url.trim()){errors.push("Cover image cannot be blank")}
  if(!req.body.description.trim()){errors.push("Description cannot be blank")}
  if(errors.length){
    res.render('books/new', { book: req.body, errors: errors })
  } else {
    Books().insert(req.body).then(function (results) {
        res.redirect('/');
    })
  }
})

router.get('/:id/delete', function(req, res, next) {
  Books().where('id', req.params.id).first().then(function (book) {
    Authors_Books().where('book_id', book.id).then(function (results) {
      Promise.all(results.map(function (result) {
        return Authors().where('id', result.author_id).first();
      }))
      .then(function (authors) {
        res.render('books/delete', {book: book, authors, authors})
      })
    })
  })


  // find the book in Books √
  // get all associated records from Authors_Books √
  // using Promise.all map over the array of records √
  // return an array of book authors √
  // pass array of book authors to the view using locals √
});

router.post('/:id/delete', function(req, res, next) {
  Books().where('id', req.params.id).del().then(function (book) {
    res.redirect('/books');
  })
});

router.get('/:id/edit', function(req, res, next) {
  Books().where('id', req.params.id).first().then(function (book) {
    res.render('books/edit', {book: book});
  })
});

router.get('/:id', function(req, res, next) {
  Books().where('id', req.params.id).first().then(function (book) {
    Authors_Books().where('book_id', book.id).then(function (results) {
      Promise.all(results.map(function (result) {
        return Authors().where('id', result.author_id).first();
      }))
      .then(function (authors) {
        res.render('books/show', {book: book, authors: authors})
      })
    })
  })

  // find the book in Books √
  // get all associated records from Authors_Books √
  // using Promise.all map over the array of records √
  // return an array of book authors √
  // pass array of book authors to the view using locals √
});

router.post('/:id', function(req, res, next) {
  var errors = [];
  if(!req.body.title.trim()){errors.push("Title cannot be blank")}
  if(!req.body.genre.trim()){errors.push("Genre cannot be blank")}
  if(!req.body.cover_url.trim()){errors.push("Cover image cannot be blank")}
  if(!req.body.description.trim()){errors.push("Description cannot be blank")}
  if(errors.length){
    res.render('books/edit', { book: req.body, errors: errors })
  } else {
    Books().where('id', req.params.id).update(req.body).then(function (results) {
      res.redirect('/');
    })
  }
});

module.exports = router;
