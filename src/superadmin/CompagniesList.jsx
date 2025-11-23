import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaBuilding,
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaSearch,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGlobe,
  FaToggleOn,
  FaToggleOff,
  FaStar,
  FaRoute,
  FaComments
} from "react-icons/fa";
import api from "../services/api";


const CompagniesManagement = () => {
  const [compagnies, setCompagnies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCompagnie, setEditingCompagnie] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [compagnieToDelete, setCompagnieToDelete] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCompagnie, setSelectedCompagnie] = useState(null);

  const [form, setForm] = useState({
    nom: "",
    adresse: "",
    telephone: "",
    email: "",
    logo_url: "",
    conditions_embarquement: "",
    conditions_annulation: "",
    conditions_billet_rate: "",
    password: ""
  });

 

  useEffect(() => {
    fetchCompagnies();
  }, []);

  const fetchCompagnies = async () => {
    try {
     
      const response = await api.get("/compagnies");
      setCompagnies(response.data);
    } catch (error) {
      console.error("Erreur chargement compagnies:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompagnies = compagnies.filter(compagnie =>
    compagnie.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    compagnie.telephone.includes(searchTerm) ||
    compagnie.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
    
      
      if (editingCompagnie) {
        // Mise à jour
        await api.put(`/compagnies/${editingCompagnie.id}`, form);
      } else {
        // Création
        await api.post("/compagnies", form);
      }
      
      setShowModal(false);
      resetForm();
      fetchCompagnies();
    } catch (error) {
      console.error("Erreur création/mise à jour:", error);
      alert(error.response?.data?.message || "Erreur lors de l'opération");
    }
  };

  const handleDelete = async () => {
    try {
      
      await api.delete(`/compagnies/${compagnieToDelete.id}`);
      setShowDeleteModal(false);
      setCompagnieToDelete(null);
      fetchCompagnies();
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setForm({
      nom: "",
      adresse: "",
      telephone: "",
      email: "",
      logo_url: "",
      conditions_embarquement: "",
      conditions_annulation: "",
      conditions_billet_rate: "",
      password: ""
    });
    setEditingCompagnie(null);
  };

  const openEditModal = (compagnie) => {
    setEditingCompagnie(compagnie);
    setForm({
      nom: compagnie.nom,
      adresse: compagnie.adresse,
      telephone: compagnie.telephone,
      email: compagnie.email || "",
      logo_url: compagnie.logo_url || "",
      conditions_embarquement: compagnie.conditions_embarquement || "",
      conditions_annulation: compagnie.conditions_annulation || "",
      conditions_billet_rate: compagnie.conditions_billet_rate || "",
      password: ""
    });
    setShowModal(true);
  };

  const openDetailModal = (compagnie) => {
    setSelectedCompagnie(compagnie);
    setShowDetailModal(true);
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des compagnies...</p>
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
            <FaBuilding className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Gestion des Compagnies
          </h1>
          <p className="text-gray-600">
            Créez, modifiez et gérez toutes les compagnies de transport
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Compagnies"
            value={compagnies.length}
            icon={<FaBuilding className="text-2xl" />}
            color="bg-purple-500"
          />
          <StatCard
            title="Compagnies Actives"
            value={compagnies.filter(c => c.is_active !== false).length}
            icon={<FaToggleOn className="text-2xl" />}
            color="bg-green-500"
          />
          <StatCard
            title="Avec Email"
            value={compagnies.filter(c => c.email).length}
            icon={<FaEnvelope className="text-2xl" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Nouvelles"
            value={compagnies.filter(c => {
              const created = new Date(c.createdAt);
              const now = new Date();
              return (now - created) < 7 * 24 * 60 * 60 * 1000; // 7 jours
            }).length}
            icon={<FaStar className="text-2xl" />}
            color="bg-orange-500"
          />
        </div>

        {/* Barre d'actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une compagnie..."
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
              <span>Nouvelle Compagnie</span>
            </button>
          </div>
        </div>

        {/* Tableau des compagnies */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Compagnie
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Adresse
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Conditions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date Création
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCompagnies.map((compagnie) => (
                  <tr key={compagnie.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {compagnie.logo_url ? (
                          <img
                            src={compagnie.logo_url}
                            alt={compagnie.nom}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <FaBuilding className="text-purple-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{compagnie.nom}</p>
                          <p className="text-sm text-gray-500">ID: {compagnie.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <FaPhone className="text-gray-400" />
                          <span>{compagnie.telephone}</span>
                        </div>
                        {compagnie.email && (
                          <div className="flex items-center space-x-2 text-sm">
                            <FaEnvelope className="text-gray-400" />
                            <span>{compagnie.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <span className="max-w-xs truncate">{compagnie.adresse}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {compagnie.conditions_embarquement && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            Embarquement
                          </span>
                        )}
                        {compagnie.conditions_annulation && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Annulation
                          </span>
                        )}
                        {compagnie.conditions_billet_rate && (
                          <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                            Billet raté
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(compagnie.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailModal(compagnie)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Voir détails"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => openEditModal(compagnie)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Modifier"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => {
                            setCompagnieToDelete(compagnie);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCompagnies.length === 0 && (
            <div className="text-center py-12">
              <FaBuilding className="text-gray-400 text-4xl mx-auto mb-4" />
              <h3 className="text-gray-600 text-lg font-medium">Aucune compagnie trouvée</h3>
              <p className="text-gray-500">
                {searchTerm ? "Essayez de modifier vos critères de recherche" : "Créez votre première compagnie"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Création/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingCompagnie ? "Modifier la Compagnie" : "Nouvelle Compagnie"}
              </h2>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={form.adresse}
                    onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={form.logo_url}
                      onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                    />
                  </div>
                </div>

                {!editingCompagnie && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe *
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      required={!editingCompagnie}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conditions Embarquement
                    </label>
                    <textarea
                      value={form.conditions_embarquement}
                      onChange={(e) => setForm({ ...form, conditions_embarquement: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conditions Annulation
                    </label>
                    <textarea
                      value={form.conditions_annulation}
                      onChange={(e) => setForm({ ...form, conditions_annulation: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conditions Billet Raté
                    </label>
                    <textarea
                      value={form.conditions_billet_rate}
                      onChange={(e) => setForm({ ...form, conditions_billet_rate: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition resize-none"
                    />
                  </div>
                </div>

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
                    {editingCompagnie ? "Modifier" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails */}
      {showDetailModal && selectedCompagnie && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Détails de la Compagnie</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  {selectedCompagnie.logo_url ? (
                    <img
                      src={selectedCompagnie.logo_url}
                      alt={selectedCompagnie.nom}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <FaBuilding className="text-purple-600 text-2xl" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedCompagnie.nom}</h3>
                    <p className="text-gray-600">ID: {selectedCompagnie.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <p className="text-gray-800">{selectedCompagnie.telephone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-800">{selectedCompagnie.email || "Non renseigné"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                      <p className="text-gray-800">{selectedCompagnie.adresse}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date de création</label>
                      <p className="text-gray-800">
                        {new Date(selectedCompagnie.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dernière modification</label>
                      <p className="text-gray-800">
                        {new Date(selectedCompagnie.updatedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedCompagnie.conditions_embarquement && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Conditions d'embarquement</label>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                      {selectedCompagnie.conditions_embarquement}
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openEditModal(selectedCompagnie);
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
      {showDeleteModal && compagnieToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Supprimer la Compagnie
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer la compagnie <strong>{compagnieToDelete.nom}</strong> ? 
                Cette action est irréversible.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCompagnieToDelete(null);
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

export default CompagniesManagement;