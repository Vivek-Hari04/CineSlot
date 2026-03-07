const express = require('express');
const Show = require('../models/Show');
const Booking = require('../models/Booking');

const router = express.Router();

// Create booking
router.post('/', async (req, res) => {
  try {
    const { userId, showId, seats, totalAmount, bookingDate } = req.body;

    if (!userId || !showId || !Array.isArray(seats) || seats.length === 0) {
      return res
        .status(400)
        .json({ message: 'userId, showId and at least one seat are required' });
    }

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    // Check seat availability
    const alreadyBooked = seats.filter((seat) => show.bookedSeats.includes(seat));
    if (alreadyBooked.length > 0) {
      return res.status(409).json({
        message: 'Some seats are already booked',
        seats: alreadyBooked,
      });
    }

    // Update booked seats
    show.bookedSeats.push(...seats);
    await show.save();

    const booking = await Booking.create({
      user: userId,
      show: showId,
      seats,
      totalAmount,
      bookingDate: bookingDate ? new Date(bookingDate) : show.showDate,
      status: 'confirmed',
    });

    const populated = await booking
      .populate({ path: 'show', populate: 'movie' })
      .populate('user', 'name email');

    return res.status(201).json(populated);
  } catch (err) {
    console.error('Create booking error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings
router.get('/', async (_req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({ path: 'show', populate: 'movie' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    return res.json(bookings);
  } catch (err) {
    console.error('Get bookings error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get bookings for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId })
      .populate({ path: 'show', populate: 'movie' })
      .sort({ createdAt: -1 });
    return res.json(bookings);
  } catch (err) {
    console.error('Get user bookings error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Cancel a booking
router.patch('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    const show = await Show.findById(booking.show);
    if (show) {
      show.bookedSeats = show.bookedSeats.filter((seat) => !booking.seats.includes(seat));
      await show.save();
    }

    booking.status = 'cancelled';
    await booking.save();

    const populated = await booking
      .populate({ path: 'show', populate: 'movie' })
      .populate('user', 'name email');

    return res.json(populated);
  } catch (err) {
    console.error('Cancel booking error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Remove a booking completely
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Booking removed successfully' });
  } catch (err) {
    console.error('Delete booking error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
