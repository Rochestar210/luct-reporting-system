import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserHeader = ({ onSearch, searchPlaceholder = "Search..." }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const roleMap = {
    student: 'Student',
    lecturer: 'Lecturer',
    prl: 'Principal Lecturer',
    pl: 'Program Leader'
  };

  return (
    <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light border rounded">
      <div>
        <strong>{user.name}</strong> – {roleMap[user.role] || user.role}
        {user.faculty && ` from ${user.faculty}`}
      </div>
      
      {/* ✅ Global Search Bar */}
      {onSearch ? (
        <div className="d-flex align-items-center gap-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch(e.target.value)}
            style={{ width: '250px' }}
            aria-label="Search"
          />
          <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
            Logout
          </button>
        </div>
      ) : (
        <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
          Logout
        </button>
      )}
    </div>
  );
};

export default UserHeader;