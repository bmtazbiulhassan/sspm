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

// GET intersection by signalID
router.get('/:signalID', async (req, res) => {
  try {
    const signalID = req.params.signalID.toString(); // Make sure it's a string
    const intersection = await Intersection.findOne({ signalID });

    if (!intersection) {
      return res.status(404).json({ error: 'Intersection not found' });
    }

    res.json(intersection);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching intersection by signalID' });
  }
});

module.exports = router;
