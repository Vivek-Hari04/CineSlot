const express = require('express');
const Show = require('../models/Show');

const router = express.Router();

// Create show
router.post('/', async (req, res) => {
  try {
    const show = await Show.create(req.body);
    return res.status(201).json(show);
  } catch (err) {
    console.error('Create show error:', err);
    return res.status(400).json({ message: 'Invalid show data', error: err.message });
  }
});

// Get shows, optionally filter by movie
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.movieId) {
      filter.movie = req.query.movieId;
    }
    const shows = await Show.find(filter).populate('movie').sort({ showDate: 1, startTime: 1 });
    return res.json(shows);
  } catch (err) {
    console.error('Get shows error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get a single show by id
router.get('/:id', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id).populate('movie');
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }
    return res.json(show);
  } catch (err) {
    console.error('Get show error:', err);
    return res.status(400).json({ message: 'Invalid show id' });
  }
});

module.exports = router;

