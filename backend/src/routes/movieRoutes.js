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

router.put("/:id", async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedMovie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);

    if (!deletedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json({ message: "Movie deleted successfully", deletedMovie });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

