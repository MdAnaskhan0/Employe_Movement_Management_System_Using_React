import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserPlus, FaIdCard, FaUserTie, FaBuilding, FaPhone, FaEnvelope, FaBars, FaTimes } from 'react-icons/fa';
import { MdDepartureBoard } from 'react-icons/md';
import Sidebar from '../components/Sidebar/Sidebar';
import { SiGoogletasks } from "react-icons/si";


const CreateUser = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [roles, setRoles] = useState([]);
    const [designation, setDesignation] = useState([]);
    const [department, setDepartment] = useState([]);
    const [company, setCompany] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        eid: '',
        name: '',
        designation: '',
        department: '',
        company: '',
        phone: '',
        email: ''
    });


    useEffect(() => {
        axios.get('http://localhost:5137/get-json/roles')
            .then(response => {
                setRoles(response.data.data);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to fetch roles');
            });
    }, []);

    useEffect(()=>{
        axios.get('http://localhost:5137/get-json/designations')
            .then(response => {
                setDesignation(response.data.data);
                console.log(response.data.data);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to fetch designation');
            });
    }, []);

    useEffect(()=>{
        axios.get('http://localhost:5137/get-json/departments')
            .then(response => {
                setDepartment(response.data.data);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to fetch department');
            });
    })

    useEffect(()=>{
        axios.get('http://localhost:5137/get-json/companynames')
            .then(response => {
                setCompany(response.data.data);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to fetch company');
            });
    })

    if (error) return <div>{error}</div>;
    if (roles.length === 0) return <div>No roles found</div>;


    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        navigate('/');
    };

    const handleCancel = () => {
        navigate('/dashboard');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        try {
            const response = await axios.post('http://localhost:5137/users', formData);

            if (response.data.status === 'ok') {
                alert('User created successfully!');
                navigate('/dashboard');
            } else {
                alert(`Error: ${response.data.message}`);
            }
        } catch (err) {
            console.log("Create an error", err);
            alert("Error creating user");
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
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
                <header className="flex items-center justify-between bg-gray-50 shadow p-4">
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

                    {/* <h1 className="text-xl font-semibold text-gray-800">Create New User</h1> */}
                </header>

                {/* Content */}
                <main className="flex-grow overflow-auto p-6 bg-gray-50">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="bg-gray-100 p-4 text-gray-800">
                                <h1 className="text-2xl font-bold flex items-center">
                                    <FaUserPlus className="mr-2" />
                                    Create New User
                                </h1>
                                <p className="text-gray-600">Fill in the details below to register a new user</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                {/* Rest of your form fields remain exactly the same */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Username Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <FaUserTie className="mr-2 text-gray-600" />
                                            Username <span className='text-red-500'>&nbsp;*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            placeholder="Enter username"
                                            required
                                        />
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <FaUserTie className="mr-2 text-gray-600" />
                                            Password <span className='text-red-500'>&nbsp;*</span>
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            placeholder="Enter password"
                                            required
                                        />
                                    </div>

                                    {/* E-ID Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="eid" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <FaIdCard className="mr-2 text-gray-600" />
                                            Employee ID <span className='text-red-500'>&nbsp;*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="eid"
                                            name="eid"
                                            value={formData.eid}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            placeholder="Enter employee ID"
                                            required
                                        />
                                    </div>

                                    {/* Name Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <FaUserTie className="mr-2 text-gray-600" />
                                            Full Name <span className='text-red-500'>&nbsp;*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            placeholder="Enter full name"
                                            required
                                        />
                                    </div>

                                    {/* Designation Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="designation" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <FaUserTie className="mr-2 text-gray-600" />
                                            Designation <span className='text-red-500'>&nbsp;*</span>
                                        </label>
                                        <select
                                            type="text"
                                            id="designation"
                                            name="designation"
                                            value={formData.designation}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            placeholder="Enter designation"
                                            required
                                        >
                                            <option value="">Select Designation</option>
                                            {designation.map((designation) => (
                                                <option  key={designation} value={designation}>
                                                    {designation}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Department Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <MdDepartureBoard className="mr-2 text-gray-600" />
                                            Department <span className='text-red-500'>&nbsp;*</span>
                                        </label>
                                        <select
                                            id="department"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            {department.map((department) => (
                                                <option  key={department} value={department}>
                                                    {department}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Company Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <FaBuilding className="mr-2 text-gray-600" />
                                            Company Name <span className='text-red-500'>&nbsp;*</span>
                                        </label>
                                        <select
                                            type="text"
                                            id="company"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            placeholder="Enter company name"
                                            required
                                        >
                                            <option value="">Select Company</option>
                                            {company.map((company) => (
                                                <option  key={company} value={company}>
                                                    {company}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Phone Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <FaPhone className="mr-2 text-gray-600" />
                                            Phone Number <span className='text-red-500'>&nbsp;*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            placeholder="Enter phone number"
                                            required
                                        />
                                    </div>

                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <FaEnvelope className="mr-2 text-gray-600" />
                                            Email Address <span className='text-red-500'>&nbsp;*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            placeholder="Enter email address"
                                            required
                                        />
                                    </div>

                                    {/* Role Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <SiGoogletasks className="mr-2 text-gray-600" />
                                            Role <span className='text-red-500'>&nbsp;*</span>
                                        </label>
                                        <select
                                            type="text"
                                            id="role"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            placeholder="Enter user role"
                                            required
                                        >   
                                            <option value="">Select Role</option>
                                            {roles.map((role) => (
                                                <option  key={role} value={role}>
                                                    {role}
                                                </option>
                                            ))}

                                        </select>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end space-x-4">
                                    <button
                                        onClick={handleCancel}
                                        type="button"
                                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                                    >
                                        Create User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CreateUser;