import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ role }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/');
    window.location.reload();
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  if (!role) return null;
  const normalizedRole = role.toLowerCase();

  return (
    <header className="header">
      <img src="assets/images/logo.png" alt="Employee Tracker Logo" className="logo" />

      <div className="hamburger" onClick={toggleMenu}>
        {isOpen ? '✖' : '☰'}
      </div>

      <nav className={`nav-links ${isOpen ? 'open' : ''}`}>
        {normalizedRole === 'admin' && (
          <>
            <Link to="/admin-dashboard" onClick={toggleMenu}>Dashboard</Link>
            <Link to="/employees" onClick={toggleMenu}>Manage Employees</Link>
            <Link to="/leaves" onClick={toggleMenu}>Leave Requests</Link>
            <Link to="/daily-report" onClick={toggleMenu}>Reports</Link>
            <Link to="/calendar" onClick={toggleMenu}>Leave Calendar</Link>
          </>
        )}

        {normalizedRole === 'hr' && (
          <>
            <Link to="/hr-dashboard" onClick={toggleMenu}>Dashboard</Link>
            <Link to="/leaves" onClick={toggleMenu}>Manage Leaves</Link>
            <Link to="/employees" onClick={toggleMenu}>Manage Employees</Link>
            <Link to="/daily-report" onClick={toggleMenu}>Reports</Link>
          </>
        )}

        {normalizedRole === 'employee' && (
          <>
            <Link to="/employee-dashboard" onClick={toggleMenu}>Dashboard</Link>
            <Link to="/check-in-out" onClick={toggleMenu}>Check In/Out</Link>
            <Link to="/apply-leave" onClick={toggleMenu}>Apply Leave</Link>
            <Link to="/daily-report" onClick={toggleMenu}>Daily Report</Link>
            <Link to="/calendar" onClick={toggleMenu}>My Calendar</Link>
          </>
        )}

        <Link to="/" onClick={() => { handleLogout(); toggleMenu(); }}>Logout</Link>
      </nav>

      {isOpen && <div className="overlay" onClick={toggleMenu}></div>}
    </header>
  );
};

export default Header;
