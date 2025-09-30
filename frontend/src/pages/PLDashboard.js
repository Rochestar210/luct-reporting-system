import React, { useState, useEffect } from 'react';
import UserHeader from '../components/UserHeader';
import RatingForm from '../components/RatingSection';

const PLDashboard = () => {
  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  
  const [reports, setReports] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [prls, setPrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [reportSearch, setReportSearch] = useState('');

  const [courseForm, setCourseForm] = useState({
    course_code: '',
    course_name: '',
    faculty: loggedInUser?.faculty || 'Faculty of Information Communication Technology'
  });

  const [assignForm, setAssignForm] = useState({
    course_id: '',
    lecturer_id: '',
    class_name: '',
    venue: 'Lab 3',
    scheduled_time: 'Mon 10:00–12:00',
    total_registered_students: 45
  });

  const [assignPRLForm, setAssignPRLForm] = useState({
    course_id: '',
    prl_id: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportsRes = await fetch('http://localhost:5000/api/reports/pl');
        const reportsData = await reportsRes.json();
        setReports(reportsData);

        const coursesRes = await fetch('http://localhost:5000/api/courses');
        const coursesData = await coursesRes.json();
        setCourses(coursesData);

        const lecturersRes = await fetch('http://localhost:5000/api/courses/lecturers');
        const lecturersData = await lecturersRes.json();
        setLecturers(lecturersData);

        const prlsRes = await fetch('http://localhost:5000/api/users/prls');
        const prlsData = await prlsRes.json();
        setPrls(prlsData);
      } catch (err) {
        console.error('Failed to fetch ', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredReports = reports.filter(report => {
    const term = reportSearch.toLowerCase();
    return (
      (report.course_code && report.course_code.toLowerCase().includes(term)) ||
      (report.course_name && report.course_name.toLowerCase().includes(term)) ||
      (report.lecturer_name && report.lecturer_name.toLowerCase().includes(term)) ||
      (report.class_name && report.class_name.toLowerCase().includes(term)) ||
      (report.prl_feedback && report.prl_feedback.toLowerCase().includes(term))
    );
  });

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.course_code || !courseForm.course_name) {
      setMessage('⚠️ Please fill all course fields.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      });
      if (response.ok) {
        setMessage('✅ Course added successfully!');
        setCourseForm({
          course_code: '',
          course_name: '',
          faculty: loggedInUser?.faculty || 'Faculty of Information Communication Technology'
        });
        const res = await fetch('http://localhost:5000/api/courses');
        const data = await res.json();
        setCourses(data);
      } else {
        setMessage('❌ Failed to add course.');
      }
    } catch (err) {
      setMessage('❌ Network error.');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignForm.course_id || !assignForm.lecturer_id || !assignForm.class_name) {
      setMessage('⚠️ Please fill all assignment fields.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/courses/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignForm)
      });
      if (response.ok) {
        setMessage('✅ Lecturer assigned successfully!');
        setAssignForm({
          course_id: '',
          lecturer_id: '',
          class_name: '',
          venue: 'Lab 3',
          scheduled_time: 'Mon 10:00–12:00',
          total_registered_students: 45
        });
      } else {
        setMessage('❌ Failed to assign lecturer.');
      }
    } catch (err) {
      setMessage('❌ Network error.');
    }
  };

  const handleAssignPRLSubmit = async (e) => {
    e.preventDefault();
    if (!assignPRLForm.course_id || !assignPRLForm.prl_id) {
      setMessage('⚠️ Please select course and PRL.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/courses/assign-prl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignPRLForm)
      });
      if (response.ok) {
        setMessage('✅ Course assigned to PRL successfully!');
        setAssignPRLForm({ course_id: '', prl_id: '' });
      } else {
        const data = await response.json();
        setMessage(`❌ ${data.error || 'Failed to assign'}`);
      }
    } catch (err) {
      setMessage('❌ Network error.');
    }
  };

  if (loading) return <div className="container mt-4">Loading...</div>;

 
  const styles = `
  body{
     background-color: gray;
     }
    .dashboard-container {
      padding: 1.5rem 0;
    }
    .card-section {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 3px 10px rgba(0,0,0,0.06);
      margin-bottom: 1.5rem;
    }
    .section-title {
      font-weight: 700;
      color: #0c4a6e;
      margin-bottom: 1.25rem;
    }
    .report-item {
      border-left: 3px solid #bae6fd;
      padding-left: 1rem;
      margin-bottom: 1rem;
      background: #f0f9ff;
      border-radius: 8px;
    }
    .assign-btn {
      background: linear-gradient(to right, #0ea5e9, #0284c7);
      border: none;
    }
    .btn-warning {
      background: linear-gradient(to right, #f59e0b, #d97706);
      border: none;
      color: white;
    }
    .form-select, .form-control {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.5rem;
    }
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem 0;
      }
    }
  `;

  return (
    <div className="container mt-4 dashboard-container">
      <style>{styles}</style>
      
      <UserHeader 
        onSearch={setReportSearch}
        searchPlaceholder="Search reports by course or lecturer..."
      />
      
      <div className="card-section">
        <RatingForm ratedUserId={2} />  
        <h2>Program Leader (PL) Dashboard</h2>
        <p><strong>Modules:</strong> Courses, Reports, Monitoring, Classes, Lectures, Rating</p>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      {/* Assign Course to PRL */}
      <div className="card-section">
        <h4 className="section-title">Assign Course to Principal Lecturer (PRL)</h4>
        <form onSubmit={handleAssignPRLSubmit}>
          <div className="row">
            <div className="col-md-5 mb-3">
              <select
                className="form-select"
                value={assignPRLForm.course_id}
                onChange={(e) => setAssignPRLForm({ ...assignPRLForm, course_id: e.target.value })}
                required
              >
                <option value="">-- Select Course --</option>
                {courses.map(c => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.course_code} - {c.course_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-5 mb-3">
              <select
                className="form-select"
                value={assignPRLForm.prl_id}
                onChange={(e) => setAssignPRLForm({ ...assignPRLForm, prl_id: e.target.value })}
                required
              >
                <option value="">-- Select PRL --</option>
                {prls.map(p => (
                  <option key={p.user_id} value={p.user_id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2 mb-3 d-flex align-items-end">
              <button type="submit" className="btn btn-warning w-100">Assign to PRL</button>
            </div>
          </div>
        </form>
      </div>

      {/* Add Course */}
      <div className="card-section">
        <h4 className="section-title">Add New Course</h4>
        <form onSubmit={handleAddCourse}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Course Code (e.g., COMM101)"
                value={courseForm.course_code}
                onChange={(e) => setCourseForm({ ...courseForm, course_code: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Course Name"
                value={courseForm.course_name}
                onChange={(e) => setCourseForm({ ...courseForm, course_name: e.target.value })}
                required
              />
            </div>
            <div className="col-md-2 mb-3">
              <input
                type="text"
                className="form-control"
                value={courseForm.faculty}
                readOnly
              />
            </div>
          </div>
          <button type="submit" className="btn btn-success">Add Course</button>
        </form>
      </div>

      {/* Assign Lecturer */}
      <div className="card-section">
        <h4 className="section-title">Assign Classes to the Lecture</h4>
        <form onSubmit={handleAssignSubmit}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <select
                className="form-select"
                value={assignForm.course_id}
                onChange={(e) => setAssignForm({ ...assignForm, course_id: e.target.value })}
                required
              >
                <option value="">-- Select Course --</option>
                {courses.map(c => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.course_code} - {c.course_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <select
                className="form-select"
                value={assignForm.lecturer_id}
                onChange={(e) => setAssignForm({ ...assignForm, lecturer_id: e.target.value })}
                required
              >
                <option value="">-- Select Lecturer --</option>
                {lecturers.map(l => (
                  <option key={l.user_id} value={l.user_id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Class Name (e.g., Group A)"
                value={assignForm.class_name}
                onChange={(e) => setAssignForm({ ...assignForm, class_name: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-3 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Venue"
                value={assignForm.venue}
                onChange={(e) => setAssignForm({ ...assignForm, venue: e.target.value })}
              />
            </div>
            <div className="col-md-3 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Schedule"
                value={assignForm.scheduled_time}
                onChange={(e) => setAssignForm({ ...assignForm, scheduled_time: e.target.value })}
              />
            </div>
            <div className="col-md-3 mb-3">
              <input
                type="number"
                className="form-control"
                placeholder="Total Students"
                value={assignForm.total_registered_students}
                onChange={(e) => setAssignForm({ ...assignForm, total_registered_students: e.target.value })}
                min="1"
              />
            </div>
            <div className="col-md-3 mb-3 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100">Assign Lecturer</button>
            </div>
          </div>
        </form>
      </div>

      {/* Reports with PRL Feedback */}
      <div className="card-section">
        <h4 className="section-title">Final Reports with PRL Feedback</h4>

        {filteredReports.length === 0 ? (
          <p>No reports found.</p>
        ) : (
          filteredReports.map(report => (
            <div key={report.report_id} className="report-item">
              <h5>{report.course_code} - {report.class_name}</h5>
              <p>
                <strong>Lecturer:</strong> {report.lecturer_name} <br />
                <strong>Date:</strong> {report.date_of_lecture} | <strong>Week:</strong> {report.week_of_reporting} <br />
                <strong>Attendance:</strong> {report.actual_students_present}/{report.total_registered_students}
              </p>
              {report.prl_feedback ? (
                <div className="alert alert-info mt-2 p-2">
                  <strong>Feedback:</strong> {report.prl_feedback}
                </div>
              ) : (
                <div className="alert alert-warning">No PRL feedback yet</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PLDashboard;