import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './components/Login/LoginPage.jsx';
import DashboardLayout from './Layouts/DashboardLayout.jsx';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Leaves from './pages/Leaves';
import Reports from './pages/Reports';
import Calendar from './pages/Calendar';


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardLayout><Dashboard /></DashboardLayout> : <Navigate to="/" />}
        />
        <Route
          path="/employees"
          element={isAuthenticated ? <DashboardLayout><Employees /></DashboardLayout> : <Navigate to="/" />}
        />
        <Route
          path="/leaves"
          element={isAuthenticated ? <DashboardLayout><Leaves /></DashboardLayout> : <Navigate to="/" />}
        />
        <Route
          path="/reports"
          element={isAuthenticated ? <DashboardLayout><Reports /></DashboardLayout> : <Navigate to="/" />}
        />
        <Route
          path="/calendar"
          element={isAuthenticated ? <DashboardLayout><Calendar /></DashboardLayout> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
