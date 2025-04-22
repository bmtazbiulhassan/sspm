const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const performanceMeasureSchema = require('../models/PerformanceMeasure');


// helper to safely get a dynamic model
function getDynamicModel(aggSuffix) {
    const modelName = `feature${aggSuffix}`;
    if (mongoose.models[modelName]) {
      return mongoose.models[modelName];
    }
    return mongoose.model(modelName, performanceMeasureSchema, `feature_extraction.feature.${aggSuffix}`);
}

// GET data by sub-option, aggregation level, date range
router.get('/', async (req, res) => {
  const { signalID, featureName, aggregation, startDate, endDate } = req.query;

  if (!signalID || !featureName || !aggregation || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  const aggSuffix = aggregation === 'Cycle' ? '00' : aggregation.replace(' min', '');
    console.log('Collection being queried: feature_extraction.feature.' + aggSuffix);

    try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const Model = getDynamicModel(aggSuffix);
    const query = {
        signalID,
        featureName,
        timeStamp: { $gte: start, $lte: end }
    };

    console.log('Query:', query);

    const data = await Model.find(query).lean();
    res.json(data);
    } catch (err) {
    console.error('Error fetching performance data:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
    }

});

module.exports = router;
