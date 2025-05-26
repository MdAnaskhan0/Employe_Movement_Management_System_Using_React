import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaClock, FaMapMarkerAlt, FaBuilding, FaPhone, FaEnvelope, FaIdBadge, FaPeopleArrows, FaFingerprint, FaRegBuilding } from 'react-icons/fa';
import { CiCalendarDate } from "react-icons/ci";
import { MdWork, MdDepartureBoard, MdDescription, MdNote } from 'react-icons/md';
import { FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Sidebar from '../components/Sidebar/Sidebar';
import axios from 'axios';

const UserProfile = () => {
    // All hooks must be called unconditionally at the top level
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [movementData, setMovementData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [punchStatus, setPunchStatus] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [roles, setRoles] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [companyNames, setCompanyNames] = useState([]);
    const [punchStatuses, setPunchStatuses] = useState([]);
    const [visitingStatuses, setVisitingStatuses] = useState([]);

    const navigate = useNavigate();
    const { userID } = useParams();
    const rowsPerPage = 5;

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await axios.get(`http://192.168.111.140:5137/users/${userID}`);
                setUserData(userRes.data.data);

                const movementRes = await axios.get(`http://192.168.111.140:5137/get_movement/${userID}`);
                console.log(movementRes.data);
                setMovementData(movementRes.data || []);
                setFilteredData(movementRes.data || []);

                // Fetch dropdown data
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
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userID]);

    // Apply filters whenever filter criteria or movementData changes
    useEffect(() => {
        let filtered = [...movementData];

        // Search filter
        if (searchText.trim()) {
            const lowerSearch = searchText.toLowerCase();
            filtered = filtered.filter(item =>
                (item.placeName?.toLowerCase().includes(lowerSearch)) ||
                (item.partyName?.toLowerCase().includes(lowerSearch)) ||
                (item.purpose?.toLowerCase().includes(lowerSearch)) ||
                (item.remark?.toLowerCase().includes(lowerSearch)) ||
                (item.visitingStatus?.toLowerCase().includes(lowerSearch))
            );
        }

        // Punch Status filter
        if (punchStatus && punchStatus !== '*') {
            filtered = filtered.filter(item =>
                item.punchTime === punchStatus
            );
        }

        // Inclusive Date From - To filter
        if (dateFrom || dateTo) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.dateTime);
                const fromDate = dateFrom ? new Date(dateFrom + 'T00:00:00') : null;
                const toDate = dateTo ? new Date(dateTo + 'T23:59:59') : null;

                const matchesFrom = !fromDate || itemDate >= fromDate;
                const matchesTo = !toDate || itemDate <= toDate;

                return matchesFrom && matchesTo;
            });
        }

        setFilteredData(filtered);
        setCurrentPage(1);
    }, [searchText, punchStatus, dateFrom, dateTo, movementData]);

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        navigate('/');
    };

    // Handle edit button click
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

    // Handle cancel edit button click
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditData({});
    };

    // Handle edit form change
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    // Handle save button click
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
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle delete button click
    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await axios.delete(`http://192.168.111.140:5137/users/${userID}`);
            navigate('/alluser');
        } catch (err) {
            setError(err.message);
        }
    };

    const displayOrEdit = (label, key) => (
        <div className="flex items-start">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
                {label.icon}
            </div>
            <div>
                <h3 className="text-sm font-medium text-gray-500">{label.title}</h3>
                {isEditing ? (
                    key === 'role' ? (
                        <select
                            name={key}
                            value={editData[key] || ''}
                            onChange={handleEditChange}
                            className="text-lg font-semibold text-gray-800 border-b border-gray-300 focus:outline-none bg-transparent"
                        >
                            {roles.map(role => (
                                <option key={role.roleID} value={role.rolename}>{role.rolename}</option>
                            ))}
                        </select>
                    ) : key === 'designation' ? (
                        <select
                            name={key}
                            value={editData[key] || ''}
                            onChange={handleEditChange}
                            className="text-lg font-semibold text-gray-800 border-b border-gray-300 focus:outline-none bg-transparent"
                        >
                            {designations.map(designation => (
                                <option key={designation.designationID} value={designation.designationName}>{designation.designationName}</option>
                            ))}
                        </select>
                    ) : key === 'department' ? (
                        <select
                            name={key}
                            value={editData[key] || ''}
                            onChange={handleEditChange}
                            className="text-lg font-semibold text-gray-800 border-b border-gray-300 focus:outline-none bg-transparent"
                        >
                            {departments.map(department => (
                                <option key={department.departmentID} value={department.departmentName}>{department.departmentName}</option>
                            ))}
                        </select>
                    ) : key === 'company_name' ? (
                        <select
                            name={key}
                            value={editData[key] || ''}
                            onChange={handleEditChange}
                            className="text-lg font-semibold text-gray-800 border-b border-gray-300 focus:outline-none bg-transparent"
                        >
                            {companyNames.map(company => (
                                <option key={company.companynameID} value={company.companyname}>{company.companyname}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            name={key}
                            value={editData[key] || ''}
                            onChange={handleEditChange}
                            className="text-lg font-semibold text-gray-800 border-b border-gray-300 focus:outline-none"
                        />
                    )
                ) : (
                    <p className="text-lg font-semibold">{userData[label.stateKey]}</p>
                )}
            </div>
        </div>
    );

    // Download excel button
    const handleDownloadExcel = () => {
        const isFilterApplied =
            searchText.trim() ||
            (punchStatus && punchStatus !== '*') ||
            dateFrom ||
            dateTo;

        const dataToExport = isFilterApplied ? filteredData : movementData;

        if (dataToExport.length === 0) {
            alert("No data to export.");
            return;
        }

        const exportData = dataToExport.map(item => ({
            Date: new Date(item.dateTime).toLocaleDateString('en-CA'),
            Time: new Date(item.dateTime).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
            }),
            'Punch Time': item.punchTime,
            Status: item.visitingStatus,
            Location: item.placeName,
            Party: item.partyName,
            Purpose: item.purpose,
            Remarks: item.remark,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Movement History');

        const excelBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
        });

        const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        saveAs(blob, `movement_history_${isFilterApplied ? 'filtered' : 'full'}.xlsx`);
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center h-screen">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
                <strong>Error:</strong> {error}
            </div>
        </div>
    );

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
                                {/* {displayOrEdit({ title: "Role", icon: <FaUser className="text-gray-600" />, stateKey: "Role" }, "role")} */}
                            </div>
                        </div>
                    </section>

                    {/* Movement Data Section */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-5">Movement History</h2>
                        <div className="flex justify-between items-center mb-4">
                            {/* Filters */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="px-3 py-2 border rounded"
                                />

                                <select
                                    value={punchStatus}
                                    onChange={(e) => setPunchStatus(e.target.value)}
                                    className="px-3 py-2 border rounded"
                                >
                                    <option value="*">Punch Time</option>
                                    <option value="Punch In">Punch In</option>
                                    <option value="Punch Out">Punch Out</option>
                                </select>

                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="px-3 py-2 border rounded"
                                />

                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="px-3 py-2 border rounded"
                                />

                                <button
                                    onClick={() => {
                                        setSearchText('');
                                        setPunchStatus('');
                                        setDateFrom('');
                                        setDateTo('');
                                    }}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full"
                                >
                                    Clear
                                </button>
                            </div>

                            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                                {filteredData.length} records
                            </span>
                        </div>

                        {currentRows.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                                <div className="text-gray-400 mb-4">
                                    <FaMapMarkerAlt className="inline-block text-4xl" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-600 mb-1">No movement data matches your filters</h3>
                                <p className="text-gray-500">Try adjusting your search criteria.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-800">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    <div className="flex items-center">
                                                        <CiCalendarDate className='mr-2' /> Date
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    <div className="flex items-center">
                                                        <FaClock className="mr-2" /> Submited Time
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    <div className="flex items-center">
                                                        <FaClock className="mr-2" /> Punch Time
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    <div className='flex items-center'>
                                                        <FaFingerprint className="mr-2" /> Punch Status
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    <div className="flex items-center">
                                                        <FaRegBuilding className='mr-2' /> Status
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    <div className="flex items-center">
                                                        <FaMapMarkerAlt className="mr-2" /> Location
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    <div className="flex items-center">
                                                        <FaPeopleArrows className="mr-2" /> Party
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    <div className="flex items-center">
                                                        <MdDescription className="mr-2" /> Purpose
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    <div className="flex items-center">
                                                        <MdNote className="mr-2" /> Remarks
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {currentRows.map((mv, index) => {
                                                const dt = new Date(mv.dateTime);
                                                const datePart = dt.toLocaleDateString('en-CA');
                                                const timePart = dt.toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: 'numeric',
                                                    hour12: true,
                                                });

                                                return (
                                                    <tr key={mv.movementID} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {datePart}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {timePart}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {mv.punchingTime}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {mv.punchTime}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                                ${mv.visitingStatus === 'Punch In' ? 'bg-green-100 text-green-800' :
                                                                    mv.visitingStatus === 'Punch Out' ? 'bg-red-100 text-red-800' :
                                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                                {mv.visitingStatus}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {mv.placeName}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {mv.partyName}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {mv.purpose}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                            {mv.remark}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        <div className='flex flex-col sm:flex-row justify-between items-center mt-6 gap-4'>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-md border border-gray-300 text-sm font-medium flex items-center ${currentPage === 1
                                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                        : 'text-gray-700 bg-white hover:bg-gray-50'
                                        } transition-colors duration-200`}
                                >
                                    <FiChevronLeft className="mr-1" /> Previous
                                </button>

                                <span className="text-sm font-medium text-gray-600">
                                    Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                                </span>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-md border border-gray-300 text-sm font-medium flex items-center ${currentPage === totalPages
                                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                        : 'text-gray-700 bg-white hover:bg-gray-50'
                                        } transition-colors duration-200`}
                                >
                                    Next <FiChevronRight className="ml-1" />
                                </button>
                            </div>

                            <button onClick={handleDownloadExcel} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none transition-colors duration-200 flex items-center">
                                <FiDownload className="mr-2" size={14} />
                                Download CSV
                            </button>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default UserProfile;