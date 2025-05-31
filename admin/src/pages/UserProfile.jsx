import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar/Sidebar';
import axios from 'axios';

const UserProfile = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [formData, setFormData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(null);

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const [company, setCompany] = useState([]);
    const [department, setDepartment] = useState([]);
    const [designation, setDesignation] = useState([]);
    const [role, setRole] = useState([]);

    const navigate = useNavigate();
    const { userID } = useParams();

    // Fetch user data + image
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await axios.get(`${baseUrl}/users/${userID}`);
                setUserData(userRes.data.data);
                setFormData(userRes.data.data);

                const imageRes = await axios.get(`${baseUrl}/profile-image/${userID}`, {
                    responseType: 'blob',
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
    }, [userID, baseUrl]);

    // Fetch dropdown data with console logs + fallback defaults
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const resCompany = await axios.get(`${baseUrl}/companynames`);
                const resDepartment = await axios.get(`${baseUrl}/departments`);
                const resDesignation = await axios.get(`${baseUrl}/designations`);
                const resRole = await axios.get(`${baseUrl}/roles`);

                console.log('Company API response:', resCompany.data.data);
                console.log('Department API response:', resDepartment.data);
                console.log('Designation API response:', resDesignation.data);
                console.log('Role API response:', resRole.data);

                setCompany(resCompany.data.data);
                setDepartment(resDepartment.data);
                setDesignation(resDesignation.data);
                setRole(resRole.data);
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };
        fetchDropdownData();
    }, [baseUrl]);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post(`${baseUrl}/profile-image/${userID}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const imageUrl = URL.createObjectURL(file);
            setPreview(imageUrl);
            toast.success(res.data.message);
        } catch (err) {
            toast.error('Upload failed');
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${baseUrl}/profile-image/${userID}`);
            setPreview(null);
            toast.success('Profile image deleted');
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateUser = async () => {
        try {
            const res = await axios.put(`${baseUrl}/users/${userID}`, formData);
            toast.success(res.data.message);
            setUserData(formData);
            setEditMode(false);
        } catch (err) {
            toast.error('Update failed');
        }
    };

    const handleDeleteUser = async () => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await axios.delete(`${baseUrl}/users/${userID}`);
            toast.success('User deleted successfully');
            navigate('/users');
        } catch (err) {
            toast.error('Failed to delete user');
        }
    };

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
                    <div className="w-6" />
                </header>

                <main className="flex-grow overflow-auto p-6 bg-gray-50">
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <div className="p-4 border rounded-lg bg-white max-w-lg mx-auto">
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
                                <h3 className="text-xl font-semibold mb-4">User Info</h3>

                                {editMode ? (
                                    <>
                                        <div className="mb-2">
                                            <label className="block font-medium">Username</label>
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username || ''}
                                                onChange={handleChange}
                                                className="w-full border px-2 py-1 rounded"
                                            />
                                        </div>

                                        <div className="mb-2">
                                            <label className="block font-medium">Name</label>
                                            <input
                                                type="text"
                                                name="Name"
                                                value={formData.Name || ''}
                                                onChange={handleChange}
                                                className="w-full border px-2 py-1 rounded"
                                            />
                                        </div>

                                        <div className="mb-2">
                                            <label className="block font-medium">Phone</label>
                                            <input
                                                type="text"
                                                name="Phone"
                                                value={formData.Phone || ''}
                                                onChange={handleChange}
                                                className="w-full border px-2 py-1 rounded"
                                            />
                                        </div>

                                        <div className="mb-2">
                                            <label className="block font-medium">Department</label>
                                            <select
                                                name="Department"
                                                value={formData.Department || ''}
                                                onChange={handleChange}
                                                className="w-full border px-2 py-1 rounded"
                                            >
                                                <option value="">Select Department</option>
                                                {department.map((d) => (
                                                    <option key={d.departmentID} value={d.departmentName}>
                                                        {d.departmentName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-2">
                                            <label className="block font-medium">Designation</label>
                                            <select
                                                name="Designation"
                                                value={formData.Designation || ''}
                                                onChange={handleChange}
                                                className="w-full border px-2 py-1 rounded"
                                            >
                                                <option value="">Select Designation</option>
                                                {designation.map((des) => (
                                                    <option key={des.designationID} value={des.designationName}>
                                                        {des.designationName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-2">
                                            <label className="block font-medium">Company</label>
                                            <select
                                                name="Company_name"
                                                value={formData.Company_name || ''}
                                                onChange={handleChange}
                                                className="w-full border px-2 py-1 rounded"
                                            >
                                                <option value="">Select Company</option>
                                                {company.map((c) => (
                                                    <option key={c.companynameID} value={c.companyname}>
                                                        {c.companyname}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-2">
                                            <label className="block font-medium">Role</label>
                                            <select
                                                name="Role"
                                                value={formData.Role || ''}
                                                onChange={handleChange}
                                                className="w-full border px-2 py-1 rounded"
                                            >
                                                <option value="">Select Role</option>
                                                {role.map((r) => (
                                                    <option key={r.roleID} value={r.rolename}>
                                                        {r.rolename}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-2">
                                            <label className="block font-medium">EID</label>
                                            <input
                                                type="text"
                                                name="E_ID"
                                                value={formData.E_ID || ''}
                                                onChange={handleChange}
                                                className="w-full border px-2 py-1 rounded"
                                            />
                                        </div>

                                        <div className="mb-2">
                                            <label className="block font-medium">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email || ''}
                                                onChange={handleChange}
                                                className="w-full border px-2 py-1 rounded"
                                            />
                                        </div>

                                        <button
                                            onClick={handleUpdateUser}
                                            className="bg-blue-600 text-white px-4 py-2 rounded mr-2 mt-2"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditMode(false)}
                                            className="bg-gray-400 text-white px-4 py-2 rounded mt-2"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p>
                                            <strong>Username:</strong> {userData?.username}
                                        </p>
                                        <p>
                                            <strong>Name:</strong> {userData?.Name}
                                        </p>
                                        <p>
                                            <strong>Phone:</strong> {userData?.Phone}
                                        </p>
                                        <p>
                                            <strong>Department:</strong> {userData?.Department}
                                        </p>
                                        <p>
                                            <strong>Designation:</strong> {userData?.Designation}
                                        </p>
                                        <p>
                                            <strong>Company:</strong> {userData?.Company_name}
                                        </p>
                                        <p>
                                            <strong>Role:</strong> {userData?.Role}
                                        </p>
                                        <p>
                                            <strong>EID:</strong> {userData?.E_ID}
                                        </p>
                                        <p>
                                            <strong>Email:</strong> {userData?.email}
                                        </p>

                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="bg-yellow-500 text-white px-4 py-2 rounded mt-4 mr-2"
                                        >
                                            Edit User
                                        </button>
                                        <button
                                            onClick={handleDeleteUser}
                                            className="bg-red-600 text-white px-4 py-2 rounded mt-4"
                                        >
                                            Delete User
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UserProfile;
