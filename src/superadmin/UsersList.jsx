import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUsers,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBriefcase,
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaSearch,
  FaCalendarAlt,
  FaIdCard,
  FaChartBar,
  FaUserCheck,
  FaUserClock
} from "react-icons/fa";
import api from "../services/api";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    profession: "",
    statut: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    adresse: "",
    profession: "",
    mot_de_passe: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
     
      
      // Utilisation du vrai endpoint backend
      const response = await api.get("/users");
      
      // Vérification de la structure de la réponse
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (response.data.users && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      } else {
        console.warn("Structure de réponse inattendue:", response.data);
        setUsers([]);
      }
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
      setError("Erreur lors du chargement des utilisateurs");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Utilisation des vraies données du backend
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      `${user.prenom || ''} ${user.nom || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.telephone && user.telephone.includes(searchTerm)) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.profession && user.profession.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesProfession = !filters.profession || user.profession === filters.profession;
    const matchesStatut = !filters.statut; // Ajouter une logique de statut si nécessaire

    return matchesSearch && matchesProfession && matchesStatut;
  });

  const professions = [...new Set(users.map(user => user.profession).filter(Boolean))];

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, form);
      } else {
        await api.post("/users/register", form);
      }
      
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Erreur création/mise à jour:", error);
      alert(error.response?.data?.message || "Erreur lors de l'opération");
    }
  };

  const handleDelete = async () => {
    try {
     
      await api.delete(`/users/${userToDelete.id}`);
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setForm({
      nom: "",
      prenom: "",
      telephone: "",
      email: "",
      adresse: "",
      profession: "",
      mot_de_passe: ""
    });
    setEditingUser(null);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      nom: user.nom || "",
      prenom: user.prenom || "",
      telephone: user.telephone || "",
      email: user.email || "",
      adresse: user.adresse || "",
      profession: user.profession || "",
      mot_de_passe: "" // Ne pas pré-remplir le mot de passe pour des raisons de sécurité
    });
    setShowModal(true);
  };

  const openDetailModal = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getInitials = (prenom, nom) => {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
  };

  // Calcul des statistiques avec les vraies données
  const stats = {
    total: users.length,
    avecEmail: users.filter(u => u.email).length,
    avecAdresse: users.filter(u => u.adresse).length,
    professionsUniques: professions.length,
    nouveauxCeMois: users.filter(u => {
      if (!u.createdAt) return false;
      const created = new Date(u.createdAt);
      const now = new Date();
      return (now - created) < 30 * 24 * 60 * 60 * 1000; // 30 jours
    }).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md">
            <h3 className="font-bold text-lg mb-2">Erreur</h3>
            <p>{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <FaUsers className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-600">
            Supervisez et gérez tous les utilisateurs de la plateforme
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Utilisateurs"
            value={stats.total}
            icon={<FaUsers className="text-2xl" />}
            color="bg-purple-500"
            subtitle={`${stats.nouveauxCeMois} nouveaux ce mois`}
          />
          <StatCard
            title="Avec Email"
            value={stats.avecEmail}
            icon={<FaEnvelope className="text-2xl" />}
            color="bg-blue-500"
            subtitle={`${stats.total > 0 ? ((stats.avecEmail / stats.total) * 100).toFixed(1) : 0}% des utilisateurs`}
          />
          <StatCard
            title="Avec Adresse"
            value={stats.avecAdresse}
            icon={<FaMapMarkerAlt className="text-2xl" />}
            color="bg-green-500"
            subtitle="Adresse complète renseignée"
          />
          <StatCard
            title="Professions"
            value={stats.professionsUniques}
            icon={<FaBriefcase className="text-2xl" />}
            color="bg-orange-500"
            subtitle="Catégories différentes"
          />
        </div>

        {/* Barre d'actions et filtres */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              />
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition flex items-center space-x-2 font-semibold"
            >
              <FaPlus />
              <span>Nouvel Utilisateur</span>
            </button>
          </div>

          {/* Filtres avancés */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
              <select
                value={filters.profession}
                onChange={(e) => setFilters({ ...filters, profession: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              >
                <option value="">Toutes les professions</option>
                {professions.map(profession => (
                  <option key={profession} value={profession}>
                    {profession}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              >
                <option value="">Tous les statuts</option>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ profession: "", statut: "" })}
                className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Header avec avatar */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <div className="flex items-center space-x-4">
                  {user.image_profile ? (
                    <img
                      src={user.image_profile}
                      alt={`${user.prenom} ${user.nom}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-white font-bold text-lg">
                        {getInitials(user.prenom, user.nom)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">
                      {user.prenom} {user.nom}
                    </h3>
                    <p className="text-white/80 text-sm">ID: {user.id}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Informations de contact */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-3 text-sm">
                    <FaPhone className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700">{user.telephone || "Non renseigné"}</span>
                  </div>
                  {user.email && (
                    <div className="flex items-center space-x-3 text-sm">
                      <FaEnvelope className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 truncate">{user.email}</span>
                    </div>
                  )}
                  {user.adresse && (
                    <div className="flex items-center space-x-3 text-sm">
                      <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700">{user.adresse}</span>
                    </div>
                  )}
                  {user.profession && (
                    <div className="flex items-center space-x-3 text-sm">
                      <FaBriefcase className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700">{user.profession}</span>
                    </div>
                  )}
                </div>

                {/* Date d'inscription */}
                <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
                  <FaCalendarAlt />
                  <span>Inscrit le {formatDate(user.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => openDetailModal(user)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition"
                  >
                    <FaEye />
                    <span className="text-sm">Détails</span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => {
                        setUserToDelete(user);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <FaUsers className="text-gray-400 text-4xl mx-auto mb-4" />
            <h3 className="text-gray-600 text-lg font-medium">Aucun utilisateur trouvé</h3>
            <p className="text-gray-500">
              {searchTerm || Object.values(filters).some(f => f) 
                ? "Essayez de modifier vos critères de recherche" 
                : "Aucun utilisateur dans la base de données"
              }
            </p>
          </div>
        )}
      </div>

      {/* Les modaux restent identiques */}
      {/* Modal Création/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingUser ? "Modifier l'Utilisateur" : "Nouvel Utilisateur"}
              </h2>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={form.prenom}
                      onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={form.telephone}
                      onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={form.adresse}
                    onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profession
                  </label>
                  <input
                    type="text"
                    value={form.profession}
                    onChange={(e) => setForm({ ...form, profession: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  />
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe *
                    </label>
                    <input
                      type="password"
                      value={form.mot_de_passe}
                      onChange={(e) => setForm({ ...form, mot_de_passe: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      required={!editingUser}
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                  >
                    {editingUser ? "Modifier" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Détails de l'Utilisateur</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* En-tête avec avatar */}
                <div className="flex items-center space-x-4">
                  {selectedUser.image_profile ? (
                    <img
                      src={selectedUser.image_profile}
                      alt={`${selectedUser.prenom} ${selectedUser.nom}`}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {getInitials(selectedUser.prenom, selectedUser.nom)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {selectedUser.prenom} {selectedUser.nom}
                    </h3>
                    <p className="text-gray-600">ID: {selectedUser.id}</p>
                  </div>
                </div>

                {/* Informations détaillées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <p className="text-gray-800 font-semibold">{selectedUser.telephone || "Non renseigné"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-800 font-semibold">{selectedUser.email || "Non renseigné"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                      <p className="text-gray-800 font-semibold">{selectedUser.profession || "Non renseignée"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                      <p className="text-gray-800 font-semibold">{selectedUser.adresse || "Non renseignée"}</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date d'inscription</label>
                    <p className="text-gray-800">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : "Date inconnue"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dernière modification</label>
                    <p className="text-gray-800">
                      {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : "Date inconnue"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openEditModal(selectedUser);
                    }}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Supprimer l'Utilisateur
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete.prenom} {userToDelete.nom}</strong> ? 
                Cette action est irréversible.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;