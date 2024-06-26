import React, { useState, useEffect, useContext } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import './ElectionCalendar.css'; // Assurez-vous d'ajouter des styles personnalisés ici

const ElectionCalendar = () => {
    const [elections, setElections] = useState([]);
    const { authData } = useContext(AuthContext);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        const fetchElections = async () => {
            try {
                const response = await axios.get('http://localhost:5003/api/elections/all', {
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

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const election = elections.find(e => {
                const startDate = new Date(e.start_date);
                const endDate = new Date(e.end_date);
                return date >= startDate && date <= endDate;
            });
            return election ? (
                <div onClick={() => navigate(`/elections/${election._id}`)} className="cursor-pointer">
                    <p className="text-xs">{election.election_name}</p>
                </div>
            ) : null;
        }
    };

    const changeMonth = (direction) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(currentMonth.getMonth() + direction);
        setCurrentMonth(newDate);
    };

    return (
        <div className="lg:flex lg:h-full lg:flex-col">
            <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 lg:flex-none">
                <h1 className="text-base font-semibold leading-6 text-gray-900">
                    <time dateTime={currentMonth.toISOString()}>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</time>
                </h1>
                <div className="flex items-center">
                    <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
                        <button type="button" onClick={() => changeMonth(-1)} className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50">
                            <span className="sr-only">Previous month</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button type="button" className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block" onClick={() => setCurrentMonth(new Date())}>Today</button>
                        <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden"></span>
                        <button type="button" onClick={() => changeMonth(1)} className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50">
                            <span className="sr-only">Next month</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>
            <div className="shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col">
                <Calendar
                    value={currentMonth}
                    onChange={setCurrentMonth}
                    tileContent={tileContent}
                    className="lg:flex lg:flex-auto lg:flex-col"
                />
            </div>
        </div>
    );
};

export default ElectionCalendar;
