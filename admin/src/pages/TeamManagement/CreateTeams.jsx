import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import Sidebar from '../../components/Sidebar/Sidebar';

const CreateTeams = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [userCategory, setUserCategory] = useState([]);
    const [teamLeaderCategory, setTeamLeaderCategory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedTeamLeader, setSelectedTeamLeader] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [message, setMessage] = useState('');

    const getAllUsers = async () => {
        try {
            const response = await axios.get('http://192.168.111.140:5137/users');
            if (response.data.status === 'ok') {
                return response.data.data;
            } else {
                return [];
            }
        } catch (error) {
            return [];
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            setError('');
            try {
                const allUsers = await getAllUsers();
                setUsers(allUsers);

                const usersCategory = allUsers.filter(user => user.Role.toLowerCase() === 'user');
                const teamLeadersCategory = allUsers.filter(user => user.Role.toLowerCase() === 'team leader');

                setUserCategory(usersCategory);
                setTeamLeaderCategory(teamLeadersCategory);
            } catch (err) {
                setError('Failed to fetch users.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        navigate('/');
    };

    const toggleMember = (memberId) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedTeamLeader) {
            setMessage('Please select a team leader.');
            return;
        }

        if (selectedMembers.length === 0) {
            setMessage('Please select at least one team member.');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const res = await axios.post('http://192.168.111.140:5137/api/teams', {
                teamLeaderId: parseInt(selectedTeamLeader),
                teamMemberIds: selectedMembers,
            });

            if (res.data.status === 'ok') {
                setMessage('Team assigned successfully!');
                setSelectedMembers([]);
                setSelectedTeamLeader('');
                document.querySelectorAll('input[type="checkbox"]').forEach(el => (el.checked = false));
            } else {
                setMessage(res.data.message || 'Failed to assign team members.');
            }
        } catch (error) {
            setMessage('Error occurred while assigning team members.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                ></div>
            )}

            <div className="flex flex-col flex-1 w-full">
                <header className="flex items-center justify-between bg-white shadow p-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-800 focus:outline-none md:hidden"
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? (
                            <FaTimes className="h-6 w-6" />
                        ) : (
                            <FaBars className="h-6 w-6" />
                        )}
                    </button>

                    <h1 className="text-xl font-semibold text-gray-800">Create Team Management</h1>
                </header>

                <main className="flex-grow overflow-auto p-6 bg-gray-50">
                    <h2 className="text-2xl font-semibold mb-4">Create Team</h2>

                    {message && (
                        <div
                            className={`mb-4 p-2 rounded ${message.toLowerCase().includes('success')
                                ? 'bg-green-200 text-green-800'
                                : 'bg-red-200 text-red-800'
                                }`}
                        >
                            {message}
                        </div>
                    )}

                    {isLoading && <p className="text-blue-600">Processing...</p>}

                    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Select Team Leader:</label>
                            <select
                                value={selectedTeamLeader}
                                onChange={(e) => setSelectedTeamLeader(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2"
                                required
                            >
                                <option value="">-- Select Team Leader --</option>
                                {teamLeaderCategory.map((leader) => (
                                    <option key={leader.userID} value={leader.userID}>
                                        {leader.Name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Select Team Members:</label>
                            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded p-2 bg-white">
                                {userCategory.map((user) => (
                                    <label
                                        key={user.userID}
                                        className="flex items-center space-x-2 mb-1 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.includes(user.userID)}
                                            onChange={() => toggleMember(user.userID)}
                                        />
                                        <span>{user.Name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Assign Team Members
                        </button>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default CreateTeams;
