import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../auth/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import { FiDownload, FiSearch, FiCalendar } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import {
    FiEdit,
    FiSave,
    FiUser,
    FiBriefcase,
    FiHome,
    FiPhone,
    FiClock,
    FiMapPin,
    FiUsers,
    FiTarget,
    FiFileText,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight
} from 'react-icons/fi';
import { Skeleton } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const UserReport = () => {
    const { user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [movementData, setMovementData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [editRowId, setEditRowId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState({
        startDate: null,
        endDate: null
    });
    const [userImage, setUserImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(Date.now());
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !user.userID) return;
            setIsLoading(true);
            try {
                const userRes = await axios.get(`${baseUrl}/users/${user.userID}`);
                setUserData(userRes.data.data);
                
                try {
                    const movementRes = await axios.get(`${baseUrl}/get_movement/${user.userID}`);
                    const movement = movementRes.data;
                    const dataArray = Array.isArray(movement) ? movement : [movement];
                    setMovementData(dataArray);
                    setFilteredData(dataArray);
                } catch (movementErr) {
                    console.error('Error fetching movement data:', movementErr);
                    setMovementData([]);
                    setFilteredData([]);
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                toast.error('Failed to load user data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Get User Image from API
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

    // Apply filters whenever search term or date range changes
    useEffect(() => {
        let result = movementData;

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item =>
                (item.placeName && item.placeName.toLowerCase().includes(term)) ||
                (item.partyName && item.partyName.toLowerCase().includes(term)) ||
                (item.purpose && item.purpose.toLowerCase().includes(term)) ||
                (item.punchTime && item.punchTime.toLowerCase().includes(term))
            );
        }

        // Apply status filter
        if (statusFilter) {
            result = result.filter(item => item.punchTime?.includes(statusFilter));
        }

        // Apply date filter
        if (dateFilter.startDate || dateFilter.endDate) {
            result = result.filter(item => {
                const itemDate = new Date(item.dateTime);
                const start = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
                const end = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

                if (start && end) {
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    return itemDate >= start && itemDate <= end;
                } else if (start) {
                    start.setHours(0, 0, 0, 0);
                    return itemDate >= start;
                } else if (end) {
                    end.setHours(23, 59, 59, 999);
                    return itemDate <= end;
                }
                return true;
            });
        }

        setFilteredData(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, dateFilter, movementData, statusFilter]);

    // Pagination logic
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const handleEditClick = (movement) => {
        setEditRowId(movement.movementID);
        setEditFormData({
            ...movement,
            punchingTime: movement.punchingTime || '',
            purpose: movement.purpose || '',
            remark: movement.remark || '',
            punchTime: movement.punchTime || '',
            visitingStatus: movement.visitingStatus || '',
            placeName: movement.placeName || '',
            partyName: movement.partyName || '',
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveClick = async () => {
        try {
            const original = movementData.find(m => m.movementID === editRowId);

            await axios.put(`${baseUrl}/update_movement/${editRowId}`, editFormData);

            // Save history
            await axios.post(`${baseUrl}/movement_edit_logs`, {
                userID: user.userID,
                movementID: editRowId,
                originalData: original,
                updatedData: editFormData,
                editTime: new Date().toISOString()
            });

            setMovementData((prevData) =>
                prevData.map((item) =>
                    item.movementID === editRowId ? { ...item, ...editFormData } : item
                )
            );

            setEditRowId(null);
            toast.success('Movement record updated successfully!');
        } catch (err) {
            console.error('Error updating movement record:', err);
            toast.error('Failed to update record. Please try again.');
        }
    };

    const handleCancelClick = () => {
        setEditRowId(null);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getInitials = (name) => {
        if (!name) return '';
        const names = name.split(' ');
        return names.map(n => n[0]).join('').toUpperCase();
    };

    const pageSizeOptions = [
        { value: 5, label: '5 rows' },
        { value: 10, label: '10 rows' },
        { value: 20, label: '20 rows' },
        { value: 50, label: '50 rows' },
        { value: 100, label: '100 rows' }
    ];

    const downloadCSV = () => {
        if (filteredData.length === 0) {
            toast.info('No data available to download');
            return;
        }

        // Prepare CSV header
        const headers = [
            'Date',
            'Status',
            'Punch Time',
            'Visit Status',
            'Place',
            'Party',
            'Purpose',
            'Remarks'
        ].join(',');

        // Prepare CSV rows
        const rows = filteredData.map(row => {
            return [
                new Date(row.dateTime).toLocaleDateString('en-US'),
                row.punchTime || 'N/A',
                row.punchingTime || 'N/A',
                row.visitingStatus,
                row.placeName,
                row.partyName,
                row.purpose || '-',
                row.remark || '-'
            ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        });

        // Combine header and rows
        const csvContent = [headers, ...rows].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `movement_report_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const clearDateFilters = () => {
        setDateFilter({ startDate: null, endDate: null });
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

            // Refresh the image by updating the file input key
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

    if (isLoading && !userData) {
        return (
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-6">User Report</h1>
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6 w-full md:w-1/3 flex flex-col items-center">
                        <Skeleton variant="circular" width={100} height={100} />
                        <Skeleton variant="text" width={120} height={30} className="mt-4 mb-2" />
                        <Skeleton variant="text" width={80} height={20} />
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 w-full md:w-2/3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center mb-4">
                                <Skeleton variant="rectangular" width={40} height={40} className="mr-4" />
                                <div>
                                    <Skeleton variant="text" width={80} height={15} className="mb-1" />
                                    <Skeleton variant="text" width={120} height={20} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <h2 className="text-xl font-semibold mb-4">Movement Data</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {[...Array(8)].map((_, i) => (
                                    <th key={i} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <Skeleton variant="text" width={80} height={15} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[...Array(5)].map((_, i) => (
                                <tr key={i}>
                                    {[...Array(8)].map((_, j) => (
                                        <td key={j} className="px-6 py-4 whitespace-nowrap">
                                            <Skeleton variant="text" width="80%" height={20} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (!user || !userData) {
        return (
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-6">User Report</h1>
                <div className="bg-white rounded-lg shadow p-6">No user data available.</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <ToastContainer position="top-right" autoClose={3000} />
            <h1 className="text-2xl font-bold mb-6">Movement Reports</h1>

            <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6 w-full md:w-1/3 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold mb-4 overflow-hidden">
                        {userImage ? (
                            <img
                                src={userImage}
                                alt="User Profile"
                                className="rounded-full w-24 h-24 object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/150';
                                }}
                            />
                        ) : (
                            <span>{getInitials(userData?.Name)}</span>
                        )}
                    </div>
                    <h2 className="text-xl font-semibold">{userData.Name}</h2>
                    <p className="text-gray-500">{userData.Designation}</p>

                    <div className="flex space-x-2 mt-4">
                        <label 
                            htmlFor="profile-upload" 
                            className={`px-3 py-1 text-sm rounded-md cursor-pointer ${
                                isUploading 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {isUploading ? 'Uploading...' : 'Change Image'}
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
                            className={`px-3 py-1 text-sm rounded-md ${
                                !userImage || isUploading
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                        >
                            Remove Image
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 w-full md:w-2/3">
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                                <FiBriefcase size={18} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Company</p>
                                <p className="font-medium">{userData.Company_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                                <FiBriefcase size={18} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Department</p>
                                <p className="font-medium">{userData.Department}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                                <FiHome size={18} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Designation</p>
                                <p className="font-medium">{userData.Designation}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                                <FiPhone size={18} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">{userData.Phone}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center mb-4">
                <FiClock size={20} className="mr-2" />
                <h2 className="text-xl font-semibold">Movement History</h2>
            </div>

            {movementData.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    No movement data available for this user.
                </div>
            ) : (
                <>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Search by place, party, purpose..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Punch Status</option>
                            <option value="Punch In">Punch In</option>
                            <option value="Punch Out">Punch Out</option>
                        </select>

                        <div className="flex flex-col md:flex-row items-start md:items-center space-x-2"> 
                            <FiCalendar className="text-gray-400" />
                            <span className="text-sm text-gray-500">From:</span>
                            <DatePicker
                                selected={dateFilter.startDate}
                                onChange={(date) => setDateFilter({ ...dateFilter, startDate: date })}
                                selectsStart
                                startDate={dateFilter.startDate}
                                endDate={dateFilter.endDate}
                                placeholderText="Start date"
                                dateFormat="dd MMM yyyy"
                                isClearable
                                className="px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <span className="text-sm text-gray-500">To:</span>
                            <DatePicker
                                selected={dateFilter.endDate}
                                onChange={(date) => setDateFilter({ ...dateFilter, endDate: date })}
                                selectsEnd
                                startDate={dateFilter.startDate}
                                endDate={dateFilter.endDate}
                                minDate={dateFilter.startDate}
                                placeholderText="End date"
                                dateFormat="dd MMM yyyy"
                                isClearable
                                className="px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {(dateFilter.startDate || dateFilter.endDate) && (
                                <button
                                    onClick={clearDateFilters}
                                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        <button
                            onClick={downloadCSV}
                            disabled={filteredData.length === 0}
                            className={`flex items-center px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm ${
                                filteredData.length === 0 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                        >
                            <FiDownload className="mr-2" />
                            Download CSV ({filteredData.length} records)
                        </button>
                    </div>

                    {filteredData.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            No movement data found matching your criteria.
                        </div>
                    ) : (
                        <>
                            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Punch Time
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Punch Status
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Visit Status
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
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {currentRows.map((mv) => (
                                                <tr key={mv.movementID}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(mv.dateTime).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {editRowId === mv.movementID ? (
                                                            <input
                                                                type="time"
                                                                name="punchingTime"
                                                                value={editFormData.punchingTime}
                                                                onChange={handleInputChange}
                                                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                            />
                                                        ) : (
                                                            mv.punchingTime
                                                                ? new Date(`1970-01-01T${mv.punchingTime}`).toLocaleTimeString('en-US', {
                                                                    hour: 'numeric',
                                                                    minute: 'numeric',
                                                                    hour12: true,
                                                                })
                                                                : 'N/A'
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {editRowId === mv.movementID ? (
                                                            <select
                                                                name="punchTime"
                                                                value={editFormData.punchTime}
                                                                onChange={handleInputChange}
                                                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                            >
                                                                <option value="">Select</option>
                                                                <option value="Punch In">Punch In</option>
                                                                <option value="Punch Out">Punch Out</option>
                                                            </select>
                                                        ) : (
                                                            mv.punchTime || 'N/A'
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {editRowId === mv.movementID ? (
                                                            <input
                                                                name="visitingStatus"
                                                                type="text"
                                                                value={editFormData.visitingStatus}
                                                                onChange={handleInputChange}
                                                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                            />
                                                        ) : (
                                                            mv.visitingStatus
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {editRowId === mv.movementID ? (
                                                            <input
                                                                name="placeName"
                                                                type="text"
                                                                value={editFormData.placeName}
                                                                onChange={handleInputChange}
                                                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                            />
                                                        ) : (
                                                            mv.placeName
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {editRowId === mv.movementID ? (
                                                            <input
                                                                name="partyName"
                                                                type="text"
                                                                value={editFormData.partyName}
                                                                onChange={handleInputChange}
                                                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                            />
                                                        ) : (
                                                            mv.partyName
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {editRowId === mv.movementID ? (
                                                            <input
                                                                type="text"
                                                                name="purpose"
                                                                value={editFormData.purpose}
                                                                onChange={handleInputChange}
                                                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                            />
                                                        ) : (
                                                            mv.purpose || '-'
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {editRowId === mv.movementID ? (
                                                            <input
                                                                type="text"
                                                                name="remark"
                                                                value={editFormData.remark}
                                                                onChange={handleInputChange}
                                                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                            />
                                                        ) : (
                                                            mv.remark || '-'
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {(() => {
                                                            if (!mv.dateTime) return null;

                                                            const submittedTime = new Date(mv.dateTime);
                                                            const now = new Date();
                                                            const diffMinutes = (now - submittedTime) / 1000 / 60;

                                                            if (diffMinutes <= 10) {
                                                                return editRowId === mv.movementID ? (
                                                                    <div className="flex space-x-1">
                                                                        <button
                                                                            onClick={handleSaveClick}
                                                                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs flex items-center"
                                                                        >
                                                                            <FiSave className="mr-1" size={12} /> Save
                                                                        </button>
                                                                        <button
                                                                            onClick={handleCancelClick}
                                                                            className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleEditClick(mv)}
                                                                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center"
                                                                    >
                                                                        <FiEdit className="mr-1" size={12} /> Edit
                                                                    </button>
                                                                );
                                                            } else {
                                                                return <span className="text-gray-500 font-semibold">Done</span>;
                                                            }
                                                        })()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3 bg-white rounded-lg shadow">
                                <div className="w-full md:w-auto mb-4 md:mb-0">
                                    <Select
                                        options={pageSizeOptions}
                                        onChange={(e) => setRowsPerPage(e.value)}
                                        value={pageSizeOptions.find(opt => opt.value === rowsPerPage)}
                                        placeholder="Rows per page"
                                        className="w-32"
                                        classNamePrefix="select"
                                        menuPlacement="auto"
                                    />
                                </div>
                                <div className="text-sm text-gray-700 mb-4 md:mb-0">
                                    Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredData.length)} of {filteredData.length} entries
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => paginate(1)}
                                        disabled={currentPage === 1}
                                        className={`px-2 py-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <FiChevronsLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-2 py-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <FiChevronLeft size={16} />
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
                                                className={`px-3 py-1 rounded-md ${currentPage === pageNum ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`px-2 py-1 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <FiChevronRight size={16} />
                                    </button>
                                    <button
                                        onClick={() => paginate(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className={`px-2 py-1 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <FiChevronsRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default UserReport;