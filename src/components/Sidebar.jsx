// components/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  FaHome, 
  FaChartLine, 
  FaCog, 
  FaBus, 
  FaTicketAlt, 
  FaClipboardList, 
  FaBullhorn,
  FaSignOutAlt
} from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 p-3 rounded-lg transition-colors ${
      isActive ? "bg-blue-700 text-white" : "text-gray-200 hover:bg-blue-700 hover:text-white"
    }`;

  return (
    <aside className="w-64 bg-blue-800 text-white flex flex-col">
      <div className="p-5 text-center font-bold text-2xl border-b border-blue-700">
        MyApp
      </div>

      <nav className="flex-1 p-4 space-y-2 text-sm overflow-y-auto">
        <NavLink to="/dashboard" end className={linkClasses}>
          <FaHome /> Dashboard
        </NavLink>

        <NavLink to="/bus" className={linkClasses}>
          <FaBus /> Bus
        </NavLink>

        <NavLink to="/trajets" className={linkClasses}>
          <FaBus /> Trajets
        </NavLink>

        <NavLink to="/sales" className={linkClasses}>
          <FaChartLine /> Billets
        </NavLink>

        <NavLink to="/posts" className={linkClasses}>
          <FaBullhorn /> Posts
        </NavLink>
        
        <NavLink to="/reservations" className={linkClasses}>
          <FaClipboardList /> Avis
        </NavLink>

        <NavLink to="/settings" className={linkClasses}>
          <FaCog /> Paramètres
        </NavLink>
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 p-3 m-4 bg-red-600 rounded-lg hover:bg-red-700 font-semibold transition-colors"
      >
        <FaSignOutAlt /> Déconnexion
      </button>
    </aside>
  );
};

export default Sidebar;