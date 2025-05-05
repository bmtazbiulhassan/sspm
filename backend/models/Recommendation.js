const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  signalID: { type: String, required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  phaseNo: { type: Number, required: true },
  time: { type: String, default: null },
  feature: { type: String, required: true },  // pedestrianPresenceProbability-specific filtering
  k: { type: Number, default: null }, // conflictPropensity-specific filtering
  alpha: { type: Number, default: null },
  beta: { type: Number, default: null },
  probability: { type: Number, default: null },
  lowerBound: { type: Number, default: null },
  upperBound: { type: Number, default: null },
  threshold: { type: Number, default: null },
  recommend: { type: Number, default: null }
}, { timestamps: true });

module.exports = recommendationSchema;
