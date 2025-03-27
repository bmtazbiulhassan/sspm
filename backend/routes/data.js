// const express = require('express');
// const Data = require('../models/Data');

// const router = express.Router();


// router.get('/:signalID', async (req, res) => {
//   const { signalID } = req.params;
//   const { param, start, end } = req.query;

//   try {
//     const Data = await Data.find({
//       signalID: signalID,
//       featureName: param,
//       timeStamp: {
//         $gte: new Date(start),
//         $lte: new Date(end)
//       }
//     }).sort({ timeStamp: 1 });

//     res.json(Data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error fetching data' });
//   }
// });

// module.exports = router;
