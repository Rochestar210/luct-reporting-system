// backend/routes/reportsRoutes.js
const express = require('express');
const { 
  submitReport, 
  getPrlReports, 
  submitFeedback, 
  getPlReports,
  getLecturerClasses,
  getLecturerAssignedClasses,
  getLecturerMonitoring,
  getStudentMonitoring 
} = require('../controllers/reportsController');

const router = express.Router();

router.post('/', submitReport);
router.get('/prl', getPrlReports);
router.post('/feedback', submitFeedback);
router.get('/pl', getPlReports);
router.get('/classes', getLecturerClasses);
router.get('/lecturer/classes', getLecturerAssignedClasses);
router.get('/lecturer/monitoring', getLecturerMonitoring);
router.get('/student/monitoring', getStudentMonitoring); 

module.exports = router;