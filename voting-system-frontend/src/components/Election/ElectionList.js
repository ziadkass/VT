import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ElectionList = () => {
    const [elections, setElections] = useState([]);
    const { authData } = useContext(AuthContext);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchElections = async () => {
            try {
                const electionResponse = await axios.get('http://localhost:5003/api/elections/all', {
                    headers: { 'x-auth-token': authData.token }
                });
                const votesResponse = await axios.get(`http://localhost:5006/api/votes/user/${authData.user._id}`);
                const votedElections = votesResponse.data.map(vote => vote.election_id._id);
                const currentDate = new Date();
                const filteredElections = electionResponse.data.filter(election => 
                    !votedElections.includes(election._id) &&
                    new Date(election.start_date) <= currentDate &&
                    new Date(election.end_date) >= currentDate
                );
                setElections(filteredElections);
            } catch (error) {
                toast.error('Failed to fetch elections');
                console.error(error);
            }
        };

        fetchElections();
    }, [authData]);

    return (
        <div className="max-w-6xl mx-auto mt-10">
            <h2 className="text-3xl mb-6">Elections</h2>
            <div className="relative">
                <div className="flex overflow-x-scroll scrollbar-hide space-x-4" ref={scrollRef}>
                    {elections.length === 0 ? (
                        <div className="text-center py-4">No elections found</div>
                    ) : (
                        elections.map(election => (
                            <Link to={`/vote/${election._id}`} key={election._id} className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 flex-shrink-0">
                                <div>
                                    {election.image_url && <img className="rounded-t-lg" src={election.image_url} alt={election.election_name} />}
                                    <div className="p-5">
                                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{election.election_name}</h5>
                                        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                                            Start Date: {new Date(election.start_date).toLocaleDateString()}<br />
                                            End Date: {new Date(election.end_date).toLocaleDateString()}<br />
                                            Created At: {new Date(election.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
                <button className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md" onClick={() => {
                    scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                }}>
                    ◀
                </button>
                <button className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md" onClick={() => {
                    scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                }}>
                    ▶
                </button>
            </div>
        </div>
    );
};

export default ElectionList;
