import React from 'react';
import './Dashboard.css';

const Dashboard = ({ role }) => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Welcome to the {role} Dashboard</h2>
      <p>This is where you can access your features.</p>
    </div>
  );
};

export default Dashboard;
