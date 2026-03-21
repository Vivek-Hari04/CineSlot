const express = require('express');
const Show = require('../models/Show');

const router = express.Router();

const checkAndCompleteShow = async (show) => {
  if (show.status === 'scheduled') {
    const now = new Date();
    const showDateObj = new Date(show.showDate);
    if (!isNaN(showDateObj.getTime()) && show.startTime) {
      try {
        const parts = show.startTime.split(' ');
        if (parts.length >= 2) {
          const time = parts[0];
          const modifier = parts[1];
          let [hours, minutes] = time.split(':');
          hours = parseInt(hours, 10);
          if (hours === 12) hours = 0;
          if (modifier && modifier.toUpperCase() === 'PM') hours += 12;
          showDateObj.setHours(hours, parseInt(minutes, 10), 0, 0);
          
          if (now > showDateObj) {
            show.status = 'completed';
            await show.save();
          }
        }
      } catch (e) {
        console.error('Error parsing show time:', e);
      }
    }
  }
  return show;
};

// Cleanup old completed shows
router.delete('/cleanup/expired', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today (midnight)
    
    const result = await Show.deleteMany({
      status: 'completed',
      showDate: { $lt: today }
    });
    
    return res.json({ message: 'Cleanup successful', count: result.deletedCount });
  } catch (err) {
    console.error('Cleanup error:', err);
    return res.status(500).json({ message: 'Server error during cleanup' });
  }
});

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
    
    const updatedShows = await Promise.all(shows.map(show => checkAndCompleteShow(show)));
    
    return res.json(updatedShows);
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
    
    const updatedShow = await checkAndCompleteShow(show);
    
    return res.json(updatedShow);
  } catch (err) {
    console.error('Get show error:', err);
    return res.status(400).json({ message: 'Invalid show id' });
  }
});

// Update a show
router.put('/:id', async (req, res) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }
    return res.json(show);
  } catch (err) {
    console.error('Update show error:', err);
    return res.status(400).json({ message: 'Error updating show' });
  }
});

// Delete a show
router.delete('/:id', async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }
    return res.json({ message: 'Show deleted successfully' });
  } catch (err) {
    console.error('Delete show error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

