import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            setIsOpen(window.innerWidth >= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            {/* Mobile toggle button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-200 text-gray-800 shadow-lg"
            >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed md:relative inset-y-0 left-0 z-40 w-64 bg-gray-800 text-gray-100 p-4 border-r border-gray-700 shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
            >
                <div className="flex flex-col h-full">
                    <div className="px-3 py-2 text-sm border-b border-gray-600 mb-2">
                        <h1 className="font-bold text-gray-100">{user.name}</h1>
                        <p className="text-gray-400 capitalize">{user.role}</p>
                    </div>

                    <ul className="flex-1 space-y-1 overflow-y-auto">
                        {menu.map((item, idx) => (
                            <li key={idx}>
                                {item.submenu ? (
                                    <div className="mb-1">
                                        <button
                                            onClick={() => toggleSubmenu(idx)}
                                            className={`w-full flex justify-between items-center px-3 py-3 rounded-lg hover:bg-gray-700 transition-colors ${activeSubmenus[idx] ? 'bg-gray-700' : ''}`}
                                        >
                                            <span className="flex items-center">
                                                {item.icon && <span className="mr-3">{item.icon}</span>}
                                                {item.name}
                                            </span>
                                            {activeSubmenus[idx] ? <FiChevronDown /> : <FiChevronRight />}
                                        </button>

                                        <div className={`transition-all pl-4 border-l border-gray-700 ${activeSubmenus[idx] ? 'max-h-96 py-2' : 'max-h-0 overflow-hidden'}`}>
                                            {item.submenu.map((subItem, subIdx) => (
                                                <Link
                                                    key={subIdx}
                                                    to={subItem.path}
                                                    onClick={handleLinkClick}
                                                    className={`block px-3 py-2 rounded-lg text-sm hover:bg-gray-600 ${location.pathname === subItem.path ? 'bg-gray-700 text-white font-medium' : 'text-gray-300'}`}
                                                >
                                                    {subItem.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        to={item.path}
                                        onClick={handleLinkClick}
                                        className={`block px-3 py-3 rounded-lg hover:bg-gray-600 transition-colors ${location.pathname === item.path ? 'bg-gray-600 text-white font-medium' : 'text-gray-300'}`}
                                    >
                                        <span className="flex items-center">
                                            {item.icon && <span className="mr-3">{item.icon}</span>}
                                            {item.name}
                                        </span>
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
