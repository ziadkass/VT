import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const ElectionDetails = () => {
  const { electionId } = useParams();
  const [election, setElection] = useState(null);
  const { authData } = useContext(AuthContext);

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

    fetchElection();
  }, [electionId, authData]);

  if (!election) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-3xl mb-6">{election.election_name}</h2>
      <p><strong>Start Date:</strong> {new Date(election.start_date).toLocaleDateString()}</p>
      <p><strong>End Date:</strong> {new Date(election.end_date).toLocaleDateString()}</p>
      <p><strong>Created At:</strong> {new Date(election.created_at).toLocaleDateString()}</p>
      {election.image_url && <img src={election.image_url} alt={election.election_name} className="mt-4" />}
    </div>
  );
};

export default ElectionDetails;
