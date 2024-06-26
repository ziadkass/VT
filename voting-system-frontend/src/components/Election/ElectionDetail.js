import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const ElectionDetail = () => {
    const { electionId } = useParams();
    const { authData } = useContext(AuthContext);
    const [election, setElection] = useState(null);
    const [candidates, setCandidates] = useState([]);

    useEffect(() => {
        const fetchElection = async () => {
            try {
                const response = await axios.get(`http://localhost:5003/api/elections/${electionId}`, {
                    headers: { 'x-auth-token': authData.token }
                });
                setElection(response.data);
            } catch (error) {
                toast.error('Failed to fetch election details');
                console.error(error);
            }
        };

        const fetchCandidates = async () => {
            try {
                const response = await axios.get(`http://localhost:5004/api/candidates/${electionId}`, {
                    headers: { 'x-auth-token': authData.token }
                });
                setCandidates(response.data);
            } catch (error) {
                toast.error('Failed to fetch candidates');
                console.error(error);
            }
        };

        fetchElection();
        fetchCandidates();
    }, [electionId, authData]);

    if (!election) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto mt-10 text-center">
            <h2 className="text-3xl mb-6">{election.election_name}</h2>
            {election.image_url && (
                <img
                    src={election.image_url}
                    alt={election.election_name}
                    className="w-48 h-auto mx-auto mb-4"
                />
            )}
            <p>Start Date: {new Date(election.start_date).toLocaleDateString()}</p>
            <p>End Date: {new Date(election.end_date).toLocaleDateString()}</p>
            <p>Created At: {new Date(election.created_at).toLocaleDateString()}</p>
            
            <h3 className="text-2xl mt-8 mb-4">Candidates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidates.map(candidate => (
                    <div key={candidate._id} className="border rounded p-4">
                        {candidate.image_url && (
                            <img
                                src={candidate.image_url}
                                alt={candidate.candidate_name}
                                className="w-24 h-auto mx-auto mb-2"
                            />
                        )}
                        <h4 className="text-xl font-semibold">{candidate.candidate_name}</h4>
                        <p className="text-gray-600">{candidate.party}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ElectionDetail;
