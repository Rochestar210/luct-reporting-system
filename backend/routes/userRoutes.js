// backend/routes/userRoutes.js
const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Get all PRLs
router.get('/prls', async (req, res) => {
  try {
    const [prls] = await db.execute(
      'SELECT user_id, name FROM users WHERE role = "prl"'
    );
    res.json(prls);
  } catch (error) {
    console.error('Fetch PRLs error:', error);
    res.status(500).json({ error: 'Failed to fetch PRLs' });
  }
});

module.exports = router;