const mongoose = require('mongoose');


const intersectionSchema = new mongoose.Schema({
  signalID: { type: String, required: true, unique: true },
  siiaID: Number,
  intersectionName: String,
  latitude: Number,
  longitude: Number
}, { timestamps: true });

module.exports = mongoose.model('Intersection', intersectionSchema);
