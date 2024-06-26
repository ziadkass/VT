import React from 'react';
import { Link } from 'react-router-dom';

const AdminNavbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between">
        <div className="text-white text-lg font-bold">Admin Panel</div>
        <div className="flex space-x-4">
          <Link to="/admin/users" className="text-white hover:text-gray-400">Users</Link>
          <Link to="/admin/elections" className="text-white hover:text-gray-400">Elections</Link>
          <Link to="/admin/candidates" className="text-white hover:text-gray-400">Candidates</Link>
          <Link to="/admin/dashboard" className="text-white hover:text-gray-400">Dashboard</Link>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
