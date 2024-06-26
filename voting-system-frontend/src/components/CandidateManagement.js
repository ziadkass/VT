import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const CandidateManagement = () => {
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [newElectionId, setNewElectionId] = useState(''); // New state for the new election ID
  const [formData, setFormData] = useState({
    candidate_name: '',
    party: '',
    image_url: ''
  });
  const [editCandidateId, setEditCandidateId] = useState(null);
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

  useEffect(() => {
    if (selectedElection) {
      const fetchCandidates = async () => {
        try {
          const response = await api.get(`/candidates/${selectedElection}`, {
            headers: { 'x-auth-token': authData.token }
          });
          setCandidates(response.data);
        } catch (error) {
          toast.error('Failed to fetch candidates');
          console.error(error);
        }
      };

      fetchCandidates();
    }
  }, [selectedElection, authData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAddOrUpdateCandidate = async (e) => {
    e.preventDefault();
    try {
      if (editCandidateId) {
        const response = await api.put(`/admin/candidates/${selectedElection}/${editCandidateId}`, {
          ...formData,
          election_id: newElectionId || selectedElection
        }, {
          headers: { 'x-auth-token': authData.token }
        });
        setCandidates(candidates.map(candidate => candidate._id === editCandidateId ? response.data : candidate));
        toast.success('Candidate updated successfully');
      } else {
        const response = await api.post(`/admin/candidates/${selectedElection}`, formData, {
          headers: { 'x-auth-token': authData.token }
        });
        setCandidates([...candidates, response.data]);
        toast.success('Candidate added successfully');
      }
      setFormData({
        candidate_name: '',
        party: '',
        image_url: ''
      });
      setEditCandidateId(null);
      setNewElectionId(''); // Reset new election ID state
    } catch (error) {
      toast.error('Failed to save candidate');
      console.error(error);
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    try {
      await api.delete(`/admin/candidates/${selectedElection}/${candidateId}`, {
        headers: { 'x-auth-token': authData.token }
      });
      setCandidates(candidates.filter(candidate => candidate._id !== candidateId));
      toast.success('Candidate deleted successfully');
    } catch (error) {
      toast.error('Failed to delete candidate');
      console.error(error);
    }
  };

  const handleEditCandidate = (candidate) => {
    setFormData({
      candidate_name: candidate.candidate_name,
      party: candidate.party,
      image_url: candidate.image_url
    });
    setEditCandidateId(candidate._id);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-3xl mb-6">Candidate Management</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Select Election
        </label>
        <select
          value={selectedElection}
          onChange={(e) => setSelectedElection(e.target.value)}
          className="border rounded py-2 px-4"
        >
          <option value="">Select an election</option>
          {elections.map(election => (
            <option key={election._id} value={election._id}>
              {election.election_name}
            </option>
          ))}
        </select>
      </div>
      {selectedElection && (
        <>
          <form onSubmit={handleAddOrUpdateCandidate} className="mb-6">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Candidate Name
              </label>
              <input
                type="text"
                name="candidate_name"
                value={formData.candidate_name}
                onChange={handleInputChange}
                className="border rounded py-2 px-4"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Party
              </label>
              <input
                type="text"
                name="party"
                value={formData.party}
                onChange={handleInputChange}
                className="border rounded py-2 px-4"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Image URL
              </label>
              <input
                type="text"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                className="border rounded py-2 px-4"
              />
            </div>
            {editCandidateId && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Change Election
                </label>
                <select
                  value={newElectionId}
                  onChange={(e) => setNewElectionId(e.target.value)}
                  className="border rounded py-2 px-4"
                >
                  <option value="">Select an election</option>
                  {elections.map(election => (
                    <option key={election._id} value={election._id}>
                      {election.election_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {editCandidateId ? 'Update Candidate' : 'Add Candidate'}
            </button>
          </form>
          <table className="table-auto w-full mt-6">
            <thead>
              <tr>
                <th className="px-4 py-2">Candidate Name</th>
                <th className="px-4 py-2">Party</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map(candidate => (
                <tr key={candidate._id}>
                  <td className="border px-4 py-2">{candidate.candidate_name}</td>
                  <td className="border px-4 py-2">{candidate.party}</td>
                  <td className="border px-4 py-2">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2"
                      onClick={() => handleEditCandidate(candidate)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => handleDeleteCandidate(candidate._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default CandidateManagement;
