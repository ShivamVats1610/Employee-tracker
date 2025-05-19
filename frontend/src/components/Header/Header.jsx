import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ role }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [username, setUsername] = useState('');
  const [profileImg, setProfileImg] = useState('assets/images/default-avatar.jpg');
  const profileRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedProfileImg = localStorage.getItem('profileImg');

    if (storedUsername) setUsername(storedUsername);
    if (storedProfileImg) {
      const cleanPath = storedProfileImg.replace("http://localhost:8082/api/uploads/", "");
      setProfileImg(cleanPath);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        navRef.current &&
        !navRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  if (!role) return null;
  const normalizedRole = role.toLowerCase();

  const getFullImagePath = (imgPath) => {
    if (!imgPath) return 'assets/images/default-avatar.jpg';
    return imgPath.startsWith('http') ? imgPath : `http://localhost:8082/api/uploads/${imgPath}`;
  };

  return (
    <header className="header">
      <img src="assets/images/logo.png" alt="Employee Tracker Logo" className="logo" />

      <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✖' : '☰'}
      </div>

      <nav className={`nav-links ${isOpen ? 'open' : ''}`} ref={navRef}>
        {normalizedRole === 'admin' && (
          <>
            <Link to="/admin-dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
            <Link to="/employees" onClick={() => setIsOpen(false)}>Manage Employees</Link>
            <Link to="/leaves" onClick={() => setIsOpen(false)}>Leave Requests</Link>
            <Link to="/reports" onClick={() => setIsOpen(false)}>Reports</Link>
            <Link to="/calendar" onClick={() => setIsOpen(false)}>Leave Calendar</Link>
          </>
        )}

        {normalizedRole === 'hr' && (
          <>
            <Link to="/hr-dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
            <Link to="/leaves" onClick={() => setIsOpen(false)}>Manage Leaves</Link>
            <Link to="/employees" onClick={() => setIsOpen(false)}>Manage Employees</Link>
            <Link to="/reports" onClick={() => setIsOpen(false)}>Reports</Link>
          </>
        )}

        {normalizedRole === 'employee' && (
          <>
            <Link to="/employee-dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
            <Link to="/check-in-out" onClick={() => setIsOpen(false)}>Check In/Out</Link>
            <Link to="/apply-leave" onClick={() => setIsOpen(false)}>Apply Leave</Link>
            <Link to="/daily-report" onClick={() => setIsOpen(false)}>Daily Report</Link>
            <Link to="/calendar" onClick={() => setIsOpen(false)}>My Calendar</Link>
          </>
        )}

        <div
          ref={profileRef}
          className="profile-dropdown"
          onClick={() => setShowProfileMenu(prev => !prev)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <img src={getFullImagePath(profileImg)} alt="Profile" className="profile-img" />
          <span className="profile-name">{username || 'User'}</span>

          {showProfileMenu && (
            <div className="dropdown-menu">
              <div className="profile-info">
                <img src={getFullImagePath(profileImg)} alt="Avatar" />
                <span>{username}</span>
              </div>
              <Link to="/edit-profile" onClick={() => { setShowProfileMenu(false); setIsOpen(false); }}>Edit Profile</Link>
              <span className="logout-btn" onClick={handleLogout}>Logout</span>
            </div>
          )}
        </div>
      </nav>

      {isOpen && <div className="overlay"></div>}
    </header>
  );
};

export default Header;
