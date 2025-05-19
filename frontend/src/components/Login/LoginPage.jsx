import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SnackbarProvider, useSnackbar } from 'notistack';
import './LoginPage.css';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('hr');
  const [isRegister, setIsRegister] = useState(false);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);

    if (!username.trim() || !password.trim() || (isRegister && !confirmPassword.trim())) {
      enqueueSnackbar('All fields are required!', { variant: 'error' });
      return;
    }

    if (isRegister && password !== confirmPassword) {
      enqueueSnackbar('Passwords do not match!', { variant: 'error' });
      return;
    }

    const url = isRegister
      ? 'http://localhost:8082/api/auth/register'
      : 'http://localhost:8082/api/auth/login';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role: capitalizedRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        enqueueSnackbar(data.message || 'Something went wrong', { variant: 'error' });
      } else {
        enqueueSnackbar(data.message, { variant: 'success' });

        if (!isRegister) {
          // Save basic info
          localStorage.setItem('id', data.user._id);
          localStorage.setItem('role', data.user.role);

          // Fetch full profile info after login
          const profileRes = await fetch(`http://localhost:8082/api/auth/profile/${data.user._id}`);
          const profileData = await profileRes.json();

          // Save profile info to localStorage for persistence
          localStorage.setItem('username', profileData.name || data.user.username);
          if (profileData.profileImage) {
            localStorage.setItem('profileImg', `http://localhost:8082/api/uploads/${profileData.profileImage}`);
          } else {
            localStorage.setItem('profileImg', '/assets/images/default-avatar.jpg');
          }

          onLogin(data.user.role);
          navigate('/dashboard');
        } else {
          setIsRegister(false);
        }
      }
    } catch (error) {
      enqueueSnackbar('Server error. Please try again later.', { variant: 'error' });
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <div className="image-container">
        <img src="/assets/images/login.jpg" alt="background" className="background-image" />
      </div>
      <div className="form-container">
        <div className="login-box">
          <div className="logo-wrapper">
            <img src="/assets/images/logo.png" alt="Employee Tracker Logo" className="logo" />
          </div>
          <h2>{isRegister ? 'Register' : 'Login'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {isRegister && (
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label htmlFor="role">Select Role</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            <button type="submit" className="login-btn">
              {isRegister ? 'Register' : 'Login'}
            </button>
          </form>

          <div className="toggle-text">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span onClick={() => setIsRegister(!isRegister)} className="link-text">
              {isRegister ? 'Login' : 'Register'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginPage = (props) => (
  <SnackbarProvider
    maxSnack={3}
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    autoHideDuration={3000}
  >
    <LoginForm {...props} />
  </SnackbarProvider>
);

export default LoginPage;
