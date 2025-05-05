const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const recommendationSchema = require('../models/Recommendation');

// Helper to get dynamic model based on aggregation
function getDynamicRecommendationModel(aggSuffix) {
  const modelName = `recommendation${aggSuffix}`;
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }
  return mongoose.model(modelName, recommendationSchema, `recommendation.${aggSuffix}`);
}

// GET /api/recommendation?signalID=...&featureName=...&aggregation=...&year=...&month=...
router.get('/', async (req, res) => {
  const { signalID, featureName, aggregation, year, month } = req.query;

  if (!signalID || !featureName || !aggregation || !year || !month) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  const aggSuffix = aggregation;
  const collectionName = `recommendation.${aggSuffix}`;
  console.log('Trying to fetch from collection:', collectionName);

  try {
    const Model = getDynamicRecommendationModel(aggSuffix);

    const query = {
      signalID: String(signalID),
      feature: String(featureName),
      year: Number(year),
      month: Number(month)
    };

    console.log('Querying:', query);

    const data = await Model.find(query).lean();

    if (!data || data.length === 0) {
      console.warn('No documents found for:', query);
      return res.status(404).json({ message: 'No data found for the given parameters.' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching recommendation data:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

module.exports = router;
