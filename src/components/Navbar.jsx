// components/Navbar.jsx
import React from "react";
import { FaBars, FaBell } from "react-icons/fa";
import { MdArrowDropDown } from "react-icons/md";

const Navbar = () => {
  return (
    <div className="flex items-center justify-between bg-white shadow px-4 py-2">
      {/* Left: Search */}
      <div className="flex items-center">
        <FaBars className="text-gray-600 mr-4 cursor-pointer" />
        <input
          type="text"
          placeholder="Search"
          className="bg-gray-100 px-4 py-2 rounded-lg outline-none"
        />
      </div>

      {/* Right: Icons + Profile */}
      <div className="flex items-center space-x-6">
        {/* Notifications */}
        <div className="relative cursor-pointer">
          <FaBell className="text-gray-600 text-lg" />
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
            9
          </span>
        </div>

        {/* Language */}
        <div className="flex items-center cursor-pointer space-x-1">
          <img
            src="https://flagcdn.com/16x12/gb.png"
            alt="flag"
            className="w-5 h-4"
          />
          <span className="text-sm text-gray-600">English</span>
          <MdArrowDropDown />
        </div>

        {/* Profile */}
        <div className="flex items-center space-x-2 cursor-pointer">
          <img
            src="https://i.pravatar.cc/40"
            alt="profile"
            className="w-8 h-8 rounded-full"
          />
          <div className="text-sm">
            <p className="font-semibold">Moni Roy</p>
            <p className="text-gray-500 text-xs">Admin</p>
          </div>
          <MdArrowDropDown />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
