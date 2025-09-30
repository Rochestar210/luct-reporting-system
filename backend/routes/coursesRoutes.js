// backend/routes/coursesRoutes.js
const express = require('express');
const { 
  addCourse, 
  assignLecturer, 
  getCourses, 
  getLecturers,
  getPrlCourses,
  assignCourseToPRL 
} = require('../controllers/coursesController');

const router = express.Router();

router.post('/', addCourse);
router.post('/assign', assignLecturer);
router.post('/assign-prl', assignCourseToPRL);
router.get('/', getCourses);
router.get('/lecturers', getLecturers);
router.get('/prl', getPrlCourses);

module.exports = router;