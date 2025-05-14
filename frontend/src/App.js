import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      setIsAuthenticated(true);
      setUserRole(storedRole);
    }
  }, []);

  const handleLogin = (role) => {
    localStorage.setItem('role', role);
    setUserRole(role);
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <DashboardLayout role={userRole}>
                <Dashboard />
              </DashboardLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/employees"
          element={
            isAuthenticated ? (
              <DashboardLayout role={userRole}>
                <Employees />
              </DashboardLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/leaves"
          element={
            isAuthenticated ? (
              <DashboardLayout role={userRole}>
                <Leaves />
              </DashboardLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/reports"
          element={
            isAuthenticated ? (
              <DashboardLayout role={userRole}>
                <Reports />
              </DashboardLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/calendar"
          element={
            isAuthenticated ? (
              <DashboardLayout role={userRole}>
                <Calendar />
              </DashboardLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
