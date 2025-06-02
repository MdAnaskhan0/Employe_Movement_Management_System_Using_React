import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaFileAlt, FaUsers } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { useAuth } from '../../auth/AuthContext';

const UserDashboard = () => {
  const { user, isLoading } = useAuth(); // Make sure your useAuth provides isLoading
  const navigate = useNavigate();

  const actionCards = [
    {
      title: "New Report",
      icon: <FaUpload size={20} />,
      color: "bg-blue-600",
      action: () => navigate('/user/upload-report')
    },
    {
      title: "View Reports",
      icon: <FaFileAlt size={20} />,
      color: "bg-green-600",
      action: () => navigate('/user/UserReport')
    },
    {
      title: "Teams",
      icon: <FaUsers size={20} />,
      color: "bg-indigo-600",
      action: () => navigate('/user/teams')
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 py-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Welcome back, {user?.name || user?.Name || user?.username || 'User'}
        </h1>
        <p className="text-gray-500 mt-2">Quickly access what you need</p>
      </div>

      {/* Rest of your component remains the same */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {actionCards.map((card, index) => (
          <div 
            key={index}
            onClick={card.action}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className={`${card.color} p-3 rounded-lg text-white`}>
                {card.icon}
              </div>
              <div className='flex items-center'>
                <p className='text-sm text-gray-500'>View details</p>
                <IoIosArrowForward className="ml-1 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;