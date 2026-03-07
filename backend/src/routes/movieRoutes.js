const express = require('express');
const Movie = require('../models/Movie');

const router = express.Router();

// Create movie (for now, no auth guard)
router.post('/', async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    return res.status(201).json(movie);
  } catch (err) {
    console.error('Create movie error:', err);
    return res.status(400).json({ message: 'Invalid movie data', error: err.message });
  }
});

// Get all movies
router.get('/', async (_req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    return res.json(movies);
  } catch (err) {
    console.error('Get movies error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get single movie
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    return res.json(movie);
  } catch (err) {
    console.error('Get movie error:', err);
    return res.status(400).json({ message: 'Invalid movie id' });
  }
});

module.exports = router;

