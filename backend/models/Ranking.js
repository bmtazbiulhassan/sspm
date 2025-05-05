const mongoose = require('mongoose');


const rankingSchema = new mongoose.Schema({
  signalID: { type: String, required: true },
  conflictScore: { type: Number, default: null },
  runningFlagScore: { type: Number, default: null },
  pedestrianDelayScore: { type: Number, default: null },
  conflictWeight: { type: Number, default: null },
  runningFlagWeight: { type: Number, default: null },
  pedestrianDelayWeight: { type: Number, default: null },
  weightLabel: { type: String, required: true },
  safetyScore: { type: Number, default: null },
  timeStamp: { type: Date, required: true },
  year: { type: Number },
  month: { type: Number },
  day: { type: Number },
  rank: { type: Number }
}, { timestamps: true });

module.exports = rankingSchema;
