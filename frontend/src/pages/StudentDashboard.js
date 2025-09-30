import React, { useState, useEffect } from 'react';
import UserHeader from '../components/UserHeader';
import RatingSection from '../components/RatingSection';

const StudentDashboard = () => {
  const [monitoringData, setMonitoringData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMonitoring = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'student') return;

      try {
        const response = await fetch(`http://localhost:5000/api/reports/student/monitoring?studentId=${user.id}`);
        const data = await response.json();
        setMonitoringData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch monitoring ', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonitoring();
  }, []);

  const filteredData = monitoringData.filter(report =>
    report.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.lecturer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const styles = `
     body{
     background-color: gray;
    .dashboard-container {
      max-width: 800px;
      padding: 1.5rem 0;
    }
    .monitoring-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 3px 10px rgba(0,0,0,0.06);
    }
    .report-row {
      padding: 0.75rem 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .report-row:last-child {
      border-bottom: none;
    }
    .section-title {
      font-weight: 700;
      color: #581c87;
      margin-bottom: 1.25rem;
    }
    .table th {
      background-color: #f5f3ff;
      font-weight: 600;
      color: #581c87;
    }
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem 0;
        max-width: 100%;
      }
    }
  `;

  return (
    <div className="container mt-4 dashboard-container">
      <style>{styles}</style>
      
      <UserHeader 
        onSearch={setSearchTerm}
        searchPlaceholder="Search courses or lecturers..."
      />
      
      <h2>Student Dashboard</h2>
      <p><strong>Modules:</strong> Monitoring, Rating</p>

      {/* Monitoring Section */}
      <div className="monitoring-card">
        <h4 className="section-title">🔍 Monitoring</h4>
        {loading ? (
          <p>Loading your classes and reports...</p>
        ) : filteredData.length === 0 ? (
          <p>No lecture reports match your search.</p>
        ) : (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Course</th>
                <th>Lecturer</th>
                <th>Last Report</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((report, i) => (
                <tr key={i} className="report-row">
                  <td>{report.course_code}</td>
                  <td>{report.lecturer_name}</td>
                  <td>{report.week_of_reporting} ({report.date_of_lecture})</td>
                  <td>{report.actual_students_present}/{report.total_registered_students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="monitoring-card mt-4">
        <RatingSection title="Rate Your Lecturer" />
      </div>
    </div>
  );
};

export default StudentDashboard;