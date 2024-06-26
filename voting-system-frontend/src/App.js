import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import CandidateManagement from './components/CandidateManagement';

import ElectionList from './components/Election/ElectionList';
import ElectionDetail from './components/Election/ElectionDetail';
import AdminPanel from './components/AdminPanel';
import AuthProvider from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import CandidateList from './components/CandidateList/CandidateList';
import VotePage from './components/Election/VotePage'; // Import the voting page
import ElectionCalendar from './components/Election/ElectionCalendar';

import 'react-toastify/dist/ReactToastify.css';
import './styles/main.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/elections" element={<ElectionList />} />
          <Route path="/vote/:electionId" element={<VotePage />} /> {/* Add this line */}
          <Route path="/admin/*" element={<AdminPanel />} />
          <Route path="/elections/:electionId" element={<ElectionDetail />} />
          <Route path="/elections/calendar" element={<ElectionCalendar />} />
        </Routes>
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
};

export default App;
