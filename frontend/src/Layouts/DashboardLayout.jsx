// DashboardLayout.jsx
import React from 'react';
import Header from '../components/Header/Header';

const DashboardLayout = ({ children, role }) => {
  return (
    <div>
      <Header role={role} />
      <main>{children}</main>
    </div>
  );
};

export default DashboardLayout;
