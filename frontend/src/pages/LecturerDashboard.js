// frontend/src/pages/LecturerDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserHeader from '../components/UserHeader';

const LecturerDashboard = () => {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [classes, setClasses] = useState([]);
  const [monitoringData, setMonitoringData] = useState({ reports: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [reportSearch, setReportSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'lecturer' || !user.id) {
        setLoading(false);
        return;
      }

      try {
        const ratingsRes = await fetch(`http://localhost:5000/api/rating/lecturer?lecturerId=${user.id}`);
        const ratingsData = await ratingsRes.json();
        setRatings(Array.isArray(ratingsData.ratings) ? ratingsData.ratings : []);
        setAverageRating(ratingsData.average || 0);

        const classesRes = await fetch(`http://localhost:5000/api/reports/lecturer/classes?lecturerId=${user.id}`);
        const classesData = await classesRes.json();
        setClasses(Array.isArray(classesData) ? classesData : []);

        const monitoringRes = await fetch(`http://localhost:5000/api/reports/lecturer/monitoring?lecturerId=${user.id}`);
        const monitoringData = await monitoringRes.json();
        setMonitoringData(monitoringData);
      } catch (err) {
        console.error('Failed to fetch ', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredClasses = classes.filter(cls =>
    cls.course_code.toLowerCase().includes(reportSearch.toLowerCase()) ||
    cls.class_name.toLowerCase().includes(reportSearch.toLowerCase())
  );

  const filteredReports = monitoringData.reports?.filter(report =>
    report.course_code.toLowerCase().includes(reportSearch.toLowerCase()) ||
    report.topic_taught.toLowerCase().includes(reportSearch.toLowerCase())
  ) || [];


  const styles = `
  body{
     background-color: gray;
     }
    .dashboard-container {
      padding: 1.5rem 0;
    }
    .section-title {
      font-weight: 700;
      color: #0c4a6e;
      margin: 1.5rem 0 1rem;
    }
    .stats-card {
      background: white;
      border-radius: 10px;
      padding: 1.25rem;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border-top: 3px solid #10b981;
    }
    .rating-item {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 0.75rem;
      background: #f8fafc;
    }
    .btn-action {
      background: linear-gradient(to right, #10b981, #059669);
      border: none;
    }
    .table th {
      background-color: #f1f5f9;
      font-weight: 600;
    }
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem 0;
      }
      .stats-card {
        margin-bottom: 1rem;
      }
    }
  `;

  return (
    <div className="container mt-4 dashboard-container">
      <style>{styles}</style>
      
      <UserHeader 
        onSearch={setReportSearch}
        searchPlaceholder="Search classes or reports..."
      />
      
      <h2>Lecturer Dashboard</h2>
      <p><strong>Modules:</strong> Classes, Reports, Monitoring, Rating</p>

      <div className="mt-4">
        <h4 className="section-title">📊 Actions</h4>
        <div className="d-grid gap-2 d-md-flex">
          <Link to="/lecturer/report" className="btn btn-success btn-action me-md-2">
            📝 Submit Weekly Report
          </Link>
        </div>
      </div>

      {/* Classes Section */}
      <div className="mt-5">
        <h4 className="section-title">My Assigned Classes</h4>
        {loading ? (
          <p>Loading your classes...</p>
        ) : filteredClasses.length === 0 ? (
          <div className="alert alert-info">
            No classes match your search.
          </div>
        ) : (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Course</th>
                <th>Class</th>
                <th>Venue</th>
                <th>Schedule</th>
                <th>Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map(cls => (
                <tr key={cls.class_id}>
                  <td>{cls.course_code}</td>
                  <td>{cls.class_name}</td>
                  <td>{cls.venue}</td>
                  <td>{cls.scheduled_time}</td>
                  <td>{cls.total_registered_students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Monitoring Section */}
      <div className="mt-5">
        <h4 className="section-title">Monitoring</h4>
        {loading ? (
          <p>Loading monitoring data...</p>
        ) : monitoringData.stats?.totalReports === 0 ? (
          <p>No reports submitted yet.</p>
        ) : (
          <>
            <div className="row mb-3">
              <div className="col-md-3">
                <div className="stats-card">
                  <h5>Total Reports</h5>
                  <p className="display-6">{monitoringData.stats.totalReports}</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stats-card">
                  <h5>Avg Attendance</h5>
                  <p className="display-6">{monitoringData.stats.avgAttendance}</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stats-card">
                  <h5>Min Attendance</h5>
                  <p className="display-6">{monitoringData.stats.minAttendance}</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stats-card">
                  <h5>Max Attendance</h5>
                  <p className="display-6">{monitoringData.stats.maxAttendance}</p>
                </div>
              </div>
            </div>

            <h5 className="mt-4">Recent Reports</h5>
            {filteredReports.length === 0 ? (
              <p>No reports match your search.</p>
            ) : (
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Course</th>
                    <th>Attendance</th>
                    <th>Topic</th>
                    <th>PRL Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map(report => (
                    <tr key={report.report_id}>
                      <td>{report.date_of_lecture}</td>
                      <td>{report.course_code}</td>
                      <td>{report.actual_students_present}</td>
                      <td>{report.topic_taught}</td>
                      <td>
                        {report.prl_feedback ? (
                          <span className="text-success">✓ Received</span>
                        ) : (
                          <span className="text-warning">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* Ratings Section */}
      <div className="mt-5">
        <h4 className="section-title">Your Ratings</h4>
        {loading ? (
          <p>Loading your ratings...</p>
        ) : (
          <>
            <p>Average Rating: <strong>{averageRating} / 5</strong> from {ratings.length} review(s)</p>
            {ratings.length === 0 ? (
              <div className="alert alert-info">
                No ratings yet. Students and staff will rate your performance after submitting reports.
              </div>
            ) : (
              <div className="list-group">
                {ratings.map((rating, i) => (
                  <div key={i} className="rating-item">
                    <div className="d-flex align-items-center">
                      {[...Array(5)].map((_, star) => (
                        <span 
                          key={star} 
                          className={`me-1 ${star < rating.rating_value ? 'text-warning' : 'text-muted'}`}
                        >
                          ★
                        </span>
                      ))}
                      <small className="ms-2 text-muted">
                        by {rating.rated_by_name} ({rating.rated_by_role})
                      </small>
                    </div>
                    {rating.comment && (
                      <p className="mb-0 mt-2 text-muted fst-italic">"{rating.comment}"</p>
                    )}
                    <small className="text-muted">{new Date(rating.created_at).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LecturerDashboard;