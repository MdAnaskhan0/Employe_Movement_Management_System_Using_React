import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  IoPeople,
  IoBusiness,
  IoGitBranch,
  IoShirt,
  IoLibrary,
  IoBriefcase,
  IoPerson,
  IoShieldCheckmark,
  IoArrowForward
} from 'react-icons/io5';
import { IoIosArrowForward } from 'react-icons/io';
import { MdConnectWithoutContact } from "react-icons/md";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [movementData, setMovementData] = useState([]);
  const [teams, setTeams] = useState([]);
  const [companyNames, setCompanyNames] = useState([]);
  const [branchNames, setBranchNames] = useState([]);
  const [partyNames, setPartyNames] = useState([]);
  const [departmentNames, setDepartmentNames] = useState([]);
  const [designationNames, setDesignationNames] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          resusers, 
          resMovement, 
          resteams, 
          rescompanynames, 
          resbranchnames, 
          respartynames, 
          resdepartmentnames, 
          resdesignationnames, 
          resroles
        ] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/users`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/get_all_movement`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/teams`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/companynames`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/branchnames`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/partynames`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/departments`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/designations`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/roles`)
        ]);

        setUsers(resusers.data.data);
        setMovementData(resMovement.data);
        setTeams(resteams.data.data);
        setCompanyNames(rescompanynames.data.data);
        setBranchNames(resbranchnames.data);
        setPartyNames(respartynames.data);
        setDepartmentNames(resdepartmentnames.data);
        setDesignationNames(resdesignationnames.data);
        setRoles(resroles.data);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const cards = [
    {
      title: 'Users',
      count: users.length,
      icon: <IoPeople size={24} />,
      color: 'bg-blue-500',
      action: () => navigate('/admin/users')
    },
    {
      title: 'Movement Data',
      count: movementData.length,
      icon: <IoArrowForward size={24} />,
      color: 'bg-green-500',
      action: () => navigate('/admin/movements')
    },
    {
      title: 'Teams',
      count: teams.length,
      icon: <IoPeople size={24} />,
      color: 'bg-purple-500',
      action: () => navigate('/admin/teams')
    },
    {
      title: 'Companies',
      count: companyNames.length,
      icon: <IoBusiness size={24} />,
      color: 'bg-red-500',
      action: () => navigate('/admin/companies')
    },
    {
      title: 'Branches',
      count: branchNames.length,
      icon: <IoGitBranch size={24} />,
      color: 'bg-yellow-500',
      action: () => navigate('/admin/branches')
    },
    {
      title: 'Parties',
      count: partyNames.length,
      icon: <MdConnectWithoutContact size={24} />,
      color: 'bg-indigo-500',
      action: () => navigate('/admin/parties')
    },
    {
      title: 'Departments',
      count: departmentNames.length,
      icon: <IoLibrary size={24} />,
      color: 'bg-pink-500',
      action: () => navigate('/admin/departments')
    },
    {
      title: 'Designations',
      count: designationNames.length,
      icon: <IoBriefcase size={24} />,
      color: 'bg-teal-500',
      action: () => navigate('/admin/designations')
    },
    {
      title: 'Roles',
      count: roles.length,
      icon: <IoShieldCheckmark size={24} />,
      color: 'bg-orange-500',
      action: () => navigate('/admin/roles')
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
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
            
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.count}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;