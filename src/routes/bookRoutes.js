const express = require('express');
const router = express.Router();
const bookService = require('../services/bookService');

// Get all books
router.get('/', async (req, res) => {
    const books = await bookService.getBooks();
    res.json(books);
});

// Get book by ID
router.get('/:id', async (req, res) => {
    const book = await bookService.getBook(req.params.id);
    res.json(book);
});

// Create book
router.post('/', async (req, res) => {
    const id = await bookService.addBook(req.body);
    res.json({ id });
});

// Update book
router.put('/:id', async (req, res) => {
    await bookService.updateBook(req.params.id, req.body);
    res.sendStatus(200);
});

// Delete book
router.delete('/:id', async (req, res) => {
    await bookService.deleteBook(req.params.id);
    res.sendStatus(200);
});

// Additional book-specific routes
router.get('/:id/reviews', async (req, res) => {
    const reviews = await bookService.getBookReviews(req.params.id);
    res.json(reviews);
});

router.post('/:id/reviews', async (req, res) => {
    const reviewId = await bookService.addBookReview(req.params.id, req.body);
    res.json({ id: reviewId });
});

module.exports = router;