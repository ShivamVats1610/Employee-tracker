import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✅ Added Link import
import './Header.css';

const Header = ({ role }) => {
  const navigate = useNavigate();

  if (!role) return null;

  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/');
    window.location.reload(); // reload to reset role in App.js
  };

  return (
    <header className="header">
      <h1 className="logo">Employee Tracker</h1>
      <nav className="nav-links">
        {/* Conditional links by role */}
        {role === 'admin' && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/employees">Manage Employees</Link>
            <Link to="/leaves">Leave Requests</Link>
            <Link to="/reports">Reports</Link>
            <Link to="/calendar">Leave Calendar</Link>
          </>
        )}
        {role === 'hr' && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/attendance">Attendance</Link>
            <Link to="/leaves">Manage Leaves</Link>
            <Link to="/reports">Reports</Link>
          </>
        )}
        {role === 'employee' && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/checkin">Check In/Out</Link>
            <Link to="/leave-apply">Apply Leave</Link>
            <Link to="/work-report">Daily Report</Link>
            <Link to="/calendar">My Calendar</Link>
          </>
        )}
        <span onClick={handleLogout} className="logout-button">
  Logout
</span>
      </nav>
    </header>
  );
};

export default Header;
