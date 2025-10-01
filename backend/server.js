// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const coursesRoutes = require('./routes/coursesRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins (safe for now)
app.use(cors());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' })); // Prevent large payload issues

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/rating', ratingRoutes);
app.use('/api/users', userRoutes);

// Test DB route
app.get('/api/test-db', async (req, res) => {
  const db = require('./config/db');
  try {
    const [rows] = await db.execute('SELECT 1 + 1 AS result');
    res.json({ message: '✅ DB connected!', test: rows[0].result });
  } catch (error) {
    console.error('DB Test Error:', error);
    res.status(500).json({ error: 'DB connection failed', details: error.message });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'LUCT Reporting System Backend is running!' });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});