import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('hr');
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState('');

  const navigate = useNavigate(); // ✅ for redirecting after login

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isRegister
      ? 'http://localhost:8082/api/auth/register'
      : 'http://localhost:8082/api/auth/login';

    if (isRegister && password !== confirmPassword) {
      setMessage('Passwords do not match!');
      return;
    }

    const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);

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
        setMessage(data.message || 'Something went wrong');
      } else {
        setMessage(data.message);
        if (!isRegister) {
          localStorage.setItem('role', capitalizedRole); // ✅ store role
          onLogin(capitalizedRole); // ✅ simulate login
          navigate('/dashboard'); // ✅ redirect to dashboard after successful login
        } else {
          setIsRegister(false); // return to login
        }
      }
    } catch (error) {
      setMessage('Server error. Please try again later.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="image-container">
        <img src="/assets/images/login.jpg" alt="background" className="background-image" />
      </div>
      <div className="form-container">
        <div className="login-box">
        <img class="justify-center" src="assets/images/logo.png" alt="Employee Tracker Logo" className="logo" />
          <h2>{isRegister ? 'Register' : 'Login'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
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
                placeholder="Enter your password"
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
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label htmlFor="role">Select Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            <button type="submit" className="login-btn">
              {isRegister ? 'Register' : 'Login'}
            </button>
          </form>

          {message && <p className="response-message">{message}</p>}

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

export default LoginPage;
