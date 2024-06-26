import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

Modal.setAppElement('#root'); // Set the root element for accessibility

const VotePage = () => {
  const { electionId } = useParams();
  const { authData } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await axios.get(`http://localhost:5004/api/candidates/${electionId}`, {
          headers: { 'x-auth-token': authData.token }
        });
        setCandidates(response.data);
      } catch (error) {
        console.error('Fetch candidates error', error);
      }
    };

    fetchCandidates();
  }, [electionId, authData]);

  const openModal = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleVote = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5006/api/votes/${electionId}`, {
        userId: authData.user._id,
        candidateId: selectedCandidate,
        password
      }, {
        headers: { 'x-auth-token': authData.token }
      });
      toast.success('Vote submitted successfully');
      closeModal();
      setHasVoted(true);
    } catch (error) {
      toast.error('Vote submission failed');
      console.error('Vote error', error);
    }
  };

  if (hasVoted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">You successfully voted for this election</h2>
        <button
          onClick={() => navigate('/elections')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Return to Voting Page
        </button>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={openModal} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h3 className="text-2xl mb-4">Vote</h3>
        <select value={selectedCandidate} onChange={(e) => setSelectedCandidate(e.target.value)} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
          <option value="">Select a candidate</option>
          {candidates.map(candidate => (
            <option key={candidate._id} value={candidate._id}>{candidate.candidate_name}</option>
          ))}
        </select>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4">
          Submit Vote
        </button>
      </form>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Confirm Password"
        className="flex items-center justify-center"
        overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Confirm Password</h2>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">&times;</button>
          </div>
          <form onSubmit={handleVote}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline mt-4"
              required
            />
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={closeModal} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                Cancel
              </button>
              <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Confirm
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default VotePage;
