const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  club: String,
  description: String,
  image: String,
  location: String,
  date: Date,

  tags: [String], // interests like sports, music, coding, art

}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);