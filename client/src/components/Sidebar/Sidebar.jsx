// src/components/Sidebar/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { sidebarMenu } from '../../config/SidebarMenuConfig';

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role.toLowerCase().replace(/\s+/g, '');
  const menu = sidebarMenu[role] || [];

  return (
    <aside className="w-64 bg-gray-200 text-gray-800 h-full p-4 border-r border-gray-300">
      <h2 className="text-lg font-bold mb-4">Menu</h2>
      <ul className="space-y-2">
        {menu.map((item, idx) => (
          <li key={idx}>
            <Link to={item.path} className="block px-3 py-2 rounded hover:bg-gray-300">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
