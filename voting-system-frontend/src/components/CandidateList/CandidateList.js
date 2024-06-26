import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const CandidateList = () => {
    const { electionId } = useParams();
    const [candidates, setCandidates] = useState([]);
    const [hasVoted, setHasVoted] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [password, setPassword] = useState('');
    const { authData } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const response = await axios.get(`http://localhost:5004/api/candidates/${electionId}`);
                setCandidates(response.data);
            } catch (error) {
                console.error('Failed to fetch candidates', error);
            }
        };

        fetchCandidates();
    }, [electionId]);

    useEffect(() => {
        console.log('authData:', authData); // Debug authData
    }, [authData]);

    const handleVote = async (candidateId) => {
        console.log('handleVote authData:', authData); // Debug authData in handleVote
        if (!authData || !authData.user || !authData.user._id) {
            toast.error('You must be logged in to vote');
            return;
        }
        setSelectedCandidateId(candidateId);
        setShowModal(true);
    };

    const confirmVote = async () => {
        if (!password) {
            toast.error('Please enter your password to confirm your vote');
            return;
        }

        try {
            const response = await axios.post(`http://localhost:5006/api/votes/${electionId}`, {
                userId: authData.user._id,
                candidateId: selectedCandidateId,
                password // Include password for verification
            });

            if (response.status === 201) {
                toast.success('Vote submitted successfully!');
                setHasVoted(true);
                setShowModal(false);
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                toast.error('Invalid password. Please try again.');
            } else if (error.response && error.response.data) {
                toast.error(error.response.data);
            } else {
                toast.error('Failed to submit vote');
            }
        }
    };

    if (hasVoted) {
        return (
            <div className="max-w-6xl mx-auto mt-10">
                <h2 className="text-3xl mb-6">Vote submitted successfully!</h2>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={() => navigate('/elections')}
                >
                    Return to Elections List
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto mt-10">
            <h2 className="text-3xl mb-6">Candidates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {candidates.map(candidate => (
                    <div key={candidate._id} className="bg-white border border-gray-200 rounded-lg shadow p-5">
                        {candidate.image_url && <img src={candidate.image_url} alt={candidate.candidate_name} className="w-full h-48 object-cover rounded-lg mb-4" />}
                        <h3 className="text-xl font-semibold mb-2">{candidate.candidate_name}</h3>
                        <p className="text-gray-600">{candidate.party}</p>
                        <button
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            onClick={() => handleVote(candidate._id)}
                        >
                            Vote
                        </button>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-2xl mb-4">Confirm Your Vote</h2>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border rounded w-full py-2 px-3 mb-4"
                        />
                        <div className="flex justify-end">
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mr-2"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={confirmVote}
                            >
                                Confirm Vote
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateList;
