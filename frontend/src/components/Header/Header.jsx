import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/');
    window.location.reload(); // Ensure App reinitializes role
  };

  // Show nothing if role is not available yet (prevents flicker)
  if (!role) return null;

  return (
    <header className="header">
      <img src="assets/images/logo.png" alt="Employee Tracker Logo" className="logo" />

      <nav className="nav-links">
        {/* Links for Admin */}
        {role === 'Admin' && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/employees">Manage Employees</Link>
            <Link to="/leaves">Leave Requests</Link>
            <Link to="/reports">Reports</Link>
            <Link to="/calendar">Leave Calendar</Link>
          </>
        )}

        {/* Links for HR */}
        {role === 'Hr' && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/attendance">Attendance</Link>
            <Link to="/leaves">Manage Leaves</Link>
            <Link to="/reports">Reports</Link>
          </>
        )}

        {/* Links for Employee */}
        {role === 'Employee' && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/checkin">Check In/Out</Link>
            <Link to="/leave-apply">Apply Leave</Link>
            <Link to="/work-report">Daily Report</Link>
            <Link to="/calendar">My Calendar</Link>
          </>
        )}
      </nav>

      <span className="logout-button" onClick={handleLogout}>
        Logout
      </span>
    </header>
  );
};

export default Header;
