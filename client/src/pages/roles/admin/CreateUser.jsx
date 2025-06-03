import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaUserPlus, 
  FaUserTie, 
  FaIdCard, 
  FaBuilding, 
  FaPhone, 
  FaEnvelope 
} from 'react-icons/fa';
import { MdDepartureBoard } from 'react-icons/md';
import { SiGoogletasks } from 'react-icons/si';

const CreateUser = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        eid: '',
        name: '',
        department: '',
        designation: '',
        company: '',
        phone: '',
        email: '',
        role: ''
    });
    
    const [department, setDepartment] = useState([]);
    const [designation, setDesignation] = useState([]);
    const [company, setCompany] = useState([]);
    const [roles, setRoles] = useState([]);
    const baseUrl = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        // Fetch dropdown data when component mounts
        const fetchDropdownData = async () => {
            try {
                const [deptRes, desigRes, compRes, rolesRes] = await Promise.all([
                    axios.get(`${baseUrl}/department`),
                    axios.get(`${baseUrl}/designation`),
                    axios.get(`${baseUrl}/company`),
                    axios.get(`${baseUrl}/roles`)
                ]);
                
                setDepartment(deptRes.data.data || []);
                setDesignation(desigRes.data.data || []);
                setCompany(compRes.data.data || []);
                setRoles(rolesRes.data.data || []);
            } catch (err) {
                console.error("Error fetching dropdown data:", err);
                toast.error('Failed to load dropdown data');
            }
        };
        
        fetchDropdownData();
    }, [baseUrl]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCancel = () => {
        navigate(-1); // Go back to previous page
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${baseUrl}/users`, formData);

            if (response.data.status === 'ok') {
                toast.success('User created successfully!');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                toast.error(`Error: ${response.data.message}`);
            }
        } catch (err) {
            console.error("Create user error", err);
            if (err.response) {
                toast.error(`Error: ${err.response.data.message || 'Failed to create user'}`);
            } else {
                toast.error('Network error. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                {department.map((departmentItem) => (
                                    <option key={departmentItem.departmentID} value={departmentItem.departmentName}>
                                        {departmentItem.departmentName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="designation" className="block text-sm font-medium text-gray-700 flex items-center">
                                <FaUserTie className="mr-2 text-gray-600" />
                                Designation <span className='text-red-500'>&nbsp;*</span>
                            </label>
                            <select
                                id="designation"
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                required
                            >
                                <option value="">Select Designation</option>
                                {designation.map((designationItem) => (
                                    <option key={designationItem.designationID} value={designationItem.designationName}>
                                        {designationItem.designationName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700 flex items-center">
                                <FaBuilding className="mr-2 text-gray-600" />
                                Company Name <span className='text-red-500'>&nbsp;*</span>
                            </label>
                            <select
                                id="company"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                required
                            >
                                <option value="">Select Company</option>
                                {company.map((companyItem) => (
                                    <option key={companyItem.companynameID} value={companyItem.companyname}>
                                        {companyItem.companyname}
                                    </option>
                                ))}
                            </select>
                        </div>

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

                        <div className="space-y-2">
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 flex items-center">
                                <SiGoogletasks className="mr-2 text-gray-600" />
                                Role <span className='text-red-500'>&nbsp;*</span>
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                required
                            >
                                <option value="">Select Role</option>
                                {roles.map((role) => (
                                    <option key={role.roleID} value={role.rolename} className='capitalize'>
                                        {role.rolename}
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
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUser;