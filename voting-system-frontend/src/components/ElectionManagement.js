import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const ElectionManagement = () => {
  const [elections, setElections] = useState([]);
  const [jsonFile, setJsonFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentElection, setCurrentElection] = useState(null);
  const [formData, setFormData] = useState({
    election_name: '',
    start_date: '',
    end_date: ''
  });
  const { authData } = useContext(AuthContext);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await api.get('/elections/all', {
          headers: { 'x-auth-token': authData.token }
        });
        setElections(response.data);
      } catch (error) {
        toast.error('Failed to fetch elections');
        console.error(error);
      }
    };

    fetchElections();
  }, [authData]);

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
        const elections = JSON.parse(event.target.result);

        await api.post('/admin/elections/import', elections, {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': authData.token
          }
        });
        toast.success('Elections imported successfully');
      } catch (error) {
        toast.error('Failed to import elections');
        console.error(error);
      }
    };
    reader.readAsText(jsonFile);
  };

  const handleDeleteElection = async (electionId) => {
    try {
      await api.delete(`/elections/${electionId}`, {
        headers: { 'x-auth-token': authData.token }
      });
      setElections(elections.filter(election => election._id !== electionId));
      toast.success('Election deleted successfully');
    } catch (error) {
      toast.error('Failed to delete election');
      console.error(error);
    }
  };

  const handleEditElection = (election) => {
    setIsEditing(true);
    setCurrentElection(election);
    setFormData({
      election_name: election.election_name,
      start_date: election.start_date.split('T')[0],
      end_date: election.end_date.split('T')[0]
    });
  };

  const handleUpdateElection = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/elections/${currentElection._id}`, formData, {
        headers: { 'x-auth-token': authData.token }
      });
      setElections(elections.map(election => 
        election._id === currentElection._id ? { ...election, ...formData } : election
      ));
      toast.success('Election updated successfully');
      setIsEditing(false);
      setCurrentElection(null);
    } catch (error) {
      toast.error('Failed to update election');
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-3xl mb-6">Election Management</h2>
      {isEditing && (
        <form onSubmit={handleUpdateElection} className="mb-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Election Name
            </label>
            <input
              type="text"
              name="election_name"
              value={formData.election_name}
              onChange={handleInputChange}
              className="border rounded py-2 px-4"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              className="border rounded py-2 px-4"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              className="border rounded py-2 px-4"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Update
          </button>
        </form>
      )}
      {!isEditing && (
        <form onSubmit={handleFileUpload} className="mb-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Import Elections
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
      )}
      <table className="table-auto w-full mt-6">
        <thead>
          <tr>
            <th className="px-4 py-2">Election Name</th>
            <th className="px-4 py-2">Start Date</th>
            <th className="px-4 py-2">End Date</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {elections.map(election => (
            <tr key={election._id}>
              <td className="border px-4 py-2">{election.election_name}</td>
              <td className="border px-4 py-2">{new Date(election.start_date).toLocaleDateString()}</td>
              <td className="border px-4 py-2">{new Date(election.end_date).toLocaleDateString()}</td>
              <td className="border px-4 py-2">
                <button
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => handleEditElection(election)}
                >
                  Edit
                </button>
                <button
                  className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => handleDeleteElection(election._id)}
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

export default ElectionManagement;
