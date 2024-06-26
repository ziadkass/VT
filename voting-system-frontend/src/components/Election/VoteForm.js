import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const VoteForm = ({ electionId }) => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await api.get(`/elections/${electionId}`);
        setCandidates(response.data.candidates);
      } catch (error) {
        console.error('Fetch candidates error', error);
      }
    };

    fetchCandidates();
  }, [electionId]);

  const handleVote = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/votes/${electionId}`, { candidateId: selectedCandidate });
      // Notify the user that the vote has been submitted
    } catch (error) {
      console.error('Vote error', error);
    }
  };

  return (
    <form onSubmit={handleVote} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
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
  );
};

export default VoteForm;
