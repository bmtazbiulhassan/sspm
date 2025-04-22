const mongoose = require('mongoose');


const performanceMeasureSchema = new mongoose.Schema({
  signalID: { type: String, required: true },
  cycleLength: { type: Number, default: null },
  feature: { type: String, required: true },
  featureName: { type: String, required: true },
  value: { type: Number, default: null },
  min: { type: Number, default: null },
  max: { type: Number, default: null },
  mean: { type: Number, default: null },
  std: { type: Number, default: null },
  signalType: { type: String, default: null },
  laneType: { type: String, default: null },
  phaseNo: { type: Number, default: null },
  timeStamp: { type: Date, required: true },
  day: Number,
  month: Number,
  year: Number
}, { timestamps: true });

module.exports = performanceMeasureSchema;
