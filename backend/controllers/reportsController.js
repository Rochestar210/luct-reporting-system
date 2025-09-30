// backend/controllers/reportsController.js
const db = require('../config/db');

// Submit a new lecturer report
const submitReport = async (req, res) => {
  const {
    facultyName,
    className,
    weekOfReporting,
    dateOfLecture,
    courseName,
    courseCode,
    lecturerName,
    actualStudentsPresent,
    totalRegisteredStudents,
    venue,
    scheduledLectureTime,
    topicTaught,
    learningOutcomes,
    recommendations
  } = req.body;

  if (!courseCode || !dateOfLecture || !actualStudentsPresent) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [lecturerRows] = await db.execute(
      'SELECT user_id FROM users WHERE name = ? AND role = "lecturer"',
      [lecturerName]
    );
    if (lecturerRows.length === 0) {
      return res.status(404).json({ error: 'Lecturer not found' });
    }
    const lecturer_id = lecturerRows[0].user_id;

    const [classRows] = await db.execute(`
      SELECT c.class_id
      FROM classes c
      JOIN courses co ON c.course_id = co.course_id
      WHERE c.class_name = ? AND co.course_code = ?
    `, [className, courseCode]);

    if (classRows.length === 0) {
      return res.status(404).json({ error: 'Class not found for this course' });
    }
    const class_id = classRows[0].class_id;

    const [result] = await db.execute(
      `INSERT INTO reports (
        class_id, lecturer_id, week_of_reporting, date_of_lecture,
        actual_students_present, topic_taught, learning_outcomes, recommendations
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        class_id, lecturer_id, weekOfReporting, dateOfLecture,
        actualStudentsPresent, topicTaught, learningOutcomes, recommendations
      ]
    );

    res.status(201).json({ message: 'Report submitted successfully', reportId: result.insertId });
  } catch (error) {
    console.error('Report submission error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
};

// Get reports for PRL
const getPrlReports = async (req, res) => {
  try {
    const [reports] = await db.execute(`
      SELECT 
        r.report_id,
        r.week_of_reporting,
        r.date_of_lecture,
        r.actual_students_present,
        r.topic_taught,
        r.learning_outcomes,
        r.recommendations,
        u.name AS lecturer_name,
        c.class_name,
        co.course_code,
        co.course_name,
        c.total_registered_students
      FROM reports r
      INNER JOIN users u ON r.lecturer_id = u.user_id
      INNER JOIN classes c ON r.class_id = c.class_id
      INNER JOIN courses co ON c.course_id = co.course_id
      WHERE u.role = 'lecturer'
      ORDER BY r.submitted_at DESC
    `);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching PRL reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// Submit PRL feedback
const submitFeedback = async (req, res) => {
  const { report_id, prl_id, comments } = req.body;
  if (!report_id || !prl_id || !comments) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const [reportCheck] = await db.execute('SELECT report_id FROM reports WHERE report_id = ?', [report_id]);
    if (reportCheck.length === 0) return res.status(404).json({ error: 'Report not found' });

    const [prlCheck] = await db.execute('SELECT user_id FROM users WHERE user_id = ? AND role = "prl"', [prl_id]);
    if (prlCheck.length === 0) return res.status(404).json({ error: 'PRL not found' });

    const [result] = await db.execute('INSERT INTO feedback (report_id, prl_id, comments) VALUES (?, ?, ?)', [report_id, prl_id, comments]);
    res.status(201).json({ message: 'Feedback submitted', feedbackId: result.insertId });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

// Get reports for PL (with PRL feedback)
const getPlReports = async (req, res) => {
  try {
    const [reports] = await db.execute(`
      SELECT 
        r.report_id,
        r.week_of_reporting,
        r.date_of_lecture,
        r.actual_students_present,
        r.topic_taught,
        r.learning_outcomes,
        r.recommendations,
        u.name AS lecturer_name,
        c.class_name,
        co.course_code,
        co.course_name,
        c.total_registered_students,
        f.comments AS prl_feedback,
        f.feedback_date
      FROM reports r
      INNER JOIN users u ON r.lecturer_id = u.user_id
      INNER JOIN classes c ON r.class_id = c.class_id
      INNER JOIN courses co ON c.course_id = co.course_id
      LEFT JOIN feedback f ON r.report_id = f.report_id
      WHERE u.role = 'lecturer'
      ORDER BY r.submitted_at DESC
    `);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching PL reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// Get classes for Lecturer Report Form (auto-fill)
const getLecturerClasses = async (req, res) => {
  const { lecturerId } = req.query;
  if (!lecturerId) {
    return res.status(400).json({ error: 'lecturerId is required' });
  }

  try {
    const [classes] = await db.execute(`
      SELECT 
        c.class_id,
        c.class_name,
        co.course_code,
        co.course_name,
        c.venue,
        c.scheduled_time,
        c.total_registered_students
      FROM classes c
      JOIN courses co ON c.course_id = co.course_id
      WHERE c.lecturer_id = ?
    `, [lecturerId]);

    res.json(classes);
  } catch (error) {
    console.error('Fetch classes error:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
};

// Get assigned classes for Lecturer Dashboard
const getLecturerAssignedClasses = async (req, res) => {
  const { lecturerId } = req.query;
  if (!lecturerId) {
    return res.status(400).json({ error: 'lecturerId is required' });
  }

  try {
    const [classes] = await db.execute(`
      SELECT 
        c.class_id,
        c.class_name,
        co.course_code,
        co.course_name,
        c.venue,
        c.scheduled_time,
        c.total_registered_students
      FROM classes c
      JOIN courses co ON c.course_id = co.course_id
      WHERE c.lecturer_id = ?
      ORDER BY co.course_code
    `, [lecturerId]);

    res.json(classes);
  } catch (error) {
    console.error('Fetch lecturer assigned classes error:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
};

// Monitoring data for Lecturer Dashboard
const getLecturerMonitoring = async (req, res) => {
  const { lecturerId } = req.query;
  if (!lecturerId) {
    return res.status(400).json({ error: 'lecturerId is required' });
  }

  try {
    const [reports] = await db.execute(`
      SELECT 
        r.report_id,
        r.week_of_reporting,
        r.date_of_lecture,
        r.actual_students_present,
        r.topic_taught,
        c.class_name,
        co.course_code,
        f.comments AS prl_feedback,
        f.feedback_date
      FROM reports r
      JOIN classes c ON r.class_id = c.class_id
      JOIN courses co ON c.course_id = co.course_id
      LEFT JOIN feedback f ON r.report_id = f.report_id
      WHERE r.lecturer_id = ?
      ORDER BY r.date_of_lecture DESC
    `, [lecturerId]);

    const attendances = reports.map(r => r.actual_students_present);
    const avgAttendance = attendances.length 
      ? (attendances.reduce((a, b) => a + b, 0) / attendances.length).toFixed(1)
      : 0;
    const minAttendance = attendances.length ? Math.min(...attendances) : 0;
    const maxAttendance = attendances.length ? Math.max(...attendances) : 0;

    res.json({ 
      reports, 
      stats: { avgAttendance, minAttendance, maxAttendance, totalReports: reports.length } 
    });
  } catch (error) {
    console.error('Fetch monitoring error:', error);
    res.status(500).json({ error: 'Failed to fetch monitoring data' });
  }
};

// ✅ Monitoring data for Student Dashboard
const getStudentMonitoring = async (req, res) => {
  const { studentId } = req.query;
  if (!studentId) {
    return res.status(400).json({ error: 'studentId is required' });
  }

  try {
    // Assume student is enrolled in DIWA2110 (as per assignment)
    const [reports] = await db.execute(`
      SELECT 
        r.date_of_lecture,
        r.week_of_reporting,
        r.actual_students_present,
        co.course_code,
        u.name AS lecturer_name,
        c.total_registered_students
      FROM reports r
      JOIN classes c ON r.class_id = c.class_id
      JOIN courses co ON c.course_id = co.course_id
      JOIN users u ON r.lecturer_id = u.user_id
      WHERE co.course_code = 'DIWA2110'
      ORDER BY r.date_of_lecture DESC
      LIMIT 5
    `);

    res.json(reports);
  } catch (error) {
    console.error('Fetch student monitoring error:', error);
    res.status(500).json({ error: 'Failed to fetch monitoring data' });
  }
};

module.exports = { 
  submitReport, 
  getPrlReports, 
  submitFeedback, 
  getPlReports,
  getLecturerClasses,
  getLecturerAssignedClasses,
  getLecturerMonitoring,
  getStudentMonitoring // ✅ Export new function
};