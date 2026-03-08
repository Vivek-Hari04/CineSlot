const mongoose = require('mongoose');
const Booking = require('./src/models/Booking');
const Show = require('./src/models/Show');
const User = require('./src/models/User');

require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  try {
    const show = await Show.findOne();
    const user = await User.findOne();

    if (!show || !user) {
      console.log('No show or user found');
      process.exit(1);
    }

    console.log('Testing booking with user:', user._id.toString(), 'and show:', show._id.toString());

    const seats = ['A1'];
    show.bookedSeats.push(...seats);
    await show.save();

    const booking = await Booking.create({
      user: user._id.toString(),
      show: show._id.toString(),
      seats,
      totalAmount: 100,
      bookingDate: show.showDate,
      status: 'confirmed',
    });

    console.log('Created successfully', booking);

  } catch(e) {
    console.error('Error occurred:', e);
  } finally {
    mongoose.disconnect();
  }
}

test();
