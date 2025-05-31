import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FaBars, FaTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar/Sidebar';
import axios from 'axios';

const UserProfile = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(null);
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const navigate = useNavigate();
    const { userID } = useParams();

    // Fetch user data and profile image
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await axios.get(`${baseUrl}/users/${userID}`);
                setUserData(userRes.data.data);

                // Fetch profile image
                const imageRes = await axios.get(`${baseUrl}/profile-image/${userID}`, {
                    responseType: 'blob'
                });

                const imageUrl = URL.createObjectURL(imageRes.data);
                setPreview(imageUrl);
            } catch (err) {
                if (err.response?.status !== 404) {
                    setError(err.message);
                    toast.error('Failed to load user or profile image');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userID]);

    // Upload handler
    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post(`${baseUrl}/profile-image/${userID}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const imageUrl = URL.createObjectURL(file);
            setPreview(imageUrl);
            toast.success(res.data.message);
        } catch (err) {
            toast.error('Upload failed');
        }
    };

    // Delete handler
    const handleDelete = async () => {
        try {
            await axios.delete(`${baseUrl}/profile-image/${userID}`);
            setPreview(null);
            toast.success('Profile image deleted');
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    console.log(userData);

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        navigate('/');
        toast.info('You have been logged out');
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div className="flex flex-col flex-1 w-full overflow-hidden">
                <header className="flex items-center justify-between bg-white shadow-sm p-4 border-b">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-600 hover:text-gray-900 focus:outline-none md:hidden"
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 ml-4">User Profile</h1>
                    <div className="w-6"></div>
                </header>

                <main className="flex-grow overflow-auto p-6 bg-gray-50">
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <div className="p-4 border rounded-lg">
                            <h2 className="text-lg font-bold mb-2">Profile Picture</h2>

                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Profile"
                                    className="w-32 h-32 object-cover rounded-full mb-2"
                                />
                            ) : (
                                <p className="text-gray-500">No image uploaded</p>
                            )}

                            <input
                                type="file"
                                onChange={handleUpload}
                                accept="image/*"
                                className="block mt-2"
                            />

                            {preview && (
                                <button
                                    className="bg-red-500 text-white px-4 py-1 mt-2 rounded"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                            )}

                            <div className="mt-6">
                                <h3 className="text-xl font-semibold">User Info</h3>
                                <p><strong>Username:</strong> {userData?.username}</p>
                                <p><strong>Name:</strong> {userData?.Name}</p>
                                <p><strong>Phone:</strong> {userData?.Phone}</p>
                                <p><strong>department:</strong> {userData?.Department}</p>
                                <p><strong>designation:</strong> {userData?.Designation}</p>
                                <p><strong>company:</strong> {userData?.Company_name}</p>
                                <p><strong>role:</strong> {userData?.Role}</p>
                                <p><strong>EID</strong>{userData?.E_ID}</p>
                                <p><strong>Email:</strong> {userData?.email}</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UserProfile;
