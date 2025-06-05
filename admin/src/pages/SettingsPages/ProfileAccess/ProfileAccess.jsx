import React, { useState, useEffect } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

// This maps the menu items to their corresponding permission names
const menuItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Profile", path: "/user/profile" },
  { name: "Movement Submit", path: "/user/upload-report" },
  { name: "Movement Report", path: "/user/UserReport" },
  { name: "Users/Create User", path: "/admin/create-user" },
  { name: "Users/All User", path: "/admin/Users" },
  { name: "Teams/Create Team", path: "/admin/teams" },
  { name: "Teams/All Teams", path: "/admin/teams" },
  { name: "Settings/Companys Name", path: "/admin/companynames" },
  { name: "Settings/Departments Name", path: "/admin/departments" },
  { name: "Settings/Branchs Name", path: "/admin/branchs" },
  { name: "Settings/Designations Name", path: "/admin/designations" },
  { name: "Settings/Visiting Status Name", path: "/admin/visitingstatus" }
];

const ProfileAccess = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [accessState, setAccessState] = useState({});
    const { userID } = useParams();
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                // Fetch user details
                const userRes = await axios.get(`${baseUrl}/users/${userID}`);
                setUser(userRes.data.data);
                
                // Fetch user permissions
                const permRes = await axios.get(`${baseUrl}/users/${userID}/permissions`);
                
                // Initialize access state with default false for all items
                const initialState = {};
                menuItems.forEach(item => {
                    initialState[item.path] = permRes.data.data[item.path] || false;
                });
                
                setAccessState(initialState);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load user data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserData();
    }, [userID, baseUrl]);

    const handleToggle = (path) => {
        setAccessState(prev => ({
            ...prev,
            [path]: !prev[path],
        }));
    };

    const handleAccessSave = async () => {
        try {
            await axios.put(`${baseUrl}/users/${userID}/permissions`, {
                permissions: accessState
            });
            toast.success('Permissions updated successfully');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update permissions');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <div className="m-auto">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content */}
            <div className="flex flex-col flex-1 w-full">
                {/* Header */}
                <header className="flex items-center justify-between bg-white shadow-sm p-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-600 focus:outline-none md:hidden"
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
                    </button>
                    <h1 className="text-xl font-semibold text-gray-800">User Access Management</h1>
                    <div className="text-sm text-gray-600">
                        Editing permissions for: <span className="font-semibold">{user?.name}</span>
                    </div>
                </header>

                {/* Content */}
                <main className="p-6">
                    <div className="bg-white rounded-lg shadow p-6 text-gray-700">
                        <h2 className="text-lg font-bold mb-4 text-center">Access Permissions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {menuItems.map((item, index) => (
                                <label key={index} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                        checked={!!accessState[item.path]}
                                        onChange={() => handleToggle(item.path)}
                                    />
                                    <div>
                                        <span className="block font-medium">{item.name.split('/')[0]}</span>
                                        {item.name.includes('/') && (
                                            <span className="block text-sm text-gray-500">
                                                {item.name.split('/')[1]}
                                            </span>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                        <div className='flex justify-end mt-6'>
                            <button
                                onClick={handleAccessSave}
                                className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Permissions'}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfileAccess;