import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCamera,
  FaSave,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaBus,
  FaRoute,
  FaStar,
  FaUsers,
  FaShieldAlt,
  FaFileContract,
  FaCheckCircle,
  FaChartBar,
  FaCog,
  FaUserShield,
  FaClipboardList,
  FaChartLine,
  FaTrash
} from "react-icons/fa";

const API_BASE = "http://localhost:3000/api";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("infos");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Données de la compagnie
  const [company, setCompany] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    logo_url: "",
    conditions_embarquement: "",
    conditions_annulation: "",
    conditions_billet_rate: ""
  });

  // Données du profil complet
  const [profile, setProfile] = useState({
    stats: {
      nombre_bus: 0,
      nombre_trajets: 0,
      types_bus: []
    },
    bus: [],
    horaires: [],
    conditions: {},
    avis: {
      moyenne: null,
      commentaires: []
    }
  });

  // Mot de passe
  const [passwords, setPasswords] = useState({
    actuel: "",
    nouveau: "",
    confirmation: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    actuel: false,
    nouveau: false,
    confirmation: false
  });

  const compagnieId = localStorage.getItem("compagnie_id");
  const token = localStorage.getItem("token_compagnie");

  const axiosAuth = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  // Fonction utilitaire pour formater la note moyenne
  const formatNoteMoyenne = (moyenne) => {
    if (moyenne === null || moyenne === undefined || moyenne === "") {
      return "0.0";
    }
    
    // Convertir en nombre si c'est une chaîne
    const note = typeof moyenne === 'string' ? parseFloat(moyenne) : moyenne;
    
    // Vérifier si c'est un nombre valide
    if (isNaN(note)) {
      return "0.0";
    }
    
    return note.toFixed(1);
  };

  // Charger les données
  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const [companyRes, profileRes] = await Promise.all([
        axiosAuth.get(`/compagnies/${compagnieId}`),
        axiosAuth.get(`/compagnies_profile/${compagnieId}/profile`)
      ]);

      setCompany(companyRes.data);
      setProfile(profileRes.data.profile);
    } catch (error) {
      console.error("Erreur chargement données:", error);
      setMessage("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = (field, value) => {
    setCompany({ ...company, [field]: value });
  };

  const handlePasswordChange = (field, value) => {
    setPasswords({ ...passwords, [field]: value });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const saveCompany = async () => {
    try {
      setSaving(true);
      setMessage("");

      await axiosAuth.put(`/compagnies/${compagnieId}`, company);

      setMessage("✅ Informations mises à jour avec succès");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Erreur mise à jour:", error);
      setMessage("❌ Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (passwords.nouveau !== passwords.confirmation) {
      setMessage("⚠️ Les mots de passe ne correspondent pas");
      return;
    }

    if (passwords.nouveau.length < 6) {
      setMessage("⚠️ Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await axiosAuth.put(`/compagnies/${compagnieId}`, {
        password: passwords.nouveau
      });

      setMessage("✅ Mot de passe changé avec succès");
      setPasswords({ actuel: "", nouveau: "", confirmation: "" });

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Erreur changement mot de passe:", error);
      setMessage("❌ Erreur lors du changement de mot de passe");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation côté frontend
    if (file.size > 5 * 1024 * 1024) {
      setMessage("❌ L'image ne doit pas dépasser 5MB");
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage("❌ Veuillez sélectionner une image valide");
      return;
    }

    try {
      setSaving(true);

      // Prévisualisation immédiate
      const previewUrl = URL.createObjectURL(file);
      setCompany(prev => ({ ...prev, logo_url: previewUrl }));

      // Upload vers le backend
      const formData = new FormData();
      formData.append('logo_url', file);

      // Ajouter les autres champs pour éviter de les écraser
      formData.append('nom', company.nom);
      formData.append('email', company.email);
      formData.append('telephone', company.telephone);
      formData.append('adresse', company.adresse);
      formData.append('conditions_embarquement', company.conditions_embarquement);
      formData.append('conditions_annulation', company.conditions_annulation);
      formData.append('conditions_billet_rate', company.conditions_billet_rate);

      const response = await axiosAuth.put(
        `/compagnies/${compagnieId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setMessage("✅ Logo mis à jour avec succès");

      // Mettre à jour avec l'URL du serveur
      setCompany(prev => ({
        ...prev,
        logo_url: response.data.compagnie.logo_url
      }));

    } catch (error) {
      console.error("Erreur upload logo:", error);
      setMessage("❌ Erreur lors de l'upload du logo");
      // Revenir à l'ancien logo en cas d'erreur
      fetchCompanyData();
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour supprimer le logo
  const removeLogo = async () => {
    try {
      setSaving(true);

      const formData = new FormData();
      formData.append('nom', company.nom);
      formData.append('email', company.email);
      formData.append('telephone', company.telephone);
      formData.append('adresse', company.adresse);
      formData.append('conditions_embarquement', company.conditions_embarquement);
      formData.append('conditions_annulation', company.conditions_annulation);
      formData.append('conditions_billet_rate', company.conditions_billet_rate);
      // Envoyer une chaîne vide pour indiquer la suppression
      formData.append('logo_url', '');

      const response = await axiosAuth.put(`/compagnies/${compagnieId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setCompany(prev => ({ ...prev, logo_url: null }));
      setMessage("✅ Logo supprimé avec succès");

    } catch (error) {
      console.error("Erreur suppression logo:", error);
      setMessage("❌ Erreur lors de la suppression du logo");
    } finally {
      setSaving(false);
    }
  };

  // Statistiques pour les cartes
  const statCards = [
    {
      title: "Total Bus",
      value: profile.stats.nombre_bus,
      icon: <FaBus className="text-2xl" />,
      color: "bg-blue-500",
      subtitle: "Votre flotte"
    },
    {
      title: "Total Trajets",
      value: profile.stats.nombre_trajets,
      icon: <FaRoute className="text-2xl" />,
      color: "bg-green-500",
      subtitle: "Trajets actifs"
    },
    {
      title: "Note Moyenne",
      value: formatNoteMoyenne(profile.avis.moyenne),
      icon: <FaStar className="text-2xl" />,
      color: "bg-yellow-500",
      subtitle: "Satisfaction clients"
    },
    {
      title: "Types de Bus",
      value: profile.stats.types_bus.length,
      icon: <FaUsers className="text-2xl" />,
      color: "bg-purple-500",
      subtitle: "Diversité"
    }
  ];

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <FaCog className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Paramètres de la Compagnie
          </h1>
          <p className="text-gray-600">
            Gérez les informations et préférences de votre compagnie
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              subtitle={stat.subtitle}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <FaCog className="mr-2 text-blue-600" />
                Navigation
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("infos")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center space-x-3 ${
                    activeTab === "infos" 
                      ? "bg-blue-50 text-blue-600 border border-blue-200" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <FaBuilding className="text-lg" />
                  <span className="font-medium">Informations</span>
                </button>

                <button
                  onClick={() => setActiveTab("securite")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center space-x-3 ${
                    activeTab === "securite" 
                      ? "bg-blue-50 text-blue-600 border border-blue-200" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <FaUserShield className="text-lg" />
                  <span className="font-medium">Sécurité</span>
                </button>

                <button
                  onClick={() => setActiveTab("conditions")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center space-x-3 ${
                    activeTab === "conditions" 
                      ? "bg-blue-50 text-blue-600 border border-blue-200" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <FaClipboardList className="text-lg" />
                  <span className="font-medium">Conditions</span>
                </button>

                <button
                  onClick={() => setActiveTab("statistiques")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center space-x-3 ${
                    activeTab === "statistiques" 
                      ? "bg-blue-50 text-blue-600 border border-blue-200" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <FaChartLine className="text-lg" />
                  <span className="font-medium">Statistiques</span>
                </button>
              </div>

              {/* Stats Rapides */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3">Aperçu Rapide</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-sm">Bus actifs</span>
                    <span className="font-semibold text-blue-600">{profile.stats.nombre_bus}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-sm">Trajets programmés</span>
                    <span className="font-semibold text-green-600">{profile.stats.nombre_trajets}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-sm">Satisfaction</span>
                    <span className="font-semibold text-yellow-600">
                      {formatNoteMoyenne(profile.avis.moyenne)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Message de statut */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl text-center font-semibold ${
                message.includes("✅") || message.includes("succès")
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : message.includes("⚠️")
                  ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}>
                {message}
              </div>
            )}

            {/* Tab Content */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Informations de base */}
              {activeTab === "infos" && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                      <FaBuilding className="mr-3 text-blue-600" />
                      Informations de la Compagnie
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Logo */}
                    <div className="lg:col-span-2">
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Logo de la compagnie
                        </label>
                        <div className="flex items-center space-x-6">
                          <div className="w-32 h-32 bg-white rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shadow-lg">
                            {company.logo_url ? (
                              <img 
                                src={company.logo_url} 
                                alt="Logo" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FaCamera className="text-gray-400 text-3xl" />
                            )}
                          </div>
                          <div className="flex flex-col space-y-3">
                            <div className="flex space-x-3">
                              <input 
                                type="file" 
                                onChange={handleLogoUpload}
                                accept="image/*"
                                className="hidden" 
                                id="logo-upload"
                                disabled={saving}
                              />
                              <label 
                                htmlFor="logo-upload"
                                className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer inline-flex items-center space-x-2 font-medium ${
                                  saving ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {saving ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <FaCamera />
                                )}
                                <span>{saving ? 'Upload...' : 'Changer le logo'}</span>
                              </label>
                              
                              {company.logo_url && (
                                <button
                                  onClick={removeLogo}
                                  disabled={saving}
                                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2 font-medium disabled:opacity-50"
                                >
                                  <FaTrash />
                                  <span>Supprimer</span>
                                </button>
                              )}
                            </div>
                            <p className="text-gray-500 text-sm">
                              PNG, JPG, JPEG (max. 5MB)
                            </p>
                            {saving && (
                              <p className="text-blue-600 text-sm font-medium">
                                ⏳ Upload en cours...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Champs d'information */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom de la compagnie *
                        </label>
                        <input
                          type="text"
                          value={company.nom}
                          onChange={(e) => handleCompanyChange("nom", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="Entrez le nom de votre compagnie"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            value={company.email}
                            onChange={(e) => handleCompanyChange("email", e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="contact@compagnie.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Téléphone *
                        </label>
                        <div className="relative">
                          <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={company.telephone}
                            onChange={(e) => handleCompanyChange("telephone", e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="+223 70 00 00 00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Adresse *
                        </label>
                        <div className="relative">
                          <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={company.adresse}
                            onChange={(e) => handleCompanyChange("adresse", e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="Adresse complète"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={saveCompany}
                      disabled={saving}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Sauvegarde...</span>
                        </>
                      ) : (
                        <>
                          <FaSave />
                          <span>Sauvegarder les modifications</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Sécurité */}
              {activeTab === "securite" && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <FaUserShield className="mr-3 text-green-600" />
                    Sécurité et Mot de Passe
                  </h2>

                  <div className="max-w-2xl space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type={showPasswords.actuel ? "text" : "password"}
                          value={passwords.actuel}
                          onChange={(e) => handlePasswordChange("actuel", e.target.value)}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="Entrez votre mot de passe actuel"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("actuel")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.actuel ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type={showPasswords.nouveau ? "text" : "password"}
                          value={passwords.nouveau}
                          onChange={(e) => handlePasswordChange("nouveau", e.target.value)}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="Entrez le nouveau mot de passe"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("nouveau")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.nouveau ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type={showPasswords.confirmation ? "text" : "password"}
                          value={passwords.confirmation}
                          onChange={(e) => handlePasswordChange("confirmation", e.target.value)}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="Confirmez le nouveau mot de passe"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("confirmation")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirmation ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <FaShieldAlt className="mr-2" />
                        Conseils de sécurité
                      </h4>
                      <ul className="text-blue-700 text-sm space-y-1">
                        <li>• Utilisez au moins 6 caractères</li>
                        <li>• Combinez lettres, chiffres et symboles</li>
                        <li>• Évitez les mots de passe courants</li>
                      </ul>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={savePassword}
                        disabled={saving}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center space-x-2 disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Mise à jour...</span>
                          </>
                        ) : (
                          <>
                            <FaCheckCircle />
                            <span>Mettre à jour le mot de passe</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditions */}
              {activeTab === "conditions" && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <FaClipboardList className="mr-3 text-purple-600" />
                    Conditions Générales
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conditions d'embarquement
                      </label>
                      <textarea
                        value={company.conditions_embarquement}
                        onChange={(e) => handleCompanyChange("conditions_embarquement", e.target.value)}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                        placeholder="Décrivez les conditions d'embarquement..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conditions d'annulation
                      </label>
                      <textarea
                        value={company.conditions_annulation}
                        onChange={(e) => handleCompanyChange("conditions_annulation", e.target.value)}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                        placeholder="Décrivez les conditions d'annulation..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conditions pour billets ratés
                      </label>
                      <textarea
                        value={company.conditions_billet_rate}
                        onChange={(e) => handleCompanyChange("conditions_billet_rate", e.target.value)}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                        placeholder="Décrivez les conditions pour les billets ratés..."
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={saveCompany}
                        disabled={saving}
                        className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition flex items-center space-x-2 disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Sauvegarde...</span>
                          </>
                        ) : (
                          <>
                            <FaSave />
                            <span>Sauvegarder les conditions</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Statistiques */}
              {activeTab === "statistiques" && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <FaChartLine className="mr-3 text-orange-600" />
                    Statistiques et Performance
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100">Total Bus</p>
                          <p className="text-3xl font-bold">{profile.stats.nombre_bus}</p>
                        </div>
                        <FaBus className="text-3xl opacity-80" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100">Total Trajets</p>
                          <p className="text-3xl font-bold">{profile.stats.nombre_trajets}</p>
                        </div>
                        <FaRoute className="text-3xl opacity-80" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-100">Note Moyenne</p>
                          <p className="text-3xl font-bold">{formatNoteMoyenne(profile.avis.moyenne)}</p>
                        </div>
                        <FaStar className="text-3xl opacity-80" />
                      </div>
                    </div>
                  </div>

                  {/* Types de bus */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <FaBus className="mr-2 text-blue-600" />
                      Types de Bus dans votre flotte
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.stats.types_bus.map((type, index) => (
                        <span 
                          key={index}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 font-medium shadow-sm"
                        >
                          {type}
                        </span>
                      ))}
                      {profile.stats.types_bus.length === 0 && (
                        <p className="text-gray-500">Aucun type de bus défini</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;