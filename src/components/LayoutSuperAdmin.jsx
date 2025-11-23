// components/LayoutSuperAdmin.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import SidebarSuperAdmin from "./SidebarSuperAdmin";
import TopbarSuperAdmin from "./TopbarSuperAdmin";

export default function LayoutSuperAdmin() {
  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarSuperAdmin />
      <div className="flex flex-col flex-1">
        <TopbarSuperAdmin />
        <main className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>

  );
}
