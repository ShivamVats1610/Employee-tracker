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
import EditProfile from './components/EditProfile/EditProfile';
import AllReportsPage from './pages/ReportsPage';
import FaceCheckIn from './components/FaceCheckIn';

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

  const renderDashboard = (component) => (
    <DashboardLayout role={userRole}>{component}</DashboardLayout>
  );

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
          isAuthenticated && userRole === 'admin'
            ? renderDashboard(<AdminDashboard />)
            : <Navigate to="/" replace />
        }
      />

      <Route
        path="/hr-dashboard"
        element={
          isAuthenticated && userRole === 'hr'
            ? renderDashboard(<HRDashboard />)
            : <Navigate to="/" replace />
        }
      />

      <Route
        path="/employee-dashboard"
        element={
          isAuthenticated && userRole === 'employee'
            ? renderDashboard(<EmployeeDashboard />)
            : <Navigate to="/" replace />
        }
      />

      <Route
        path="/edit-profile"
        element={
          isAuthenticated ? (
            <EditProfile userRole={userRole} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/check-in-out"
        element={
          isAuthenticated ? renderDashboard(<CheckInOutPage />) : <Navigate to="/" replace />
        }
      />

      <Route
        path="/apply-leave"
        element={
          isAuthenticated ? renderDashboard(<ApplyLeavePage />) : <Navigate to="/" replace />
        }
      />

      <Route
        path="/employees"
        element={
          isAuthenticated && (userRole === 'admin' || userRole === 'hr')
            ? renderDashboard(<Employees />)
            : <Navigate to="/unauthorized" replace />
        }
      />

      <Route
        path="/leaves"
        element={isAuthenticated ? renderDashboard(<Leaves />) : <Navigate to="/" replace />}
      />

      <Route
        path="/daily-report"
        element={isAuthenticated ? renderDashboard(<Reports />) : <Navigate to="/" replace />}
      />

      <Route
        path="/reports"
        element={
          isAuthenticated && (userRole === 'admin' || userRole === 'hr')
            ? renderDashboard(<AllReportsPage />)
            : <Navigate to="/unauthorized" replace />
        }
      />

      <Route
        path="/calendar"
        element={isAuthenticated ? renderDashboard(<Calendar />) : <Navigate to="/" replace />}
      />

      {/* FaceCheckIn Route */}
      <Route
        path="/face-checkin"
        element={isAuthenticated ? renderDashboard(<FaceCheckIn />) : <Navigate to="/" replace />}
      />

      <Route path="/unauthorized" element={<h2>Unauthorized Access</h2>} />

      {/* Catch-all 404 */}
      <Route path="*" element={<h2>Page Not Found</h2>} />
    </Routes>
  );
};

export default MainApp;
