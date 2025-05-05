const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const rankingSchema = require('../models/Ranking');

// Dynamically get ranking model for given aggregation
function getRankingModel(aggSuffix) {
  const modelName = `ranking${aggSuffix}`;
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }
  return mongoose.model(modelName, rankingSchema, `ranking.${aggSuffix}`);
}

// GET /api/ranking?aggregation=15&startDate=...&endDate=...&weightLabel=...
router.get('/', async (req, res) => {
  const { aggregation, startDate, endDate, weightLabel } = req.query;

  if (!aggregation || !startDate || !endDate || !weightLabel) {
    return res.status(400).json({ error: 'Missing required query parameters.' });
  }

  const Model = getRankingModel(aggregation);
  const start = new Date(startDate);
  const end = new Date(endDate);

  try {
    const data = await Model.find({
      weightLabel,
      timeStamp: { $gte: start, $lte: end }
    }).sort({ rank: 1 }).lean();

    res.json(data);
  } catch (err) {
    console.error('Error fetching ranking data:', err);
    res.status(500).json({ error: 'Failed to fetch ranking data.' });
  }
});

module.exports = router;
