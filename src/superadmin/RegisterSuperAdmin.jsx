import React, { useState } from "react";
import axios from "axios";
import { FaEnvelope, FaLock, FaPhone, FaUser, FaUserShield, FaMapMarkerAlt, FaBriefcase } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";



export default function RegisterSuperAdmin() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    adresse: "",
    profession: "",
    mot_de_passe: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post(`/superadmin/auth/register`, form);
      setMessage("Compte Super Admin créé avec succès ✅");
      
      setTimeout(() => {
        navigate("/super-admin/login");
      }, 1000);

    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur lors de l'inscription ❌");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "nom", placeholder: "Nom", icon: <FaUser /> },
    { name: "prenom", placeholder: "Prénom", icon: <FaUser /> },
    { name: "telephone", placeholder: "Téléphone", icon: <FaPhone /> },
    { name: "email", placeholder: "Email", icon: <FaEnvelope />, type: "email" },
    { name: "adresse", placeholder: "Adresse", icon: <FaMapMarkerAlt /> },
    { name: "profession", placeholder: "Profession", icon: <FaBriefcase /> },
    { name: "mot_de_passe", placeholder: "Mot de passe", icon: <FaLock />, type: "password" },
  ];

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-600 to-blue-500 p-5">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-white/20">
        
        <div className="text-center mb-8">
          <FaUserShield className="text-5xl text-purple-600 mx-auto mb-3" />
          <h2 className="text-3xl font-bold text-gray-800">Créer un Super Admin</h2>
          <p className="text-gray-600 text-sm">Remplissez les informations pour créer l’administrateur principal.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map(({ name, placeholder, icon, type = "text" }) => (
            <div key={name} className="flex gap-3 items-center bg-gray-50 border border-gray-300 rounded-xl p-4 transition focus-within:border-purple-500 focus-within:bg-white focus-within:shadow-lg">
              <span className="text-purple-600 text-lg">{icon}</span>
              <input
                className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500"
                name={name}
                type={type}
                placeholder={placeholder}
                value={form[name]}
                required
                onChange={handleChange}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-blue-500 transition-all ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:from-purple-700 hover:to-blue-600 hover:shadow-xl"
            }`}
          >
            {loading ? "Création en cours..." : "Créer le compte"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 text-sm">
          Vous avez déjà un compte ?{" "}
          <Link to="/super-admin/login" className="text-purple-600 font-medium hover:text-purple-700">
            Se connecter
          </Link>
        </p>

        {message && (
          <div className={`mt-5 p-3 rounded-lg text-sm text-center font-medium ${
            message.includes("✅") ? "bg-green-50 text-green-700 border border-green-200" :
            "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message}
          </div>
        )}

      </div>
    </div>
  );
}
