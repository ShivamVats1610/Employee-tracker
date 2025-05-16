import React, { useState, useEffect } from 'react'; // <-- Add useEffect
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ role }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [username, setUsername] = useState('');
  const [profileImg, setProfileImg] = useState('assets/images/default-avatar.png');

  useEffect(() => {
    // Load data from localStorage when component mounts
    const storedUsername = localStorage.getItem('username');
    const storedProfileImg = localStorage.getItem('profileImg');
    if (storedUsername) setUsername(storedUsername);
    if (storedProfileImg) setProfileImg(storedProfileImg);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('profileImg');
    navigate('/');
    window.location.reload();
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleProfileMenu = () => setShowProfileMenu(!showProfileMenu);

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

        <div className="profile-dropdown" onClick={toggleProfileMenu} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={profileImg} alt="Profile" className="profile-img" />
          <span className="profile-name">{username || 'User'}</span>

          {showProfileMenu && (
            <div className="dropdown-menu">
              <div className="profile-info">
                <img src={profileImg} alt="Avatar" />
                <span>{username}</span>
              </div>
              <Link to="/edit-profile" onClick={toggleMenu}>Edit Profile</Link>
              <span className="logout-btn" onClick={handleLogout}>Logout</span>
            </div>
          )}
        </div>
      </nav>

      {isOpen && <div className="overlay" onClick={toggleMenu}></div>}
    </header>
  );
};

export default Header;
