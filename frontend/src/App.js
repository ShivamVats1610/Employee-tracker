import React, { useState } from 'react';
import LoginPage from './pages/Login/LoginPage'; // Import LoginPage
import './App.css'; // Import global CSS

function App() {
  const [role, setRole] = useState(null); // Store role in state

  const handleLogin = (selectedRole) => {
    setRole(selectedRole);
    localStorage.setItem('role', selectedRole); // Save role in localStorage
  };

  return (
    <div className="app-container">
      {/* Show only the LoginPage */}
      <LoginPage onLogin={handleLogin} />
    </div>
  );
}

export default App;
