import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaBars, FaTimes, FaUser, FaClock, FaMapMarkerAlt, FaBuilding, 
  FaPhone, FaEnvelope, FaIdBadge, FaPeopleArrows, FaFingerprint, 
  FaRegBuilding, FaSort 
} from 'react-icons/fa';
import { CiCalendarDate } from "react-icons/ci";
import { MdWork, MdDepartureBoard, MdDescription, MdNote, MdChevronLeft, MdChevronRight, MdFirstPage, MdLastPage } from 'react-icons/md';
import { FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Sidebar from '../components/Sidebar/Sidebar';
import axios from 'axios';

const UserProfile = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [roles, setRoles] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [companyNames, setCompanyNames] = useState([]);
    const [punchStatuses, setPunchStatuses] = useState([]);
    const [visitingStatuses, setVisitingStatuses] = useState([]);
    const [movementReports, setMovementReports] = useState([]);
    
    // Filter and pagination states
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    const [sortConfig, setSortConfig] = useState({
        key: 'dateTime',
        direction: 'desc'
    });

    const navigate = useNavigate();
    const { userID } = useParams();

    // Pagination calculations
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    // Fetch user data and dropdown options
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await axios.get(`http://192.168.111.140:5137/users/${userID}`);
                setUserData(userRes.data.data);

                const responseRoles = await axios.get('http://192.168.111.140:5137/roles');
                const responseDesignations = await axios.get('http://192.168.111.140:5137/designations');
                const responseDepartments = await axios.get('http://192.168.111.140:5137/departments');
                const responseCompanyNames = await axios.get('http://192.168.111.140:5137/companynames');
                const responsePunchStatuses = await axios.get('http://192.168.111.140:5137/visitingstatus');
                const responseVisitingStatuses = await axios.get('http://192.168.111.140:5137/visitingstatus');

                setRoles(responseRoles.data);
                setDesignations(responseDesignations.data);
                setDepartments(responseDepartments.data);
                setCompanyNames(responseCompanyNames.data.data);
                setPunchStatuses(responsePunchStatuses.data);
                setVisitingStatuses(responseVisitingStatuses.data);
            } catch (err) {
                setError(err.message);
                toast.error('Failed to fetch user data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userID]);

    // Fetch movement reports
    useEffect(() => {
        const fetchMovementReports = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`http://192.168.111.140:5137/get_movement/${userID}`);
                setMovementReports(response.data);
            } catch (err) {
                console.error(err);
                toast.error('Failed to fetch movement reports');
            } finally {
                setIsLoading(false);
            }
        };
        fetchMovementReports();
    }, [userID]);

    // Apply filters and sorting
    useEffect(() => {
        let result = [...movementReports];

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item =>
                item.username?.toLowerCase().includes(term) ||
                item.placeName?.toLowerCase().includes(term) ||
                item.partyName?.toLowerCase().includes(term) ||
                item.purpose?.toLowerCase().includes(term)
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            result = result.filter(item => item.punchTime === statusFilter);
        }

        // Apply date range filter
        if (dateRange.start || dateRange.end) {
            const startDate = dateRange.start ? new Date(dateRange.start) : null;
            const endDate = dateRange.end ? new Date(dateRange.end) : null;

            result = result.filter(item => {
                const itemDate = new Date(item.dateTime);
                const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());

                if (startDate && endDate) {
                    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                    return itemDateOnly >= startDateOnly && itemDateOnly <= endDateOnly;
                } else if (startDate) {
                    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                    return itemDateOnly >= startDateOnly;
                } else if (endDate) {
                    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                    return itemDateOnly <= endDateOnly;
                }
                return true;
            });
        }

        // Apply sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        setFilteredData(result);
        setCurrentPage(1);
    }, [movementReports, searchTerm, statusFilter, dateRange, sortConfig]);

    const handleEdit = () => {
        setIsEditing(true);
        setEditData({
            username: userData.username,
            email: userData.email,
            e_id: userData.E_ID,
            name: userData.Name,
            designation: userData.Designation,
            department: userData.Department,
            company_name: userData.Company_name,
            phone: userData.Phone,
            role: userData.Role
        });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditData({});
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const payload = {
                username: editData.username,
                email: editData.email,
                E_ID: editData.e_id,
                Name: editData.name,
                Designation: editData.designation,
                Department: editData.department,
                Company_name: editData.company_name,
                Phone: editData.phone,
                Role: editData.role
            };

            await axios.put(`http://192.168.111.140:5137/users/${userID}`, payload);
            setUserData({ ...userData, ...payload });
            setIsEditing(false);
            toast.success('User updated successfully');
        } catch (err) {
            setError(err.message);
            toast.error('Failed to update user');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await axios.delete(`http://192.168.111.140:5137/users/${userID}`);
            navigate('/alluser');
            toast.success('User deleted successfully');
        } catch (err) {
            setError(err.message);
            toast.error('Failed to delete user');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        navigate('/');
        toast.info('You have been logged out');
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'N/A';
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        return new Date(dateTime).toLocaleDateString('en-US', options);
    };

    const formatTime12Hour = (timeString) => {
        if (!timeString) return 'N/A';
        const [hours, minutes, seconds] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds || 0, 10));
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getStatusBadge = (status) => {
        const statusClasses = {
            IN: 'bg-green-100 text-green-800',
            OUT: 'bg-red-100 text-red-800',
            PENDING: 'bg-yellow-100 text-yellow-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    const downloadCSV = () => {
        if (filteredData.length === 0) {
            toast.warning('No data to download');
            return;
        }

        const headers = [
            'User',
            'Date/Time',
            'Punch Time',
            'Punch Status',
            'Visiting Status',
            'Place',
            'Party',
            'Purpose',
            'Remarks'
        ];

        const rows = filteredData.map(report => [
            report.username,
            formatDateTime(report.dateTime),
            formatTime12Hour(report.punchingTime),
            report.punchTime,
            report.visitingStatus,
            report.placeName || 'N/A',
            report.partyName || 'N/A',
            report.purpose || 'Not specified',
            report.remark || 'Not specified'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(item => `"${item}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `movement_reports_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('CSV download started');
    };

    const displayOrEdit = (field, editKey) => {
        return (
            <div className="flex items-start space-x-4">
                <div className="mt-1">
                    {field.icon}
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-500">{field.title}</h3>
                    {isEditing ? (
                        <input
                            type="text"
                            name={editKey}
                            value={editData[editKey] || ''}
                            onChange={handleEditChange}
                            className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                    ) : (
                        <p className="text-sm text-gray-900">{userData ? userData[field.stateKey] : 'Loading...'}</p>
                    )}
                </div>
            </div>
        );
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
                    {isLoading && !userData ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-white rounded-lg shadow p-6 text-center">
                            <p className="text-red-500">Error: {error}</p>
                        </div>
                    ) : (
                        <>
                            <section className="mb-8">
                                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                    <div className="bg-gray-200 p-6 text-gray-800 flex justify-between">
                                        <div className="flex items-center">
                                            <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                                                <FaUser className="h-6 w-6" />
                                            </div>
                                            <div>
                                                {isEditing ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={editData.name || ''}
                                                            onChange={handleEditChange}
                                                            className="text-2xl font-bold text-gray-800 border-b border-gray-300"
                                                        />
                                                        <div className="flex items-center space-x-4 mt-1">
                                                            <select
                                                                name="designation"
                                                                value={editData.designation || ''}
                                                                onChange={handleEditChange}
                                                                className="border-b border-gray-300 w-32"
                                                            >
                                                                {designations.map(designation => (
                                                                    <option key={designation.designationID} value={designation.designationName}>{designation.designationName}</option>
                                                                ))}
                                                            </select>
                                                            •
                                                            <select
                                                                name="department"
                                                                value={editData.department || ''}
                                                                onChange={handleEditChange}
                                                                className="border-b border-gray-300 w-32"
                                                            >
                                                                {departments.map(department => (
                                                                    <option key={department.departmentID} value={department.departmentName}>{department.departmentName}</option>
                                                                ))}
                                                            </select>
                                                            •
                                                            <select
                                                                name="role"
                                                                value={editData.role || ''}
                                                                onChange={handleEditChange}
                                                                className="border-b border-gray-300 bg-transparent"
                                                            >
                                                                <option value="">Select Role</option>
                                                                {roles.map(role => (
                                                                    <option key={role.roleID} value={role.rolename}>{role.rolename}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className='flex items-center space-x-2'>
                                                            <h2 className="text-2xl font-bold">{userData.Name}</h2>
                                                            <p className='text-gray-500 capitalize'>{userData.Role}</p>
                                                        </div>
                                                        <p className="text-gray-600">{userData.Designation} • {userData.Department}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={handleSave}
                                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full mr-2"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={handleEdit}
                                                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-full"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={handleDelete}
                                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full ml-2"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {displayOrEdit({ title: "Employee ID", icon: <FaIdBadge className="text-gray-600" />, stateKey: "E_ID" }, "e_id")}
                                        {displayOrEdit({ title: "Email", icon: <FaEnvelope className="text-gray-600" />, stateKey: "email" }, "email")}
                                        {displayOrEdit({ title: "Phone", icon: <FaPhone className="text-gray-600" />, stateKey: "Phone" }, "phone")}
                                        {displayOrEdit({ title: "Company", icon: <FaBuilding className="text-gray-600" />, stateKey: "Company_name" }, "company_name")}
                                        {displayOrEdit({ title: "Designation", icon: <MdWork className="text-gray-600 text-xl" />, stateKey: "Designation" }, "designation")}
                                        {displayOrEdit({ title: "Department", icon: <MdDepartureBoard className="text-gray-600 text-xl" />, stateKey: "Department" }, "department")}
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-5">Movement History</h2>
                                <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Search by place, party or purpose..."
                                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="all">All Statuses</option>
                                            {punchStatuses.map(status => (
                                                <option key={status.statusID} value={status.statusName}>{status.statusName}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={downloadCSV}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            <FiDownload /> Export
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={dateRange.start}
                                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={dateRange.end}
                                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                        />
                                    </div>
                                </div>

                                {filteredData.length === 0 ? (
                                    <div className="bg-white rounded-lg shadow p-6 text-center">
                                        <p className="text-gray-500">No movement reports found matching your criteria</p>
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setStatusFilter('all');
                                                setDateRange({ start: '', end: '' });
                                            }}
                                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg shadow overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                            onClick={() => requestSort('username')}
                                                        >
                                                            <div className="flex items-center">
                                                                User
                                                                <FaSort className="ml-1 text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                            onClick={() => requestSort('dateTime')}
                                                        >
                                                            <div className="flex items-center">
                                                               Submitted Date/Time
                                                                <FaSort className="ml-1 text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Punch Time
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                            onClick={() => requestSort('punchTime')}
                                                        >
                                                            <div className="flex items-center">
                                                                Punch Status
                                                                <FaSort className="ml-1 text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                            onClick={() => requestSort('visitingStatus')}
                                                        >
                                                            <div className="flex items-center">
                                                                Visit Status
                                                                <FaSort className="ml-1 text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Place
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Party
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Purpose
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Remarks
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {currentRows.map((report) => (
                                                        <tr key={report.movementID} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900">{report.username}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-500">{formatDateTime(report.dateTime)}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-500">{formatTime12Hour(report.punchingTime)}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-500">{(report.punchTime)}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {getStatusBadge(report.visitingStatus)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-500">{report.placeName || 'N/A'}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-500">{report.partyName || 'N/A'}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-sm text-gray-500">{report.purpose || 'Not specified'}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-sm text-gray-500">
                                                                    {report.remark || 'Not specified'}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                            <div className="flex-1 flex justify-between sm:hidden">
                                                <button
                                                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                                                    disabled={currentPage === 1}
                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    Previous
                                                </button>
                                                <button
                                                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-700">
                                                        Showing <span className="font-medium">{indexOfFirstRow + 1}</span> to{' '}
                                                        <span className="font-medium">{Math.min(indexOfLastRow, filteredData.length)}</span> of{' '}
                                                        <span className="font-medium">{filteredData.length}</span> results
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center">
                                                        <span className="text-sm text-gray-700 mr-2">Rows per page:</span>
                                                        <select
                                                            className="border rounded-md px-2 py-1 text-sm"
                                                            value={rowsPerPage}
                                                            onChange={(e) => {
                                                                setRowsPerPage(Number(e.target.value));
                                                                setCurrentPage(1);
                                                            }}
                                                        >
                                                            {[5, 10, 25, 50, 100].map((size) => (
                                                                <option key={size} value={size}>
                                                                    {size}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                        <button
                                                            onClick={() => paginate(1)}
                                                            disabled={currentPage === 1}
                                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                        >
                                                            <span className="sr-only">First</span>
                                                            <MdFirstPage className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => paginate(Math.max(1, currentPage - 1))}
                                                            disabled={currentPage === 1}
                                                            className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                        >
                                                            <span className="sr-only">Previous</span>
                                                            <MdChevronLeft className="h-5 w-5" />
                                                        </button>
                                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                            let pageNum;
                                                            if (totalPages <= 5) {
                                                                pageNum = i + 1;
                                                            } else if (currentPage <= 3) {
                                                                pageNum = i + 1;
                                                            } else if (currentPage >= totalPages - 2) {
                                                                pageNum = totalPages - 4 + i;
                                                            } else {
                                                                pageNum = currentPage - 2 + i;
                                                            }
                                                            return (
                                                                <button
                                                                    key={pageNum}
                                                                    onClick={() => paginate(pageNum)}
                                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    {pageNum}
                                                                </button>
                                                            );
                                                        })}
                                                        <button
                                                            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                                            disabled={currentPage === totalPages}
                                                            className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                        >
                                                            <span className="sr-only">Next</span>
                                                            <MdChevronRight className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => paginate(totalPages)}
                                                            disabled={currentPage === totalPages}
                                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                        >
                                                            <span className="sr-only">Last</span>
                                                            <MdLastPage className="h-5 w-5" />
                                                        </button>
                                                    </nav>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UserProfile;