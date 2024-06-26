import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [jsonFile, setJsonFile] = useState(null);
  const { authData } = useContext(AuthContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users', {
          headers: { 'x-auth-token': authData.token }
        });
        setUsers(response.data);
      } catch (error) {
        toast.error('Failed to fetch users');
        console.error(error);
      }
    };

    fetchUsers();
  }, [authData]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole }, {
        headers: { 'x-auth-token': authData.token }
      });
      setUsers(users.map(user => user._id === userId ? { ...user, role: newRole } : user));
      toast.success('User role updated successfully');
    } catch (error) {
      toast.error('Failed to update user role');
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`, {
        headers: { 'x-auth-token': authData.token }
      });
      setUsers(users.filter(user => user._id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
      console.error(error);
    }
  };

  const handleFileChange = (e) => {
    setJsonFile(e.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!jsonFile) {
      toast.error('Please select a file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const users = JSON.parse(event.target.result);

        await api.post('/admin/users/import', users, {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': authData.token
          }
        });
        toast.success('Users imported successfully');
        // Refresh user list after import
        const response = await api.get('/users', {
          headers: { 'x-auth-token': authData.token }
        });
        setUsers(response.data);
      } catch (error) {
        toast.error('Failed to import users');
        console.error(error);
      }
    };
    reader.readAsText(jsonFile);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-3xl mb-6">User Management</h2>
      <form onSubmit={handleFileUpload}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Import Users
          </label>
          <input type="file" accept=".json" onChange={handleFileChange} />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Upload
        </button>
      </form>
      <table className="table-auto w-full mt-6">
        <thead>
          <tr>
            <th className="px-4 py-2">Username</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td className="border px-4 py-2">{user.username}</td>
              <td className="border px-4 py-2">{user.role}</td>
              <td className="border px-4 py-2">
                {user.role !== 'admin' && (
                  <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleRoleChange(user._id, 'admin')}
                  >
                    Promote to Admin
                  </button>
                )}
                {user.role === 'admin' && (
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleRoleChange(user._id, 'user')}
                  >
                    Demote to User
                  </button>
                )}
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
                  onClick={() => handleDeleteUser(user._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
