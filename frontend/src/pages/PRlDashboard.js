import React, { useState, useEffect } from 'react';
import UserHeader from '../components/UserHeader';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Accordion } from 'react-bootstrap';

const PRlDashboard = () => {
  const [reports, setReports] = useState([]);
  const [courses, setCourses] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [message, setMessage] = useState('');
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/reports/prl');
        const data = await response.json();
        setReports(data);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
        setMessage('❌ Failed to load reports');
      } finally {
        setLoadingReports(false);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'prl') return;

      try {
        const response = await fetch(`http://localhost:5000/api/courses/prl?prlId=${user.id}`);
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setMessage('❌ Failed to load courses');
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const exportToExcel = () => {
    if (reports.length === 0) {
      alert('No reports to export.');
      return;
    }

    const dataForExcel = reports.map(report => ({
      'Faculty': report.faculty_name || report.faculty || '',
      'Class Name': report.class_name || '',
      'Week': report.week_of_reporting || '',
      'Date': report.date_of_lecture || '',
      'Course Name': report.course_name || '',
      'Course Code': report.course_code || '',
      'Lecturer': report.lecturer_name || '',
      'Present': report.actual_students_present || 0,
      'Registered': report.total_registered_students || 0,
      'Venue': report.venue || '',
      'Time': report.scheduled_time || '',
      'Topic Taught': report.topic_taught || '',
      'Learning Outcomes': report.learning_outcomes || '',
      'Recommendations': report.recommendations || '',
      'PRL Feedback': report.prl_feedback || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lecture Reports');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'PRL_Lecture_Reports.xlsx');
  };

  const handleFeedbackChange = (reportId, value) => {
    setFeedback(prev => ({ ...prev, [reportId]: value }));
  };

  const handleSubmitFeedback = async (reportId) => {
    const comment = feedback[reportId]?.trim();
    if (!comment) {
      setMessage('⚠️ Please enter feedback before submitting.');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      setMessage('❌ Please log in to submit feedback.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reports/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          report_id: reportId, 
          prl_id: user.id, 
          comments: comment 
        })
      });

      if (response.ok) {
        setMessage('✅ Feedback submitted successfully!');
        setFeedback(prev => ({ ...prev, [reportId]: '' }));
      } else {
        const data = await response.json();
        setMessage(`❌ ${data.error || 'Failed to save feedback'}`);
      }
    } catch (err) {
      console.error('Feedback submission error:', err);
      setMessage('❌ Network error. Is the backend running?');
    }
  };

  const filteredReports = reports.filter(report => {
    const term = searchTerm.toLowerCase();
    return (
      (report.course_code && report.course_code.toLowerCase().includes(term)) ||
      (report.course_name && report.course_name.toLowerCase().includes(term)) ||
      (report.lecturer_name && report.lecturer_name.toLowerCase().includes(term)) ||
      (report.class_name && report.class_name.toLowerCase().includes(term)) ||
      (report.topic_taught && report.topic_taught.toLowerCase().includes(term)) ||
      (report.faculty_name && report.faculty_name.toLowerCase().includes(term)) ||
      (report.faculty && report.faculty.toLowerCase().includes(term))
    );
  });


  const styles = `
  body{
     background-color: gray;
     }
    .dashboard-container {
      padding: 1.5rem 0;
    }
    .section-title {
      font-weight: 700;
      color: #1e293b;
      margin: 1.5rem 0 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e2e8f0;
    }
    .report-card {
      border: none;
      border-radius: 12px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.06);
      transition: transform 0.2s, box-shadow 0.2s;
      margin-bottom: 1.25rem;
    }
    .report-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    }
    .course-badge {
      background: #dbeafe;
      color: #1d4ed8;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
    }
    .feedback-section {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 10px;
      border-left: 3px solid #6366f1;
      margin-top: 1rem;
    }
    .accordion-item {
      border: none;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      margin-bottom: 8px;
      border-radius: 6px !important;
    }
    .accordion-button {
      background-color: #f1f5f9 !important;
      font-weight: 600;
      color: #1e40af;
    }
    .accordion-button:not(.collapsed) {
      background-color: #dbeafe !important;
      color: #1d4ed8;
      border-bottom: 1px solid #bfdbfe;
    }
    .table th {
      background-color: #f1f5f9;
      font-weight: 600;
    }
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem 0;
      }
      .section-title {
        font-size: 1.25rem;
      }
    }
  `;

  return (
    <div className="container mt-4 dashboard-container">
      <style>{styles}</style>
      
      <UserHeader 
        onSearch={setSearchTerm}
        searchPlaceholder="Search reports by course, lecturer, or topic..."
      />
      
      {message && (
        <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      {/* Courses & Lectures Section */}
      <div className="mt-4">
        <h4 className="section-title">Courses & Lectures Under My Stream</h4>
        {loadingCourses ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <div className="alert alert-warning">
            No courses assigned to you. Contact the Program Leader.
          </div>
        ) : (
          <Accordion defaultActiveKey="0" flush>
            {courses.map((course, index) => (
              <Accordion.Item eventKey={index.toString()} key={course.course_id}>
                <Accordion.Header>
                  {course.course_code} - {course.course_name}
                  <span className="badge bg-primary ms-2">
                    {course.classes?.length || 0} class{course.classes?.length !== 1 ? 'es' : ''}
                  </span>
                </Accordion.Header>
                <Accordion.Body>
                  {course.classes && course.classes.length > 0 ? (
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Class</th>
                          <th>Lecturer</th>
                          <th>Venue</th>
                          <th>Schedule</th>
                          <th>Enrolled</th>
                        </tr>
                      </thead>
                      <tbody>
                        {course.classes.map(cls => (
                          <tr key={cls.class_id}>
                            <td>{cls.class_name}</td>
                            <td>{cls.lecturer_name || '—'}</td>
                            <td>{cls.venue || '—'}</td>
                            <td>{cls.scheduled_time || '—'}</td>
                            <td>{cls.total_registered_students || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No classes assigned yet.</p>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </div>

      {/* Reports Section */}
      <div className="mt-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="section-title">Lecturer Reports Requiring Feedback</h4>
          <button 
            className="btn btn-success btn-sm" 
            onClick={exportToExcel}
            disabled={loadingReports || reports.length === 0}
          >
            Export to Excel
          </button>
        </div>

        {loadingReports ? (
          <p>Loading reports...</p>
        ) : filteredReports.length === 0 ? (
          <p>No reports found.</p>
        ) : (
          filteredReports.map(report => (
            <div key={report.report_id} className="report-card card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <h5 className="card-title">{report.course_code} - {report.class_name}</h5>
                  <span className="course-badge">Week {report.week_of_reporting}</span>
                </div>
                <p className="card-text mt-2">
                  <strong>Lecturer:</strong> {report.lecturer_name || '—'} <br />
                  <strong>Date:</strong> {report.date_of_lecture || '—'} | <strong>Week:</strong> {report.week_of_reporting || '—'} <br />
                  <strong>Attendance:</strong> {report.actual_students_present || 0}/{report.total_registered_students || 0} <br />
                  <strong>Topic:</strong> {report.topic_taught || '—'} <br />
                  <strong>Outcomes:</strong> {report.learning_outcomes || '—'} <br />
                  <strong>Recommendations:</strong> {report.recommendations || '—'}
                  {report.prl_feedback && (
                    <><br /><strong>PRL Feedback:</strong> <em>{report.prl_feedback}</em></>
                  )}
                </p>

                <div className="feedback-section">
                  <label className="form-label"><strong>Add Feedback:</strong></label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={feedback[report.report_id] || ''}
                    onChange={(e) => handleFeedbackChange(report.report_id, e.target.value)}
                    placeholder="Enter your assessment..."
                  />
                  <button
                    className="btn btn-primary mt-2"
                    onClick={() => handleSubmitFeedback(report.report_id)}
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PRlDashboard;