import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoMdAddCircleOutline } from "react-icons/io";
import {
  FaHome,
  FaUsers,
  FaChartBar,
  FaUserCircle,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaRegBuilding
} from 'react-icons/fa';
import { HiUserAdd } from "react-icons/hi";
import { TbGitBranch } from "react-icons/tb"; //bracnch
import { CgIfDesign } from "react-icons/cg"; //Designation
import { FaTransgender } from "react-icons/fa6"; //department
import { LiaUserFriendsSolid } from "react-icons/lia"; //party
import { MdPeopleAlt } from "react-icons/md"; //visiting status 
import { MdTaskAlt } from "react-icons/md";


const Sidebar = ({ sidebarOpen, handleLogout }) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);

  const toggleSubmenu = () => {
    setIsSubmenuOpen(!isSubmenuOpen);
  };


  const toggleUsers = () => {
    setIsUsersOpen(!isUsersOpen);
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex-shrink-0 transition-transform duration-300 ease-in-out
      `}
      aria-label="Sidebar"
    >
      <div className="flex items-center justify-center h-16 border-b border-gray-700 font-bold text-2xl bg-gray-900">
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
        {/* Users Submenu Button */}
        <button
          onClick={toggleUsers}
          className="flex items-center justify-between w-full py-3 px-4 rounded hover:bg-gray-700 transition text-gray-300 hover:text-white"
        >
          <div className="flex items-center">
            <FaUsers className="w-5 h-5 mr-3" />
            Users
          </div>
          {isUsersOpen ? (
            <FaChevronDown className="w-4 h-4" />
          ) : (
            <FaChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Users Submenu */}
        {isUsersOpen && (
          <div className="flex flex-col space-y-1 pl-12">
            <Link
              to="/dashboard/createuser"
              className="flex items-center py-2 px-4 rounded hover:bg-gray-700 transition text-gray-300 hover:text-white text-sm"
            >
              <HiUserAdd className='mr-2' /> Create User
            </Link>
            <Link
              to="/dashboard/alluser"
              className="flex items-center py-2 px-4 rounded hover:bg-gray-700 transition text-gray-300 hover:text-white text-sm"
            >
              <FaUsers className='mr-2' /> All Users
            </Link>
          </div>
        )}
        <Link
          to="/dashboard/movementreports"
          className="flex items-center py-3 px-4 rounded hover:bg-gray-700 transition text-gray-300 hover:text-white"
        >
          <FaUserCircle className="w-5 h-5 mr-3" />
          Movement Reports
        </Link>

        {/* Toggle Submenu Button */}
        <button
          onClick={toggleSubmenu}
          className="flex items-center justify-between w-full py-3 px-4 rounded hover:bg-gray-700 transition text-gray-300 hover:text-white"
        >
          <div className="flex items-center">
            <IoMdAddCircleOutline className="w-5 h-5 mr-3" />
            Settings
          </div>
          {isSubmenuOpen ? (
            <FaChevronDown className="w-4 h-4" />
          ) : (
            <FaChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Submenu */}
        {isSubmenuOpen && (
          <div className="flex flex-col space-y-1 pl-12">
            <Link
              to="/dashboard/companynames"
              className="flex items-center py-2 px-4 rounded hover:bg-gray-700 transition text-gray-300 hover:text-white text-sm"
            >
              <FaRegBuilding className='mr-2' /> Company Name
            </Link>

            <Link to="/dashboard/branchnames" className="flex items-center py-2 px-4 rounded hover:bg-gray-700 transition text-gray-300 hover:text-white text-sm">
              <TbGitBranch className='mr-2' /> Branch Name
            </Link>

            <Link
              to="/dashboard/designations"
              className="flex items-center py-2 px-4 rounded hover:bg-gray-700 transition text-gray-300 hover:text-white text-sm"
            >
             <CgIfDesign className='mr-2' /> Designation
            </Link>

            <Link
              to="/dashboard/departments"
              className="flex items-center py-2 px-4 rounded hover:bg-gray-700 transition text-gray-300 hover:text-white text-sm"
            >
              <FaTransgender className='mr-2' /> Department
            </Link>

            <Link
              to="/dashboard/partynames"
              className="flex items-center py-2 px-4 rounded hover:bg-gray-700 transition text-gray-300 hover:text-white text-sm"
            >
              <LiaUserFriendsSolid className='mr-2' /> Party Name
            </Link>

            {/* <Link
              to="/dashboard/placenames"
              className="flex items-center py-2 px-4 rounded hover:bg-gray-700 transition text-gray-300 hover:text-white text-sm"
            >
              <MdLocationOn className='mr-2' /> Place Name
            </Link> */}

            <Link to="/dashboard/visitingstatus" className="flex items-center py-2 px-4 rounded hover:bg-gray-700 transition text-gray-300 hover:text-white text-sm">
              <MdPeopleAlt className='mr-2' /> Visiting Status
            </Link>

            <Link to="/dashboard/role" className="flex items-center py-2 px-4 rounded hover:bg-gray-700 transition text-gray-300 hover:text-white text-sm">
              <MdTaskAlt className='mr-2' /> Role Details
            </Link>
          </div>
        )}

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