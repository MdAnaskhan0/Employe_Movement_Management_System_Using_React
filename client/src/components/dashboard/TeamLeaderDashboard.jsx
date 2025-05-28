import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaIdCard, FaBuilding, FaPhone, FaEnvelope, FaUpload, FaChartBar } from 'react-icons/fa';
import { MdDepartureBoard, MdWork } from 'react-icons/md';
import { GiMovementSensor } from 'react-icons/gi';
import { BsGraphUp } from 'react-icons/bs';

const TeamLeaderDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [movementData, setMovementData] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${baseUrl}/users/${user.userID}`);
        const movementRes = await axios.get(`${baseUrl}/get_movement/${user.userID}`);
        setUserData(res.data.data);
        setMovementData(movementRes.data);
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {/* User Information Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <FaUser className="text-blue-500 text-2xl mr-3" />
            <h2 className="text-sm md:text-xl font-bold text-gray-800">User Information</h2>
          </div>
          <button
            onClick={() => navigate('/user/upload-report')}
            className="bg-blue-500 hover:bg-blue-600 text-white md:px-4 md:py-2 rounded-md flex items-center transition duration-300 text-sm md:text-base px-2 py-1"
          >
            <FaUpload className="mr-2" />
            Add Movement Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoCard icon={<FaUser />} title="Username" value={userData.username} />
          <InfoCard icon={<FaIdCard />} title="Name" value={userData.Name} />
          <InfoCard icon={<FaIdCard />} title="Employee ID" value={userData.E_ID} />
          <InfoCard icon={<MdDepartureBoard />} title="Department" value={userData.Department} />
          <InfoCard icon={<MdWork />} title="Designation" value={userData.Designation} />
          <InfoCard icon={<FaBuilding />} title="Company" value={userData.Company_name} />
          <InfoCard icon={<FaPhone />} title="Phone" value={userData.Phone} />
          <InfoCard icon={<FaEnvelope />} title="Email" value={userData.email} />
        </div>
      </div>

      {/* Movement Data Card */}
      <div
        onClick={() => navigate('/user/UserReport')}
        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <GiMovementSensor className="text-blue-500 text-2xl mr-3" />
            <h2 className="text-xl font-bold text-gray-800">Movement Reports</h2>
          </div>
          <div className="flex items-center">
            <span className="text-3xl font-bold mr-3">{movementData.length}</span>
            <BsGraphUp className="text-blue-500 text-2xl" />
          </div>
        </div>
        <p className="text-gray-600 mt-2">Click to view all movement reports</p>
      </div>
    </div>
  );
};

// Reusable InfoCard component
const InfoCard = ({ icon, title, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
    <div className="flex items-center mb-2">
      <span className="text-blue-500 mr-2">{icon}</span>
      <h3 className="font-semibold text-gray-700">{title}</h3>
    </div>
    <p className="text-gray-800">{value || 'N/A'}</p>
  </div>
);
export default TeamLeaderDashboard;
