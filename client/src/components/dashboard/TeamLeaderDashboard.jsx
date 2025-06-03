import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import axios from 'axios';
import {ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaUpload,
} from 'react-icons/fa';
import {
  MdOutlineAnalytics
} from 'react-icons/md';
import {
  HiOutlineDocumentReport, HiOutlineUserGroup
} from 'react-icons/hi';
import { IoIosArrowForward } from 'react-icons/io';
import { FaCommentDots } from 'react-icons/fa';

const TeamLeaderDashboard = ({ movementData }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const cards = [
    {
      title: "New Report",
      icon: <FaUpload size={24} />,
      action: () => navigate('/user/upload-report'),
      color: "bg-blue-600"
    },
    {
      title: "My Reports",
      icon: <HiOutlineDocumentReport size={24} />,
      action: () => navigate('/user/UserReport'),
      color: "bg-indigo-600"
    },
    {
      title: "Team View",
      icon: <HiOutlineUserGroup size={24} />,
      action: () => navigate('/team/manage-team'),
      color: "bg-purple-600"
    },
    {
      title: "Team Reports",
      icon: <MdOutlineAnalytics size={24} />,
      action: () => navigate('/team/team-report'),
      color: "bg-green-600"
    },
    {
      title: "Team Massage",
      icon: <FaCommentDots size={24} />,
      action: () => navigate('/team/team-massage'),
      color: "bg-red-600"
    }
  ];

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
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Team Leader Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage reports and your team</p>
      </div>

      {/* Main Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={card.action}
            className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition duration-300 border border-gray-100 group"
          >
            <div className='flex items-center justify-between'>
              <div className={`${card.color} p-3 rounded-lg text-white`}>
                {card.icon}
              </div>
              <div className='flex items-center'>
                <p className='text-sm text-gray-500'>View details</p>
                <IoIosArrowForward className="ml-1 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </div>

            <div className="flex flex-col items-start">
              <h3 className="font-semibold text-gray-800 my-2">{card.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamLeaderDashboard;