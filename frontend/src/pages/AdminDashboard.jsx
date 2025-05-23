import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <>
    <img src="/assets/images/bgApplyleave.jpg" alt="background" className="background-leave-hr" />
    <div className="dashboard-container">
      <h1>👋 Welcome to Admin Dashboard</h1>
      <div className="dashboard-cards">
        <div className="card" onClick={() => navigate('/manage-users')}>
          <h3>Manage Users</h3>
          <button>Go to Manage Users</button>
        </div>
        <div className="card" onClick={() => navigate('/reports')}>
          <h3>Reports</h3>
          <button>View Reports</button>
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminDashboard;
