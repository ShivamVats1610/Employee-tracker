import React from 'react';
import { useNavigate } from 'react-router-dom';

const HrDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <h1>👋 Welcome to HR Dashboard</h1>
      <div className="dashboard-cards">
        <div className="card" onClick={() => navigate('/leaves')}>
          <h3>Leave Requests</h3>
          <button>View Leave Requests</button>
        </div>
        <div className="card" onClick={() => navigate('/employees')}>
          <h3>Employee Records</h3>
          <button>View Employee Records</button>
        </div>
        <div className="card" onClick={() => navigate('/reports')}>
          <h3>Employees Reports</h3>
          <button>View Employees reports</button>
        </div>
      </div>
    </div>
  );
};

export default HrDashboard;
