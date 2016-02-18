var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var Promise = require('bluebird');
var helpers = require('../lib/helpers');

function Authors() {
  return knex('authors');
}

function Books() {
  return knex('books');
}

function Authors_Books() {
  return knex('authors_books');
}


router.get('/', function(req, res, next) {
  // get all authors from Authors
  // using Promise.all map over the array of authors
  // for each author, get author books
  // add a property to each author object that is an array of its book objects
  // pass an array of authors to the view using locals

});

router.get('/new', function(req, res, next) {
  Books().select().then(function (books) {
    res.render('authors/new', {books: books});
  })
});

router.post('/', function (req, res, next) {
  var bookIds = req.body.book_ids.split(",");
  delete req.body.book_ids;
  Authors().returning('id').insert(req.body).then(function (id) {
    helpers.insertIntoAuthorsBooks(bookIds, Authors_Books, id[0]).then(function () {
      res.redirect('/authors');
    })
  })
});

router.get('/:id/delete', function (req, res, next) {
  Authors().where('id', req.params.id).first().then(function (author) {
    helpers.getAuthorBooks(author).then(function (authorBooks) {
      Books().select().then(function (books) {
        res.render('authors/delete', {author: author, author_books: authorBooks, books: books });
      })
    })
  })
})

router.post('/:id/delete', function (req, res, next) {
  Promise.all([
    Authors().where('id', req.params.id).del(),
    Authors_Books().where('author_id', req.params.id).del()
  ]).then(function (results) {
    res.redirect('/authors')
  })
})

router.get('/:id/edit', function (req, res, next) {
  // find the author in Authors
  // get all associated records from Authors_Books
  // using Promise.all map over the array of records
  // return an array of author books from Books
  // pass array of author books to the view using locals
})

router.post('/:id', function (req, res, next) {
  var bookIds = req.body.book_ids.split(",");
  delete req.body.book_ids;
  Authors().returning('id').where('id', req.params.id).update(req.body).then(function (id) {
    id = id[0];
    helpers.insertIntoAuthorsBooks(bookIds, id).then(function () {
    res.redirect('/authors');
    });
  })
})

router.get('/:id', function (req, res, next) {
  Authors().where('id', req.params.id).first().then(function (author) {
    Authors_Books().where('author_id', author.id).then(function (results) {
      Promise.all(results.map(function (result) {
          return Books().where('id', result.book_id).first();
      }))
      .then(function (books) {
        res.render('authors/show', {author: author, books: books})
      })
    })
  })

  // find the author in Authors √
  // get all associated records from Authors_Books √
  // using Promise.all map over the array of records √
  // return an array of author books from Books √
  // pass array of author books to the view using locals √
})

module.exports = router;
