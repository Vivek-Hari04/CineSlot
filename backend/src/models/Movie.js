const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    genre: [{ type: String, trim: true }],
    language: { type: String, required: true, trim: true },
    duration: { type: Number, required: true }, // minutes
    releaseDate: { type: Date },
    rating: { type: Number, min: 0, max: 10 },
    synopsis: { type: String },
    posterUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);

