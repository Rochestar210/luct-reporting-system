// backend/routes/ratingRoutes.js
const express = require('express');
// 🔑 Import BOTH functions correctly
const { submitRating, getLecturerRatings } = require('../controllers/ratingController');

const router = express.Router();

router.post('/', submitRating);
router.get('/lecturer', getLecturerRatings); // ✅ Now defined

module.exports = router;