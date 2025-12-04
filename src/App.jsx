import React from "react";
import { Routes, Route } from "react-router-dom";

// 🏢 Layout Compagnie
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Trajets from "./pages/Trajets";
import Reservations from "./pages/Reservations";
import Billets from "./pages/Billets";
import Posts from "./pages/Posts";
import Settings from "./pages/Settings";
import Bus from "./pages/Bus";

// 🔐 Authentification Admin Compagnie
import LoginAdmin from "./components/LoginAdmin";
import RegisterAdmin from "./components/RegisterAdmin";

// 🧭 Layout Super Admin
import LayoutSuperAdmin from "./components/LayoutSuperAdmin";
import DashboardSuperAdmin from "./superadmin/DashboardSuperAdmin";
import CompagniesList from "./superadmin/CompagniesList";
import UsersList from "./superadmin/UsersList";
import PaiementsGlobal from "./superadmin/PaiementsGlobal";
import TrajetsListes from "./superadmin/TrajetsListes";
import EbilletListes from "./superadmin/EbilletListes";
import PostesListes from "./superadmin/PostesListes";
import Interactions from "./superadmin/Interactions";
import RechercheTrajets from "./superadmin/RechercheTrajets";
import BusesListes from "./superadmin/BusesListes";
import AvisSuperAdmin from "./superadmin/AvisSuperAdmin";
import LoginSuperAdmin from "./superadmin/LoginSuperAdmin";
import RegisterSuperAdmin from "./superadmin/RegisterSuperAdmin";



function App() {
  return (
    <Routes>
      {/* 🔐 Authentification */}
      <Route path="/login" element={<LoginAdmin />} />
      <Route path="/register" element={<RegisterAdmin />} />

      
      {/* 🔐 Auth Super Admin */}
      <Route path="/super-admin/login" element={<LoginSuperAdmin />} />
      <Route path="/super-admin/register" element={<RegisterSuperAdmin />} />


      {/* 🧭 Espace Compagnie Admin */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="bus" element={<Bus />} />
        <Route path="trajets" element={<Trajets />} />
        <Route path="sales" element={<Sales />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="billets" element={<Billets />} />
        <Route path="posts" element={<Posts />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      

      {/* 🧭 Espace Super Admin */}
      <Route path="/super-admin" element={<LayoutSuperAdmin />}>
        <Route index element={<DashboardSuperAdmin />} />
        <Route path="dashboard" element={<DashboardSuperAdmin />} />
        <Route path="compagnies" element={<CompagniesList />} />
        <Route path="users" element={<UsersList />} /> 
        <Route path="paiements" element={<PaiementsGlobal />} />
        <Route path="trajets" element={<TrajetsListes />} />
        <Route path="billets" element={<EbilletListes />} />
        <Route path="posts" element={<PostesListes />} />
        <Route path="interactions" element={<Interactions />} />
        <Route path="recherche-trajets" element={<RechercheTrajets />} />
        <Route path="buses" element={<BusesListes />} />
        <Route path="AvisAdmin" element={< AvisSuperAdmin />} />
      </Route>
    </Routes>
  );
}

export default App;
