// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Get expected role from URL query (?role=student)
  const urlParams = new URLSearchParams(location.search);
  const expectedRole = urlParams.get('role') || 'student';

  const roleLabels = {
    student: 'Student',
    lecturer: 'Lecturer',
    prl: 'Principal Lecturer',
    pl: 'Program Leader'
  };

  const roleColors = {
    student: '#3b82f6',
    lecturer: '#10b981',
    prl: '#6366f1',
    pl: '#f59e0b'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.token) {
        // ✅ Validate role matches expected role
        if (data.user.role !== expectedRole) {
          setMessage(`❌ No such ${expectedRole} account. Please log in with a valid ${expectedRole.toLowerCase()} email.`);
          return;
        }

        // Save and redirect
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate(`/${data.user.role}/dashboard`);
      } else {
        setMessage(data.error || 'Login failed. Invalid credentials.');
      }
    } catch (err) {
      setMessage('❌ Network error. Is the backend running?');
    }
  };

  // ✅ Internal CSS
  const styles = `
    .auth-container {
      max-width: 500px;
      margin: 2.5rem auto;
    }
    .auth-card {
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    }
    .auth-title {
      font-weight: 700;
      text-align: center;
      margin-bottom: 1.5rem;
      color: ${roleColors[expectedRole]};
    }
    .form-control {
      border: 1px solid #d1d5db;
      border-radius: 10px;
      padding: 0.75rem;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    .form-control:focus {
      border-color: ${roleColors[expectedRole]};
      box-shadow: 0 0 0 3px ${roleColors[expectedRole]}33;
      outline: none;
    }
    .btn-primary {
      background: linear-gradient(to right, ${roleColors[expectedRole]}, ${roleColors[expectedRole]}dd);
      border: none;
      padding: 0.75rem;
      font-weight: 600;
      border-radius: 10px;
      width: 100%;
      transition: opacity 0.2s;
    }
    .btn-primary:hover {
      opacity: 0.9;
    }
    .register-link {
      color: ${roleColors[expectedRole]};
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
    }
  `;

  return (
    <div className="container mt-5 auth-container">
      <style>{styles}</style>
      <div className="auth-card">
        <h2 className="auth-title">Login as {roleLabels[expectedRole]}</h2>
        {message && <div className="alert alert-danger mb-3">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
        <p className="mt-3 text-center">
          Don't have an account?{' '}
          <Link to={`/register?role=${expectedRole}`} className="register-link">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;