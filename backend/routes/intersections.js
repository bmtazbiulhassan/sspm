const Intersection = require('../models/Intersection');
const express = require('express');


const router = express.Router();

// GET all intersections
router.get('/', async (req, res) => {
  try {
    const intersections = await Intersection.find();
    res.json(intersections);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching intersections' });
  }
});

module.exports = router;
