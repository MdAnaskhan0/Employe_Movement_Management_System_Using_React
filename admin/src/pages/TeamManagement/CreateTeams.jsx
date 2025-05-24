import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUsers, FaUserShield, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { MdGroupAdd } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Sidebar from '../../components/Sidebar/Sidebar';

const CreateTeams = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [teamName, setTeamName] = useState('');
    const [userCategory, setUserCategory] = useState([]);
    const [teamLeaderCategory, setTeamLeaderCategory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTeamLeader, setSelectedTeamLeader] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAllUsers = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get('http://192.168.111.140:5137/users');
                const allUsers = res.data.data;

                // Normalize roles to lowercase for consistent filtering
                const normalized = allUsers.map(user => ({
                    ...user,
                    Role: user.Role?.toLowerCase() || ''
                }));

                const leaders = normalized.filter(user => user.Role === 'team leader');
                const members = normalized.filter(user => user.Role === 'user');

                console.log("leaders", leaders);
                console.log("members", members);

                setTeamLeaderCategory(leaders);
                setUserCategory(members);
            } catch (err) {
                toast.error('Failed to fetch users');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllUsers();
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

        if (!teamName.trim()) {
            toast.warning('Please enter a team name');
            return;
        }

        if (!selectedTeamLeader) {
            toast.warning('Please select a team leader');
            return;
        }

        if (selectedMembers.length === 0) {
            toast.warning('Please select at least one team member');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('http://192.168.111.140:5137/assign-team', {
                team_name: teamName,
                team_leader_id: selectedTeamLeader,
                team_member_ids: selectedMembers,
            });

            if (response.data.status === 'ok') {
                toast.success('Team created successfully!');
                // Clear all inputs after success
                setTeamName('');
                setSelectedTeamLeader('');
                setSelectedMembers([]);
                setSearchTerm('');
            } else {
                toast.error(response.data.message || 'Failed to create team');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
            toast.error(`Error: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = userCategory.filter(user =>
        user.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <ToastContainer position="top-right" autoClose={5000} />
            <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                ></div>
            )}

            <div className="flex flex-col flex-1 w-full">
                <header className="flex items-center justify-between bg-white shadow-sm p-4 border-b">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-gray-600 focus:outline-none md:hidden"
                            aria-label="Toggle sidebar"
                        >
                            {sidebarOpen ? (
                                <FaTimes className="h-5 w-5" />
                            ) : (
                                <FaBars className="h-5 w-5" />
                            )}
                        </button>
                        <h1 className="text-xl font-semibold text-gray-800 flex items-center">
                            <MdGroupAdd className="mr-2 text-blue-600" />
                            Team Management
                        </h1>
                    </div>
                </header>

                <main className="flex-grow overflow-auto p-4 md:p-6 bg-gray-50">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <FaUsers className="mr-2 text-blue-500" />
                                    Create New Team
                                </h2>
                                <button
                                    onClick={() => {
                                        setTeamName('');
                                        setSelectedTeamLeader('');
                                        setSelectedMembers([]);
                                        setSearchTerm('');
                                    }}
                                    className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                                >
                                    <FaArrowLeft className="mr-1" />
                                    Reset
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block mb-2 font-medium text-gray-700">Team Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter Team Name"
                                            value={teamName}
                                            onChange={(e) => setTeamName(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 font-medium text-gray-700 flex items-center">
                                            <FaUserShield className="mr-2 text-blue-500" />
                                            Team Leader
                                        </label>
                                        <select
                                            value={selectedTeamLeader}
                                            onChange={(e) => setSelectedTeamLeader(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
                                            required
                                        >
                                            <option value="">Select Team Leader</option>
                                            {teamLeaderCategory.map((leader) => (
                                                <option key={leader.userID} value={leader.userID}>
                                                    {leader.Name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-medium text-gray-700 flex items-center">
                                            <FaUsers className="mr-2 text-blue-500" />
                                            Search Members
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Search team members..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium text-gray-700">
                                        Selected Members: {selectedMembers.length}
                                    </label>
                                    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                                        {filteredUsers.length > 0 ? (
                                            <div className="max-h-60 overflow-y-auto p-2">
                                                {filteredUsers.map((user) => (
                                                    <div
                                                        key={user.userID}
                                                        className={`flex items-center justify-between p-3 rounded-lg mb-2 cursor-pointer ${selectedMembers.includes(user.userID)
                                                            ? 'bg-blue-50 border border-blue-200'
                                                            : 'hover:bg-gray-50'
                                                            }`}
                                                        onClick={() => toggleMember(user.userID)}
                                                    >
                                                        <div>
                                                            <p className="font-medium text-gray-800">{user.Name}</p>
                                                            <p className="text-sm text-gray-500">{user.Email}</p>
                                                        </div>
                                                        {selectedMembers.includes(user.userID) ? (
                                                            <span className="bg-blue-500 text-white rounded-full p-1">
                                                                <FaPlus className="transform rotate-45" />
                                                            </span>
                                                        ) : (
                                                            <span className="border border-gray-300 rounded-full p-1">
                                                                <FaPlus />
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-gray-500">
                                                No members found
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`px-6 py-2.5 rounded-lg font-medium flex items-center ${isLoading
                                            ? 'bg-blue-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                            } text-white transition`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <MdGroupAdd className="mr-2" />
                                                Create Team
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {selectedTeamLeader && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                                    <FaUserShield className="mr-2 text-blue-500" />
                                    Selected Team Leader
                                </h3>
                                {teamLeaderCategory
                                    .filter(leader => leader.userID === selectedTeamLeader)
                                    .map(leader => (
                                        <div key={leader.userID} className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                                    {leader.Name.charAt(0)}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{leader.Name}</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CreateTeams;
