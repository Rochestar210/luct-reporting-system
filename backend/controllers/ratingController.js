// backend/controllers/ratingController.js
const db = require('../config/db');

// ✅ FIXED: Accept rated_by_user_id from frontend (no more hardcoded ID)
const submitRating = async (req, res) => {
  const { rated_user_id, rated_by_user_id, rating_value, comment } = req.body;

  if (!rated_user_id || !rated_by_user_id || !rating_value || rating_value < 1 || rating_value > 5) {
    return res.status(400).json({ error: 'All fields are required: rated_user_id, rated_by_user_id, rating_value (1-5)' });
  }

  try {
    // Verify rater exists
    const [raterCheck] = await db.execute('SELECT user_id FROM users WHERE user_id = ?', [rated_by_user_id]);
    if (raterCheck.length === 0) {
      return res.status(400).json({ error: 'Rater not found in users table' });
    }

    // Verify rated user exists
    const [ratedCheck] = await db.execute('SELECT user_id FROM users WHERE user_id = ?', [rated_user_id]);
    if (ratedCheck.length === 0) {
      return res.status(400).json({ error: 'Lecturer not found in users table' });
    }

    const [result] = await db.execute(
      'INSERT INTO ratings (rated_user_id, rated_by_user_id, rating_value, comment) VALUES (?, ?, ?, ?)',
      [rated_user_id, rated_by_user_id, rating_value, comment || null]
    );
    res.status(201).json({ message: 'Rating submitted', ratingId: result.insertId });
  } catch (error) {
    console.error('Rating submission error:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
};

// Get ratings for a lecturer (with correct rater info)
const getLecturerRatings = async (req, res) => {
  const { lecturerId } = req.query;
  if (!lecturerId) return res.status(400).json({ error: 'lecturerId required' });

  try {
    const [ratings] = await db.execute(`
      SELECT 
        r.rating_value,
        r.comment,
        r.created_at,
        u.name AS rated_by_name,
        u.role AS rated_by_role
      FROM ratings r
      JOIN users u ON r.rated_by_user_id = u.user_id
      WHERE r.rated_user_id = ?
      ORDER BY r.created_at DESC
    `, [lecturerId]);

    const average = ratings.length 
      ? (ratings.reduce((sum, r) => sum + r.rating_value, 0) / ratings.length).toFixed(1)
      : 0;

    res.json({ ratings, average: parseFloat(average) });
  } catch (error) {
    console.error('Fetch ratings error:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
};

module.exports = { submitRating, getLecturerRatings };