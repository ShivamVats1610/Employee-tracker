// src/layouts/DashboardLayout.jsx
import React from 'react';
import Header from '../components/Header/Header';

const DashboardLayout = ({ children }) => {
  const role = localStorage.getItem('role'); // ✅ Get role from storage

  return (
    <div>
      <Header role={role} /> {/* ✅ Pass role */}
      <main>{children}</main>
    </div>
  );
};

export default DashboardLayout;
