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

    const getAllUsers = async () => {
        try {
            const response = await axios.get('http://192.168.111.140:5137/users');
            if (response.data.status === 'ok') {
                return response.data.data; 
            } else {
                console.error('Failed to fetch users:', response.data.message);
                return [];
            }
        } catch (error) {
            console.error('Error fetching users:', error);
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

                // Categorize by Role
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

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                ></div>
            )}

            {/* Main content */}
            <div className="flex flex-col flex-1 w-full">
                {/* Header */}
                <header className="flex items-center justify-between bg-white shadow p-4">
                    {/* Mobile menu button */}
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

                {/* Content */}
                <main className="flex-grow overflow-auto p-6 bg-gray-50">
                    {isLoading && <p>Loading users...</p>}
                    {error && <p className="text-red-500">{error}</p>}

                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-2">Team Leaders</h2>
                        <ul className="list-disc list-inside bg-white p-4 rounded shadow">
                            {teamLeaderCategory.map(user => (
                                <li key={user.userID}>
                                    {user.Name} – {user.Designation} ({user.Email})
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">Users</h2>
                        <ul className="list-disc list-inside bg-white p-4 rounded shadow">
                            {userCategory.map(user => (
                                <li key={user.userID}>
                                    {user.Name} – {user.Designation} ({user.Email})
                                </li>
                            ))}
                        </ul>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CreateTeams;
