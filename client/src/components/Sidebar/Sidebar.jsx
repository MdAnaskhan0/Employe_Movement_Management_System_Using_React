import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { sidebarMenu } from '../../config/SidebarMenuConfig';
import { FiMenu, FiX, FiChevronDown, FiChevronRight } from 'react-icons/fi';

export default function Sidebar() {
    const { user } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [activeSubmenus, setActiveSubmenus] = useState({});
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const sidebarRef = useRef(null);

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
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) setIsOpen(true);
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
            {isOpen && isMobile && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-70 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                className={`fixed md:relative inset-y-0 left-0 z-50 w-64 bg-gray-900 text-gray-200 p-4 shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Profile */}
                    <div className="px-3 py-4 mb-4 border-b border-gray-700 flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="font-semibold text-white truncate">{user.name}</h1>
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
                                            className={`w-full flex justify-between items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-all ${activeSubmenus[idx] ? 'bg-gray-800 text-white' : 'text-gray-300'}`}
                                        >
                                            <span className="flex items-center">
                                                {item.icon && <span className="mr-3 text-indigo-400">{item.icon}</span>}
                                                <span className="font-medium">{item.name}</span>
                                            </span>
                                            {activeSubmenus[idx] ? <FiChevronDown className="text-indigo-400" /> : <FiChevronRight className="text-indigo-400" />}
                                        </button>

                                        {activeSubmenus[idx] && (
                                            <div className="pl-4 ml-2 border-l-2 border-gray-700">
                                                {item.submenu.map((subItem, subIdx) => (
                                                    <Link
                                                        key={subIdx}
                                                        to={subItem.path}
                                                        onClick={handleLinkClick}
                                                        className={`block px-4 py-2.5 my-1 rounded-lg text-sm hover:bg-gray-800 ${location.pathname === subItem.path ? 'bg-indigo-900 text-white font-medium' : 'text-gray-400'}`}
                                                    >
                                                        <span className="flex items-center">
                                                            {subItem.icon && <span className="mr-3 text-indigo-400">{subItem.icon}</span>}
                                                            {subItem.name}
                                                        </span>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        to={item.path}
                                        onClick={handleLinkClick}
                                        className={`block px-4 py-3 rounded-lg hover:bg-gray-800 ${location.pathname === item.path ? 'bg-indigo-900 text-white font-medium' : 'text-gray-300'}`}
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
            </aside>
        </>
    );
}