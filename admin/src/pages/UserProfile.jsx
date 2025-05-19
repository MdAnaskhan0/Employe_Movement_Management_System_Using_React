import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaClock, FaMapMarkerAlt, FaBuilding, FaPhone, FaEnvelope, FaIdBadge } from 'react-icons/fa';
import { MdWork, MdDepartureBoard, MdDescription, MdNote } from 'react-icons/md';
import Sidebar from '../components/Sidebar/Sidebar';
import axios from 'axios';

const UserProfile = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [movementData, setMovementData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { userID } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await axios.get(`http://localhost:5137/users/${userID}`);
                setUserData(userRes.data.data);

                const movementRes = await axios.get(`http://localhost:5137/movementdata/${userID}`);
                setMovementData(movementRes.data.data || []);

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userID]);

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        navigate('/');
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
                    <div className="w-6"></div> {/* Spacer for alignment */}
                </header>

                <main className="flex-grow overflow-auto p-6 bg-gray-50">
                    {/* User Info Card */}
                    <section className="mb-8">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="bg-gray-200 p-6 text-gray-800">
                                <div className="flex items-center">
                                    <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                                        <FaUser className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{userData.Name}</h2>
                                        <p className="text-gray-600">{userData.Designation} • {userData.Department}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="flex items-start">
                                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                        <FaIdBadge className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Employee ID</h3>
                                        <p className="text-lg font-semibold">{userData.E_ID}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                        <FaEnvelope className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                        <p className="text-lg font-semibold">{userData.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                        <FaPhone className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                                        <p className="text-lg font-semibold">{userData.Phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                        <FaBuilding className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Company</h3>
                                        <p className="text-lg font-semibold">{userData.Company_name}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                        <MdWork className="text-blue-600 text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Designation</h3>
                                        <p className="text-lg font-semibold">{userData.Designation}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                        <MdDepartureBoard className="text-blue-600 text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Department</h3>
                                        <p className="text-lg font-semibold">{userData.Department}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Movement Data Section */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Movement History</h2>
                            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                                {movementData.length} records
                            </span>
                        </div>

                        {movementData.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                                <div className="text-gray-400 mb-4">
                                    <FaMapMarkerAlt className="inline-block text-4xl" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-600 mb-1">No movement data available</h3>
                                <p className="text-gray-500">This user hasn't recorded any movements yet.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <div className="flex items-center">
                                                        <FaClock className="mr-2" /> Date
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Time
                                                </th>
                                                {/* rest of your headers remain unchanged */}
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Punch Time
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <div className="flex items-center">
                                                        <FaMapMarkerAlt className="mr-2" /> Location
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Party
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <div className="flex items-center">
                                                        <MdDescription className="mr-2" /> Purpose
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <div className="flex items-center">
                                                        <MdNote className="mr-2" /> Remarks
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {movementData.map((mv, index) => {
                                                const dt = new Date(mv.dateTime);

                                                // Format date as YYYY-MM-DD
                                                const datePart = dt.toLocaleDateString('en-CA'); // en-CA gives ISO format yyyy-mm-dd

                                                // Format time as 12-hour with AM/PM
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
                                                            {mv.punchTime}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
            ${mv.visitingStatus === 'In' ? 'bg-green-100 text-green-800' :
                                                                    mv.visitingStatus === 'Out' ? 'bg-red-100 text-red-800' :
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
                    </section>
                </main>
            </div>
        </div>
    );
};

export default UserProfile;