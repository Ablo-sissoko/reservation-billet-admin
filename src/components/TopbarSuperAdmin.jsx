import React from "react";

export default function TopbarSuperAdmin() {
  const user = JSON.parse(localStorage.getItem("user")) || { nom: "Super", prenom: "Admin" };

  return (
    <header className="bg-white shadow flex justify-between items-center p-4">
      <h1 className="text-xl font-semibold text-gray-700">Espace Super Admin</h1>

      <div className="flex items-center gap-3">
        <img
          src={`https://ui-avatars.com/api/?name=${user.prenom}+${user.nom}&background=0D8ABC&color=fff`}
          alt="Profile"
          className="w-10 h-10 rounded-full border"
        />
        <span className="text-gray-700 font-medium">{user.prenom} {user.nom}</span>
      </div>
    </header>
  );
}
