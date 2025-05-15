// MainApp.js
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './components/Login/LoginPage.jsx';
import DashboardLayout from './Layouts/DashboardLayout.jsx';
import Employees from './pages/Employees';
import Leaves from './pages/Leaves';
import Reports from './pages/DailyReportPage';
import Calendar from './pages/CalendarPage.jsx';
import CheckInOutPage from './pages/CheckInOutPage.jsx';
import ApplyLeavePage from './pages/ApplyLeavePage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard.jsx';
import HRDashboard from './pages/HrDashboard.jsx';

const MainApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      setIsAuthenticated(true);
      setUserRole(storedRole.toLowerCase());
    }
  }, []);

  const handleLogin = (role) => {
    const normalizedRole = role.toLowerCase();
    localStorage.setItem('role', normalizedRole);
    setUserRole(normalizedRole);
    setIsAuthenticated(true);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            userRole === 'admin' ? (
              <Navigate to="/admin-dashboard" replace />
            ) : userRole === 'hr' ? (
              <Navigate to="/hr-dashboard" replace />
            ) : userRole === 'employee' ? (
              <Navigate to="/employee-dashboard" replace />
            ) : (
              <Navigate to="/unauthorized" replace />
            )
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        }
      />

      <Route
        path="/admin-dashboard"
        element={
          isAuthenticated && userRole === 'admin' ? (
            <DashboardLayout role="admin">
              <AdminDashboard />
            </DashboardLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/hr-dashboard"
        element={
          isAuthenticated && userRole === 'hr' ? (
            <DashboardLayout role="hr">
              <HRDashboard />
            </DashboardLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/employee-dashboard"
        element={
          isAuthenticated && userRole === 'employee' ? (
            <DashboardLayout role="employee">
              <EmployeeDashboard />
            </DashboardLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/check-in-out"
        element={
          isAuthenticated ? (
            <DashboardLayout role={userRole}>
              <CheckInOutPage />
            </DashboardLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/apply-leave"
        element={
          isAuthenticated ? (
            <DashboardLayout role={userRole}>
              <ApplyLeavePage />
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
        path="/daily-report"
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

      <Route path="/unauthorized" element={<h2>Unauthorized Access</h2>} />
    </Routes>
  );
};

export default MainApp;
