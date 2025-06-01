import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaUser, FaIdCard, FaBuilding, FaPhone, 
  FaEnvelope, FaUpload, FaChartLine, FaArrowRight 
} from 'react-icons/fa';
import { 
  MdDepartureBoard, MdWork, MdOutlineAnalytics 
} from 'react-icons/md';
import { 
  GiMovementSensor, GiOfficeChair 
} from 'react-icons/gi';
import { 
  BsGraphUp, BsFillPersonLinesFill 
} from 'react-icons/bs';
import { 
  HiOutlineDocumentReport, HiOutlineUserGroup 
} from 'react-icons/hi';

const UserDashboard = ({ movementData }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${baseUrl}/users/${user.userID}`);
        setUserData(res.data.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.userID) {
      fetchUserData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back, {userData.Name || 'User'}!</p>
        </div>
        <button
          onClick={() => navigate('/user/upload-report')}
          className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center transition duration-300 shadow-md hover:shadow-lg mt-4 md:mt-0"
        >
          <FaUpload className="mr-2" />
          <span>Add Movement Report</span>
        </button>
      </div>

      {/* User Profile Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <BsFillPersonLinesFill className="text-blue-600 text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{userData.Name} Profile</h2>
              <p className="text-gray-600 text-sm">Your personal and professional details</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard 
            icon={<FaUser className="text-blue-600" />} 
            title="Username" 
            value={userData.username} 
            className="bg-white"
          />
          <InfoCard 
            icon={<FaIdCard className="text-blue-600" />} 
            title="Name" 
            value={userData.Name} 
            className="bg-white"
          />
          <InfoCard 
            icon={<FaIdCard className="text-blue-600" />} 
            title="Employee ID" 
            value={userData.E_ID} 
            className="bg-white"
          />
          <InfoCard 
            icon={<MdDepartureBoard className="text-blue-600" />} 
            title="Department" 
            value={userData.Department} 
            className="bg-white"
          />
        </div>
      </div>

      {/* Stats Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Movement Reports Card */}
        <div
          onClick={() => navigate('/user/UserReport')}
          className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition duration-300 border border-gray-100 group"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <GiMovementSensor className="text-indigo-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-800">Movement Reports</h3>
            </div>
            <FaArrowRight className="text-gray-400 group-hover:text-indigo-600 transition" />
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-3xl font-bold text-gray-800">{movementData.length}</p>
              <p className="text-gray-500 text-sm">Total reports submitted</p>
            </div>
            <div className="bg-indigo-50 p-2 rounded-lg">
              <FaChartLine className="text-indigo-600 text-xl" />
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <HiOutlineDocumentReport className="text-blue-600 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-800">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/user/upload-report')}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg flex flex-col items-center transition cursor-pointer"
            >
              <FaUpload className="text-lg mb-1" />
              <span className="text-xs font-medium">New Report</span>
            </button>
            <button 
              onClick={() => navigate('/user/UserReport')}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-3 rounded-lg flex flex-col items-center transition cursor-pointer"
            >
              <MdOutlineAnalytics className="text-lg mb-1" />
              <span className="text-xs font-medium">View Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Additional User Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <FaBuilding className="text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Organization Details</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard 
            icon={<MdWork className="text-blue-600" />} 
            title="Designation" 
            value={userData.Designation} 
          />
          <InfoCard 
            icon={<FaBuilding className="text-blue-600" />} 
            title="Company" 
            value={userData.Company_name} 
          />
          <InfoCard 
            icon={<FaPhone className="text-blue-600" />} 
            title="Phone" 
            value={userData.Phone} 
          />
          <InfoCard 
            icon={<FaEnvelope className="text-blue-600" />} 
            title="Email" 
            value={userData.email} 
          />
        </div>
      </div>
    </div>
  );
};

// Enhanced InfoCard component
const InfoCard = ({ icon, title, value, className = '' }) => (
  <div className={`bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-200 transition ${className}`}>
    <div className="flex items-center mb-2">
      <div className="mr-3">{icon}</div>
      <h3 className="font-medium text-gray-700 text-sm">{title}</h3>
    </div>
    <p className="text-gray-800 font-semibold">{value || 'Not specified'}</p>
  </div>
);

export default UserDashboard;