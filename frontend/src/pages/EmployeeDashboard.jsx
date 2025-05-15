import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeDashboard.css';

const EmployeeDashboard = ({
  summary = { workingDaysThisMonth: 0, currentMonthLeaves: 0, totalLeaves: 0 },
  checkInStatus = false,
  checkOutStatus = false,
  reports = [],
}) => {
  const navigate = useNavigate();

  // Quick stats for dashboard
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  const completedTasks = reports.filter(r => r.status === 'completed').length;
  const pendingTasks = reports.filter(r => r.status === 'pending').length;

  return (
    <>
  <img src="/assets/images/bgApplyleave.jpg" alt="background" className="background-emp-dashboard" />
    <div className="dashboard-container">
      <h1>👋 Welcome to Dashboard</h1>

      <div className="dashboard-cards">

        <div className="card" onClick={() => navigate('/calendar')}>
          <h3>Attendance Summary ({currentMonth})</h3>
          <p><strong>Working Days:</strong> {summary.workingDaysThisMonth}</p>
          <p><strong>Leaves:</strong> {summary.currentMonthLeaves}</p>
          <p><strong>Total Leaves:</strong> {summary.totalLeaves}</p>
          <button>View Details</button>
        </div>

        <div className="card" onClick={() => navigate('/check-in-out')}>
          <h3>Check In/Out Status</h3>
          <p>Status: {checkInStatus ? 'Checked In ✅' : 'Not Checked In ❌'}</p>
          <p>Status: {checkOutStatus ? 'Checked Out ✅' : 'Not Checked Out ❌'}</p>
          <button>Go to Check In/Out</button>
        </div>

        <div className="card" onClick={() => navigate('/daily-report')}>
          <h3>Daily Tasks Summary</h3>
          <p>Completed Tasks: {completedTasks}</p>
          <p>Pending Tasks: {pendingTasks}</p>
          <button>View Tasks</button>
        </div>

      </div>
    </div>
    </>
  );
};

export default EmployeeDashboard;
