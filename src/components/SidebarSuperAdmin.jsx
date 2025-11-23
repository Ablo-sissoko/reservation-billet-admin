import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBuilding,
  FaUsers,
  FaMoneyBillWave,
  FaCog,
  FaSignOutAlt,
  FaBusAlt,
  FaTicketAlt,
  FaNewspaper,
  FaExchangeAlt,
  FaSearch
} from "react-icons/fa";

export default function SidebarSuperAdmin() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/super-admin/login");
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 p-3 rounded-lg transition-colors ${
      isActive ? "bg-blue-700 text-white" : "text-gray-200 hover:bg-blue-700 hover:text-white"
    }`;

  return (
    <aside className="w-64 bg-blue-800 text-white flex flex-col">
      <div className="p-5 text-center font-bold text-2xl border-b border-blue-700">
        Super Admin
      </div>

      <nav className="flex-1 p-4 space-y-2 text-sm overflow-y-auto">
        <NavLink to="/super-admin/dashboard" className={linkClasses}>
          <FaTachometerAlt /> Dashboard
        </NavLink>

        <NavLink to="/super-admin/compagnies" className={linkClasses}>
          <FaBuilding /> Compagnies
        </NavLink>

        <NavLink to="/super-admin/users" className={linkClasses}>
          <FaUsers /> Utilisateurs
        </NavLink>

        <NavLink to="/super-admin/buses" className={linkClasses}>
          <FaBusAlt /> Buses
        </NavLink>

        <NavLink to="/super-admin/trajets" className={linkClasses}>
          <FaExchangeAlt /> Trajets
        </NavLink>

        <NavLink to="/super-admin/billets" className={linkClasses}>
          <FaTicketAlt /> E-Billets
        </NavLink>
       


        <NavLink to="/super-admin/posts" className={linkClasses}>
          <FaNewspaper /> Publications
        </NavLink>

        

        <NavLink to="/super-admin/paiements" className={linkClasses}>
          <FaMoneyBillWave /> Paiements
        </NavLink>

         <NavLink to="/super-admin/AvisAdmin" className={linkClasses}>
          <FaTicketAlt /> Avis
        </NavLink>

        
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 p-3 m-4 bg-red-600 rounded-lg hover:bg-red-700 font-semibold"
      >
        <FaSignOutAlt /> Déconnexion
      </button>
    </aside>
  );
}
