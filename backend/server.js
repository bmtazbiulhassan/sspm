const connectDB = require('./config/db');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

connectDB();

const intersectionRoutes = require('./routes/intersections');
app.use('/api/intersections', intersectionRoutes);

const measureRoutes = require('./routes/measures');
app.use('/api/measures', measureRoutes);

const recommendationRoutes = require('./routes/recommendation');
app.use('/api/recommendation', recommendationRoutes);

const rankingRoutes = require('./routes/ranking');
app.use('/api/ranking', rankingRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
