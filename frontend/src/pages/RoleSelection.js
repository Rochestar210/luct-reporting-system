import { Link } from 'react-router-dom';

const RoleSelection = () => {
 
  const styles = `
  body{
     background-color: gray;
    .auth-container {
      max-width: 600px;
      margin: 2.5rem auto;
    }
    .auth-card {
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
      text-align: center;
    }
    .auth-title {
      font-weight: 700;
      color: #4f46e5;
      margin-bottom: 1.5rem;
    }
    .role-btn {
      border: none;
      border-radius: 12px;
      padding: 1rem;
      font-weight: 600;
      font-size: 1.1rem;
      transition: all 0.2s ease;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .role-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .role-btn.student { background: linear-gradient(to right, #60a5fa, #3b82f6); color: white; }
    .role-btn.lecturer { background: linear-gradient(to right, #34d399, #10b981); color: white; }
    .role-btn.prl { background: linear-gradient(to right, #818cf8, #6366f1); color: white; }
    .role-btn.pl { background: linear-gradient(to right, #fbbf24, #f59e0b); color: #1f2937; }
    .register-link {
      color: #4f46e5;
      text-decoration: none;
      font-weight: 600;
    }
    .register-link:hover {
      text-decoration: underline;
    }
    @media (max-width: 576px) {
      .auth-card {
        padding: 1.5rem;
      }
      .role-btn {
        font-size: 1rem;
        padding: 0.8rem;
      }
    }
  `;

  return (
    <div className="container mt-5 auth-container">
      <style>{styles}</style>
      <div className="auth-card">
        <h2 className="auth-title">Welcome to LUCT Reporting System</h2>
        <p className="mt-3">Please select your role to continue:</p>
        
        <div className="d-grid gap-3 mt-4">
          <Link to="/login?role=student" className="btn role-btn student">
            Student
          </Link>
          <Link to="/login?role=lecturer" className="btn role-btn lecturer">
            Lecturer
          </Link>
          <Link to="/login?role=prl" className="btn role-btn prl">
            Principal Lecturer (PRL)
          </Link>
          <Link to="/login?role=pl" className="btn role-btn pl">
            Program Leader (PL)
          </Link>
        </div>

        <p className="mt-4 mb-0">
          New user? <Link to="/register" className="register-link">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;