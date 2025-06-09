import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
    FiMenu, FiX, FiChevronDown, FiChevronRight,
    FiHome, FiUser, FiUpload, FiFileText, FiActivity,
    FiUserPlus, FiUsers, FiMessageSquare, FiBriefcase,
    FiLayers, FiMapPin, FiAward, FiFlag
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FaTeamspeak } from 'react-icons/fa';

// Define all possible menu items with their paths
const allMenuItems = {
    dashboard: {
        name: 'Dashboard',
        path: '/dashboard',
        icon: <FiHome size={18} />
    },
    profile: {
        name: 'Profile',
        path: '/user/profile',
        icon: <FiUser size={18} />
    },
    uploadReport: {
        name: 'Upload Report',
        path: '/user/upload-report',
        icon: <FiUpload size={18} />
    },
    userReport: {
        name: 'My Reports',
        path: '/user/UserReport',
        icon: <FiFileText size={18} />
    },
    movementReports: {
        name: 'Movement Reports',
        path: '/admin/movement-reports',
        icon: <FiActivity size={18} />
    },
    teamInformation:{
        name: "Team Information",
        path: "/team/manage-team",
        icon: <FaTeamspeak size={18} />
    },
    teamReport:{
        name: "Team Report",
        path: "/team/team-report",
        icon: <FaTeamspeak size={18} />
    },
    createUser: {
        name: 'Create User',
        path: '/admin/create-user',
        icon: <FiUserPlus size={18} />
    },
    users: {
        name: 'Users',
        path: '/admin/Users',
        icon: <FiUsers size={18} />
    },
    teams: {
        name: 'Teams',
        path: '/admin/teams',
        icon: <FiUsers size={18} />
    },
    teamMassage: {
        name: 'Team Messages',
        path: '/user/team-massage',
        icon: <FiMessageSquare size={18} />
    },
    companies: {
        name: 'Companies',
        path: '/admin/companynames',
        icon: <FiBriefcase size={18} />
    },
    departments: {
        name: 'Departments',
        path: '/admin/departments',
        icon: <FiLayers size={18} />
    },
    branchs: {
        name: 'Branchs',
        path: '/admin/branchs',
        icon: <FiMapPin size={18} />
    },
    designations: {
        name: 'Designations',
        path: '/admin/designations',
        icon: <FiAward size={18} />
    },
    visitingStatus: {
        name: 'Visiting Status',
        path: '/admin/visitingstatus',
        icon: <FiFlag size={18} />
    },
    parties: {
        name: 'Parties',
        path: '/admin/parties',
        icon: <FiUsers size={18} />
    }
};

export default function Sidebar() {
    const { user } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const sidebarRef = useRef(null);
    const [profileImage, setProfileImage] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const res = await axios.get(`${baseUrl}/users/${user.userID}/permissions`);
                setPermissions(res.data.data);
            } catch (error) {
                console.error('Error fetching permissions:', error);
            }
        };
        fetchPermissions();
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isMobile && isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, isOpen]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setIsOpen(!mobile);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (user && user.id) {
            setProfileImage(`/profile-image/${user.id}`);
        }
    }, [user]);

    if (!user) return null;

    if (permissions === null) {
        return (
            <div className="fixed md:relative inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-gray-800 to-gray-900 p-4">
                <div className="animate-pulse flex flex-col space-y-4">
                    <div className="h-16 bg-gray-700 rounded"></div>
                    <div className="h-10 bg-gray-700 rounded"></div>
                    <div className="h-10 bg-gray-700 rounded"></div>
                    <div className="h-10 bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    // Always-visible paths
    const alwaysVisible = ['/dashboard', '/user/profile'];

    const filteredMenu = Object.values(allMenuItems).filter(item => {
        return alwaysVisible.includes(item.path) || permissions[item.path] === 1;
    });

    const handleLinkClick = () => {
        if (isMobile) setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
                aria-label="Toggle menu"
            >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            <AnimatePresence>
                {isOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            <motion.aside
                ref={sidebarRef}
                initial={{ x: -300 }}
                animate={{ x: isOpen ? 0 : -300 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`fixed md:relative inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-gray-800 to-gray-900 text-gray-100 p-4 shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Profile */}
                    <div className="px-3 py-4 mb-4 border-b border-gray-700 flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center text-white font-bold">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>{user.name.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-100 truncate">{user.name}</h1>
                            <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                        </div>
                    </div>

                    {/* Menu items */}
                    <ul className="flex-1 space-y-1 overflow-y-auto">
                        {filteredMenu.length > 0 ? (
                            filteredMenu.map((item, idx) => (
                                <li key={idx}>
                                    <Link
                                        to={item.path}
                                        onClick={handleLinkClick}
                                        className={`block px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors ${location.pathname === item.path ? 'bg-indigo-600 text-white font-medium' : 'text-gray-300'}`}
                                    >
                                        <span className="flex items-center">
                                            {item.icon && <span className="mr-3 text-indigo-400">{item.icon}</span>}
                                            <span className="font-medium">{item.name}</span>
                                        </span>
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                No menu items available
                            </div>
                        )}
                    </ul>
                </div>
            </motion.aside>
        </>
    );
}
