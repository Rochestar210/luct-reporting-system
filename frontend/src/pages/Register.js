import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
 
  const urlParams = new URLSearchParams(location.search);
  const preselectedRole = urlParams.get('role') || 'student';

  const roleLabels = {
    student: 'Student',
    lecturer: 'Lecturer',
    prl: 'Principal Lecturer (PRL)',
    pl: 'Program Leader (PL)'
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: preselectedRole,
    faculty: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.role !== 'student' && !formData.faculty.trim()) {
      setMessage('Faculty is required for this role.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.error) {
        setMessage(data.error);
      } else {
        setMessage('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error. Please try again.');
    }
  };


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
      color: #4f46e5;
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
      border-color: #818cf8;
      box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.2);
      outline: none;
    }
    .btn-primary {
      background: linear-gradient(to right, #4f46e5, #7c3aed);
      border: none;
      padding: 0.75rem;
      font-weight: 600;
      border-radius: 10px;
      transition: opacity 0.2s;
    }
    .btn-primary:hover {
      opacity: 0.9;
    }
    .login-link {
      color: #4f46e5;
      text-decoration: none;
      font-weight: 600;
    }
    .login-link:hover {
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
        <h2 className="auth-title">Register</h2>
        {message && (
          <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'} mb-3`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              minLength="6"
              required
            />
          </div>

        
          <div className="mb-3">
            <label className="form-label">Role</label>
            <input
              type="text"
              className="form-control"
              value={roleLabels[formData.role] || formData.role}
              readOnly
            />
            <input type="hidden" name="role" value={formData.role} />
          </div>

          {(formData.role === 'lecturer' || formData.role === 'prl' || formData.role === 'pl') && (
            <div className="mb-3">
              <label className="form-label">Faculty</label>
              <input
                type="text"
                className="form-control"
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                placeholder="e.g., Faculty of ICT"
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100">Register</button>
        </form>

        <div className="text-center mt-3">
          <small>
            Already have an account?{' '}
            <a href="/login" className="login-link">
              Login here
            </a>
          </small>
        </div>
      </div>
    </div>
  );
};

export default Register;