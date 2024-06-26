import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import ElectionManagement from './ElectionManagement';
import CandidateManagement from './CandidateManagement'; 
import AdminDashboard from './AdminDashboard'; // Import the new component
import AdminNavbar from './AdminNavbar';

const AdminPanel = () => {
  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto mt-10">
        <Routes>
          <Route path="users" element={<UserManagement />} />
          <Route path="elections" element={<ElectionManagement />} />
          <Route path="candidates" element={<CandidateManagement />} />
          <Route path="dashboard" element={<AdminDashboard />} /> {/* Add the new route */}
          <Route path="*" element={<Navigate to="dashboard" />} />
        </Routes>
      </div>
    </>
  );
};

export default AdminPanel;
