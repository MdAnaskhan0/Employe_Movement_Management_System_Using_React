import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { sidebarMenu } from '../../config/SidebarMenuConfig';
import { FiMenu, FiX, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
    const { user } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [activeSubmenus, setActiveSubmenus] = useState({});
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const sidebarRef = useRef(null);
    const [profileImage, setProfileImage] = useState(null);

    // Close sidebar on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isMobile && isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, isOpen]);

    // Handle resize
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

    // Submenu highlight
    useEffect(() => {
        if (user) {
            const role = user.role.toLowerCase().replace(/\s+/g, '');
            const menu = sidebarMenu[role] || [];
            const newActive = {};
            menu.forEach((item, idx) => {
                if (item.submenu && item.submenu.some(sub => location.pathname.startsWith(sub.path))) {
                    newActive[idx] = true;
                }
            });
            setActiveSubmenus(newActive);
        }
    }, [location.pathname, user]);

    // Fetch profile image
    useEffect(() => {
        if (user && user.id) {
            setProfileImage(`/profile-image/${user.id}`);
        }
    }, [user]);

    if (!user) return null;

    const role = user.role.toLowerCase().replace(/\s+/g, '');
    const menu = sidebarMenu[role] || [];

    const toggleSubmenu = (index) => {
        setActiveSubmenus(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const handleLinkClick = () => {
        if (isMobile) setIsOpen(false);
    };

    return (
        <>
            {/* Toggle button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
                aria-label="Toggle menu"
            >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Overlay for mobile */}
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

            {/* Sidebar */}
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
                        {menu.map((item, idx) => (
                            <li key={idx}>
                                {item.submenu ? (
                                    <div className="mb-1">
                                        <button
                                            onClick={() => toggleSubmenu(idx)}
                                            className={`w-full flex justify-between items-center px-4 py-3 rounded-lg hover:bg-gray-700 transition-all duration-200 ${activeSubmenus[idx] ? 'bg-gray-700 text-white' : 'text-gray-300'}`}
                                        >
                                            <span className="flex items-center">
                                                {item.icon && <span className="mr-3 text-indigo-400">{item.icon}</span>}
                                                <span className="font-medium">{item.name}</span>
                                            </span>
                                            {activeSubmenus[idx] ? <FiChevronDown className="text-indigo-300" /> : <FiChevronRight className="text-indigo-300" />}
                                        </button>

                                        <AnimatePresence>
                                            {activeSubmenus[idx] && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="pl-4 ml-2 border-l-2 border-gray-700 overflow-hidden"
                                                >
                                                    {item.submenu.map((subItem, subIdx) => (
                                                        <Link
                                                            key={subIdx}
                                                            to={subItem.path}
                                                            onClick={handleLinkClick}
                                                            className={`block px-4 py-2.5 my-1 rounded-lg text-sm hover:bg-gray-700 transition-colors ${location.pathname === subItem.path ? 'bg-indigo-600 text-white font-medium' : 'text-gray-300'}`}
                                                        >
                                                            <span className="flex items-center">
                                                                {subItem.icon && <span className="mr-3 text-indigo-300">{subItem.icon}</span>}
                                                                {subItem.name}
                                                            </span>
                                                        </Link>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
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
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.aside>
        </>
    );
}
