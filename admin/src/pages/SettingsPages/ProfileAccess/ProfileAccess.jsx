import React, { useState, useEffect } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const menuItems = [
    {
        category: "User Management",
        items: [
            { name: "Create User", path: "/admin/create-user" },
            { name: "All Users", path: "/admin/Users" },
        ]
    },
    {
        category: "Movement Report",
        items: [
            { name: "Movement Status (User, Team Leader)", path: "/user/upload-report" },
            { name: "Movement Report (User, Team Leader)", path: "/user/UserReport" },
            { name: "All Movement Reports (Admin, Manager)", path: "/admin/movement-reports" },
        ]
    },
    {
        category: "Team Management",
        items: [
            { name: "All Teams (Admin)", path: "/admin/teams" },
            { name: "Team Report (Team Leader)", path: "/team/team-report" },
            { name: "Team Information (Team Leader)", path: "/team/manage-team" },
            { name: "User Team Message (User & Team Leader)", path: "/user/team-massage" },
        ]
    },
    {
        category: "Settings",
        items: [
            { name: "Company Names", path: "/admin/companynames" },
            { name: "Department Names", path: "/admin/departments" },
            { name: "Branch Names", path: "/admin/branchs" },
            { name: "Designation Names", path: "/admin/designations" },
            { name: "Visiting Status", path: "/admin/visitingstatus" },
            { name: "Parties Names", path: "/admin/parties" },
        ]
    }
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
                const userRes = await axios.get(`${baseUrl}/users/${userID}`);
                setUser(userRes.data.data);

                const permRes = await axios.get(`${baseUrl}/permissions/users/${userID}/permissions`);

                const initialState = {};
                menuItems.forEach(category => {
                    category.items.forEach(item => {
                        initialState[item.path] = permRes.data.data[item.path] || false;
                    });
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
            await axios.put(`${baseUrl}/permissions/users/${userID}/permissions`, {
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
        <div className="flex min-h-screen">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-col flex-1 w-full">
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
                        <p>Editing permissions for: <span className="font-semibold mx-2 text-blue-800">{user?.Name}</span></p>
                        <p>User Role: <span className='font-semibold mx-2 text-blue-800 uppercase'>{user?.Role}</span></p>
                    </div>
                </header>

                <main className="p-6">
                    <div className="bg-white rounded-xl shadow-md p-6 text-gray-700">
                        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">Access Permissions</h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {menuItems.map((category, catIndex) => (
                                <div key={catIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center mb-3">
                                        <h3 className="text-lg font-semibold text-gray-600 uppercase">{category.category}</h3>
                                    </div>

                                    <div className="space-y-2">
                                        {category.items.map((item, itemIndex) => (
                                            <label key={itemIndex} className="flex items-center cursor-pointer hover:bg-blue-50 p-2 rounded-md transition">
                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox h-5 w-5 text-blue-600 mr-3"
                                                    checked={!!accessState[item.path]}
                                                    onChange={() => handleToggle(item.path)}
                                                />
                                                <span className="text-sm font-medium text-gray-800">{item.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className='flex justify-end mt-8'>
                            <button
                                onClick={handleAccessSave}
                                className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md transition-all duration-200'
                            >
                                Save Permissions
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfileAccess;
