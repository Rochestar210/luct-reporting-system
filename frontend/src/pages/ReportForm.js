import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ReportForm = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [formData, setFormData] = useState({
    facultyName: '',
    className: '',
    weekOfReporting: '',
    dateOfLecture: '',
    courseName: '',
    courseCode: '',
    lecturerName: '',
    actualStudentsPresent: '',
    totalRegisteredStudents: '',
    venue: '',
    scheduledLectureTime: '',
    topicTaught: '',
    learningOutcomes: '',
    recommendations: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id || user.role !== 'lecturer') {
        setMessage('❌ Invalid lecturer session.');
        setLoading(false);
        return;
      }

      try {
        setFormData(prev => ({
          ...prev,
          lecturerName: user.name,
          facultyName: user.faculty
        }));

        const response = await fetch(`http://localhost:5000/api/reports/classes?lecturerId=${user.id}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setClasses(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setMessage(`❌ Failed to load classes: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    if (classId === '') return;

    const cls = classes.find(c => c.class_id === Number(classId));
    if (cls) {
      setFormData(prev => ({
        ...prev,
        className: cls.class_name,
        courseName: cls.course_name,
        courseCode: cls.course_code,
        venue: cls.venue,
        scheduledLectureTime: cls.scheduled_time,
        totalRegisteredStudents: cls.total_registered_students
      }));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const { courseCode, dateOfLecture, actualStudentsPresent } = formData;
    if (!courseCode || !dateOfLecture || actualStudentsPresent === '' || isNaN(Number(actualStudentsPresent))) {
      setMessage('❌ Please fill all required fields correctly.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('✅ Report submitted!');
        setTimeout(() => navigate('/lecturer/dashboard'), 2000);
      } else {
        setMessage(`❌ ${data.error || 'Submission failed'}`);
      }
    } catch (err) {
      setMessage('❌ Network error.');
    }
  };

  if (loading) return <div className="container mt-4">Loading your classes...</div>;

 
  const styles = `
    .report-container {
      max-width: 800px;
      margin: 2rem auto;
    }
    .report-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    }
    .report-title {
      font-weight: 700;
      color: #059669;
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .form-label {
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
    }
    .form-control, .form-select {
      border: 1px solid #d1d5db;
      border-radius: 10px;
      padding: 0.75rem;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    .form-control:focus, .form-select:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 137, 0.2);
      outline: none;
    }
    .form-control[readonly] {
      background-color: #f9fafb;
      color: #6b7280;
    }
    .btn-primary {
      background: linear-gradient(to right, #10b981, #059669);
      border: none;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      border-radius: 10px;
      transition: opacity 0.2s;
    }
    .btn-primary:hover {
      opacity: 0.9;
    }
    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
      border: none;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      border-radius: 10px;
    }
    .btn-secondary:hover {
      background: #e5e7eb;
    }
    .required::after {
      content: " *";
      color: #ef4444;
    }
    @media (max-width: 768px) {
      .report-card {
        padding: 1.5rem;
      }
      .btn-group {
        flex-direction: column;
        gap: 0.5rem;
      }
      .btn {
        width: 100%;
      }
    }
  `;

  return (
    <div className="container mt-4 report-container">
      <style>{styles}</style>
      <div className="report-card">
        <h3 className="report-title">Lecturer Weekly Report Form</h3>
        {message && <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-danger'} mb-3`}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Faculty Name</label>
              <input type="text" className="form-control" value={formData.facultyName} readOnly />
            </div>
            <div className="col-md-6">
              <label className="form-label">Lecturer’s Name</label>
              <input type="text" className="form-control" value={formData.lecturerName} readOnly />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label required">Select Class</label>
            <select className="form-select" onChange={handleClassChange} required>
              <option value="">-- Choose your assigned class --</option>
              {classes.map(cls => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.course_code} - {cls.class_name}
                </option>
              ))}
            </select>
          </div>

          {selectedClassId && (
            <>
              <div className="mb-3">
                <label className="form-label required">Week of Reporting</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="weekOfReporting" 
                  value={formData.weekOfReporting} 
                  onChange={handleChange} 
                  placeholder="e.g., Week 7" 
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="form-label required">Date of Lecture</label>
                <input 
                  type="date" 
                  className="form-control" 
                  name="dateOfLecture" 
                  value={formData.dateOfLecture} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="form-label required">Actual Number of Students Present</label>
                <input 
                  type="number" 
                  className="form-control" 
                  name="actualStudentsPresent" 
                  value={formData.actualStudentsPresent} 
                  onChange={handleChange} 
                  min="0" 
                  required 
                />
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Course Name</label>
                  <input type="text" className="form-control" value={formData.courseName} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Course Code</label>
                  <input type="text" className="form-control" value={formData.courseCode} readOnly />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Class Name</label>
                  <input type="text" className="form-control" value={formData.className} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Venue of the Class</label>
                  <input type="text" className="form-control" value={formData.venue} readOnly />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Scheduled Lecture Time</label>
                  <input type="text" className="form-control" value={formData.scheduledLectureTime} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Total Number of Registered Students</label>
                  <input type="number" className="form-control" value={formData.totalRegisteredStudents} readOnly />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label required">Topic Taught</label>
                <textarea 
                  className="form-control" 
                  name="topicTaught" 
                  value={formData.topicTaught} 
                  onChange={handleChange} 
                  rows="2" 
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="form-label required">Learning Outcomes of the Topic</label>
                <textarea 
                  className="form-control" 
                  name="learningOutcomes" 
                  value={formData.learningOutcomes} 
                  onChange={handleChange} 
                  rows="3" 
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="form-label required">Lecturer’s Recommendations</label>
                <textarea 
                  className="form-control" 
                  name="recommendations" 
                  value={formData.recommendations} 
                  onChange={handleChange} 
                  rows="3" 
                  required 
                />
              </div>
            </>
          )}

          <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/lecturer/dashboard')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={!selectedClassId}
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;