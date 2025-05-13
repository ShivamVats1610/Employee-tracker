import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ role }) => {
  if (!role) return null;

  return (
    <header className="header">
      <h1 className="logo">Employee Tracker</h1>
      <nav className="nav-links">
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
        <Link to="/logout">Logout</Link>
      </nav>
    </header>
  );
};

export default Header;
