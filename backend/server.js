// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const coursesRoutes = require('./routes/coursesRoutes');
const ratingRoutes = require('./routes/ratingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/rating', ratingRoutes);
app.use('/api/users', require('./routes/userRoutes'));

// Test DB route
app.get('/api/test-db', async (req, res) => {
  const db = require('./config/db');
  try {
    const [rows] = await db.execute('SELECT 1 + 1 AS result');
    res.json({ message: '✅ DB connected!', test: rows[0].result });
  } catch (error) {
    res.status(500).json({ error: 'DB connection failed' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'LUCT Reporting System Backend is running!' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});