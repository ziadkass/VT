import React, { useState, useEffect, useContext } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

Chart.register(...registerables);

const AdminDashboard = () => {
  const [totalByElection, setTotalByElection] = useState([]);
  const { authData } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const electionRes = await api.get('/admin/candidates/stats/total-by-election', {
          headers: { 'x-auth-token': authData.token }
        });
        setTotalByElection(electionRes.data);
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error(error);
      }
    };

    fetchData();
  }, [authData]);

  const totalByElectionData = {
    labels: totalByElection.map(e => e.election_name),
    datasets: [{
      label: 'Total Candidates by Election',
      data: totalByElection.map(e => e.count),
      backgroundColor: 'rgba(75,192,192,0.6)',
      borderWidth: 1
    }]
  };

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <h2 className="text-3xl mb-6">Admin Dashboard</h2>
      <div className="mb-6">
        <h3 className="text-2xl">Total Candidates by Election</h3>
        <Bar data={totalByElectionData} />
      </div>
    </div>
  );
};

export default AdminDashboard;
