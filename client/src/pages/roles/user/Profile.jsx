import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../auth/AuthContext';
import { toast } from 'react-toastify';
import { FiBriefcase, FiHome, FiPhone, FiMail, FiUser, FiLock, FiCamera, FiTrash2 } from 'react-icons/fi';
import { Skeleton } from '@mui/material';
import LogoutButton from '../../../components/LogoutButton';

const Profile = () => {
    const { user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [userImage, setUserImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(Date.now());
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChanging, setIsChanging] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !user.userID) return;
            try {
                const userRes = await axios.get(`${baseUrl}/users/${user.userID}`);
                setUserData(userRes.data.data);
            } catch (err) {
                console.error('Error fetching user data:', err);
                toast.error('Failed to load user data. Please try again.');
            }
        };

        fetchData();
    }, [user]);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await axios.get(`${baseUrl}/profile-image/${user.userID}`, {
                    responseType: 'blob'
                });

                if (response.data) {
                    const imageUrl = URL.createObjectURL(response.data);
                    setUserImage(imageUrl);
                }
            } catch (err) {
                console.error('Error fetching user image:', err);
                setUserImage(null);
            }
        };

        if (user?.userID) {
            fetchImage();
        }
    }, [user, fileInputKey]);

    const getInitials = (name) => {
        if (!name) return '';
        const names = name.split(' ');
        return names.map(n => n[0]).join('').toUpperCase();
    };

    const resizeImage = (file) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.src = e.target.result;
            };

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 300;
                const MAX_HEIGHT = 300;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas is empty'));
                            return;
                        }
                        if (blob.size > 1024 * 1024) {
                            reject(new Error('File size exceeds 1MB after resizing'));
                            return;
                        }
                        resolve(blob);
                    },
                    'image/jpeg',
                    0.9
                );
            };

            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            toast.error('Please select an image file');
            return;
        }

        setIsUploading(true);
        try {
            const resizedBlob = await resizeImage(file);

            const formData = new FormData();
            formData.append('image', resizedBlob, file.name);

            await axios.post(`${baseUrl}/profile-image/${user.userID}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setFileInputKey(Date.now());
            toast.success('Profile image updated successfully');
        } catch (err) {
            console.error('Error uploading image:', err);
            toast.error(err.message || 'Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete your profile picture?')) return;

        try {
            await axios.delete(`${baseUrl}/profile-image/${user.userID}`);
            setUserImage(null);
            setFileInputKey(Date.now());
            toast.success('Profile image deleted successfully');
        } catch (err) {
            console.error('Error deleting image:', err);
            toast.error('Failed to delete profile image');
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error('Please fill out both password fields.');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setIsChanging(true);
        try {
            await axios.put(`${baseUrl}/change-password/${user.userID}`, {
                newPassword
            });

            toast.success('Password changed successfully!');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('Password change error:', err);
            toast.error('Failed to change password. Try again.');
        } finally {
            setIsChanging(false);
        }
    };

    if (!user || !userData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <Skeleton variant="rectangular" width="100%" height={400} />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-end px-4">
                <LogoutButton />
            </div>
            <div className="container mx-auto px-4 py-8 min-h-screen">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Sidebar */}
                    <div className="w-full md:w-1/4">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-center">
                                <div className="relative mx-auto w-24 h-24 rounded-full border-4 border-white bg-white shadow-md mb-4 overflow-hidden">
                                    {userImage ? (
                                        <img
                                            src={userImage}
                                            alt="User Profile"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/150';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-2xl font-bold">
                                            {getInitials(userData?.Name)}
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-xl font-semibold text-white">{userData.Name}</h2>
                                <p className="text-blue-100">{userData.Designation}</p>
                            </div>

                            <div className="p-4">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg mb-2 ${activeTab === 'profile' ? 'bg-blue-50 text-blue-800' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <FiUser className="text-lg" />
                                    <span>Profile Information</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('password')}
                                    className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg ${activeTab === 'password' ? 'bg-blue-50 text-blue-800' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <FiLock className="text-lg" />
                                    <span>Change Password</span>
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
                            <h3 className="font-medium text-gray-700 mb-3">Profile Photo</h3>
                            <div className="flex space-x-2">
                                <label
                                    htmlFor="profile-upload"
                                    className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm rounded-lg cursor-pointer ${isUploading
                                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-800 text-white hover:bg-blue-900'
                                        }`}
                                >
                                    <FiCamera size={16} />
                                    <span>{isUploading ? 'Uploading...' : 'Change'}</span>
                                    <input
                                        id="profile-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleUpload}
                                        disabled={isUploading}
                                        className="hidden"
                                        key={fileInputKey}
                                    />
                                </label>
                                <button
                                    onClick={handleDelete}
                                    disabled={!userImage || isUploading}
                                    className={`flex items-center justify-center space-x-2 px-3 py-2 text-sm rounded-lg ${!userImage || isUploading
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                                        }`}
                                >
                                    <FiTrash2 size={16} />
                                    <span>Remove</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="w-full md:w-3/4">
                        {activeTab === 'profile' ? (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="border-b border-gray-200 px-6 py-4">
                                    <h2 className="text-lg font-semibold text-gray-800">Profile Information</h2>
                                    <p className="text-sm text-gray-500">View and update your personal details</p>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-600">Employee ID</label>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <p className="text-gray-800">{userData.E_ID}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-600">Full Name</label>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <p className="text-gray-800">{userData.Name}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-600">Company</label>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <p className="text-gray-800">{userData.Company_name}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-600">Department</label>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <p className="text-gray-800">{userData.Department}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-600">Designation</label>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <p className="text-gray-800">{userData.Designation}</p>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="border-b border-gray-200 px-6 py-4">
                                    <h2 className="text-lg font-semibold text-gray-800">Change Password</h2>
                                    <p className="text-sm text-gray-500">Update your account password</p>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-4 max-w-md">
                                        <div className="space-y-1">
                                            <label htmlFor="newPassword" className="text-sm font-medium text-gray-600">New Password</label>
                                            <div className="relative">
                                                <input
                                                    id="newPassword"
                                                    type="password"
                                                    placeholder="Enter new password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-600">Confirm New Password</label>
                                            <div className="relative">
                                                <input
                                                    id="confirmPassword"
                                                    type="password"
                                                    placeholder="Confirm new password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                onClick={handleChangePassword}
                                                disabled={isChanging}
                                                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg text-white ${isChanging ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-800 hover:bg-blue-900'} transition-colors`}
                                            >
                                                {isChanging ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Changing...
                                                    </>
                                                ) : 'Change Password'}
                                            </button>
                                        </div>

                                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                            <h3 className="text-sm font-medium text-blue-800 mb-2">Password Requirements</h3>
                                            <ul className="text-xs text-blue-600 space-y-1">
                                                <li className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                    Minimum 6 characters
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                    Avoid common passwords
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;