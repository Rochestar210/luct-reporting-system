// backend/controllers/coursesController.js
const db = require('../config/db');

const addCourse = async (req, res) => {
  const { course_code, course_name, faculty } = req.body;
  if (!course_code || !course_name || !faculty) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const created_by_pl = 4;
    const [result] = await db.execute(
      'INSERT INTO courses (course_code, course_name, faculty, created_by_pl) VALUES (?, ?, ?, ?)',
      [course_code, course_name, faculty, created_by_pl]
    );
    res.status(201).json({ message: 'Course added successfully', courseId: result.insertId });
  } catch (error) {
    console.error('Add course error:', error);
    res.status(500).json({ error: 'Failed to add course' });
  }
};

const assignLecturer = async (req, res) => {
  const { course_id, lecturer_id, class_name, venue, scheduled_time, total_registered_students } = req.body;
  if (!course_id || !lecturer_id || !class_name) {
    return res.status(400).json({ error: 'Course, lecturer, and class name are required' });
  }
  try {
    const [result] = await db.execute(
      `INSERT INTO classes 
       (course_id, lecturer_id, class_name, venue, scheduled_time, total_registered_students)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [course_id, lecturer_id, class_name, venue, scheduled_time, total_registered_students]
    );
    res.status(201).json({ message: 'Lecturer assigned successfully', classId: result.insertId });
  } catch (error) {
    console.error('Assign lecturer error:', error);
    res.status(500).json({ error: 'Failed to assign lecturer' });
  }
};

const getCourses = async (req, res) => {
  try {
    const [courses] = await db.execute(
      'SELECT course_id, course_code, course_name FROM courses'
    );
    res.json(courses);
  } catch (error) {
    console.error('Fetch courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

const getLecturers = async (req, res) => {
  try {
    const [lecturers] = await db.execute(
      'SELECT user_id, name FROM users WHERE role = "lecturer"'
    );
    res.json(lecturers);
  } catch (error) {
    console.error('Fetch lecturers error:', error);
    res.status(500).json({ error: 'Failed to fetch lecturers' });
  }
};

// ✅ FIXED: Use prl_id instead of faculty
const getPrlCourses = async (req, res) => {
  const { prlId } = req.query;
  if (!prlId) {
    return res.status(400).json({ error: 'prlId is required' });
  }

  try {
    const [prlCheck] = await db.execute(
      'SELECT user_id FROM users WHERE user_id = ? AND role = "prl"',
      [prlId]
    );
    if (prlCheck.length === 0) {
      return res.status(404).json({ error: 'PRL not found' });
    }

    const [courses] = await db.execute(`
      SELECT 
        co.course_id,
        co.course_code,
        co.course_name,
        c.class_id,
        c.class_name,
        c.venue,
        c.scheduled_time,
        c.total_registered_students,
        u.name AS lecturer_name
      FROM courses co
      LEFT JOIN classes c ON co.course_id = c.course_id
      LEFT JOIN users u ON c.lecturer_id = u.user_id
      WHERE co.prl_id = ?
      ORDER BY co.course_code, c.class_name
    `, [prlId]);

    const grouped = {};
    courses.forEach(row => {
      if (!grouped[row.course_id]) {
        grouped[row.course_id] = {
          course_id: row.course_id,
          course_code: row.course_code,
          course_name: row.course_name,
          classes: []
        };
      }
      if (row.class_id) {
        grouped[row.course_id].classes.push({
          class_id: row.class_id,
          class_name: row.class_name,
          venue: row.venue,
          scheduled_time: row.scheduled_time,
          total_registered_students: row.total_registered_students,
          lecturer_name: row.lecturer_name
        });
      }
    });

    res.json(Object.values(grouped));
  } catch (error) {
    console.error('Fetch PRL courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

// ✅ Assign course to PRL
const assignCourseToPRL = async (req, res) => {
  const { course_id, prl_id } = req.body;
  if (!course_id || !prl_id) {
    return res.status(400).json({ error: 'course_id and prl_id are required' });
  }
  try {
    const [prlCheck] = await db.execute(
      'SELECT user_id FROM users WHERE user_id = ? AND role = "prl"',
      [prl_id]
    );
    if (prlCheck.length === 0) {
      return res.status(400).json({ error: 'Invalid PRL ID' });
    }

    const [result] = await db.execute(
      'UPDATE courses SET prl_id = ? WHERE course_id = ?',
      [prl_id, course_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Course assigned to PRL successfully' });
  } catch (error) {
    console.error('Assign course to PRL error:', error);
    res.status(500).json({ error: 'Failed to assign course' });
  }
};

module.exports = { 
  addCourse, 
  assignLecturer, 
  getCourses, 
  getLecturers,
  getPrlCourses,
  assignCourseToPRL 
};