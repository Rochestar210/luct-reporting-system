// frontend/src/App.js
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import RoleSelection from './pages/RoleSelection';
import StudentDashboard from './pages/StudentDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import PRlDashboard from './pages/PRlDashboard';
import PLDashboard from './pages/PLDashboard';
import ReportForm from './pages/ReportForm';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
        <Route path="/prl/dashboard" element={<PRlDashboard />} />
        <Route path="/pl/dashboard" element={<PLDashboard />} />
        <Route path="/lecturer/report" element={<ReportForm />} />
        <Route path="*" element={<RoleSelection />} />
      </Routes>
    </Router>
  );
}

export default App;