import { Link } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaChartBar, 
  FaUserCircle,
  FaSignOutAlt 
} from 'react-icons/fa';

const Sidebar = ({ sidebarOpen, handleLogout }) => {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex-shrink-0 transition-transform duration-300 ease-in-out
      `}
      aria-label="Sidebar"
    >
      <div className="flex items-center justify-center h-16 border-b border-gray-700 font-bold text-2xl bg-gray-900 transition">
        Admin Panel
      </div>
      <nav className="mt-4 flex flex-col space-y-1 px-2">
        <Link
          to="/dashboard"
          className="flex items-center py-3 px-4 rounded hover:bg-gray-700 transition text-gray-300 hover:text-white"
        >
          <FaHome className="w-5 h-5 mr-3" />
          Dashboard
        </Link>
        <Link
          to="/dashboard/createuser"
          className="flex items-center py-3 px-4 rounded hover:bg-gray-700 transition text-gray-300 hover:text-white"
        >
          <FaUsers className="w-5 h-5 mr-3" />
          Create User
        </Link>
        <Link
          to="/dashboard/users"
          className="flex items-center py-3 px-4 rounded hover:bg-gray-700 transition text-gray-300 hover:text-white"
        >
          <FaChartBar className="w-5 h-5 mr-3" />
          All Users
        </Link>
        <Link
          to="/dashboard/movemntreports"
          className="flex items-center py-3 px-4 rounded hover:bg-gray-700 transition text-gray-300 hover:text-white"
        >
          <FaUserCircle className="w-5 h-5 mr-3" />
          Movement Reports
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center w-full py-3 px-4 rounded hover:bg-gray-700 transition text-gray-300 hover:text-white text-left"
        >
          <FaSignOutAlt className="w-5 h-5 mr-3" />
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;