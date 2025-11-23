import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaBus, FaUsers, FaShieldAlt, FaSearch, FaEye, FaRoad } from "react-icons/fa";
import axios from "axios";
import api from "../services/api";

const API_URL = "http://192.168.243.60:3000/api";

const BusesAdmin = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: ""
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [busToDelete, setBusToDelete] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);

  const [form, setForm] = useState({ 
    numero: "", 
    capacite: "", 
    type: "Standard"
  });

  const token = localStorage.getItem("token_compagnie");

  // Charger les bus de la compagnie connectée
  const fetchBuses = async () => {
    try {
      setLoading(true);
      const decoded = parseJwt(token);
      const compagnieId = decoded.compagnie_id;
     
      const res = await api.get(`/buses/compagnie/${compagnieId}`);
      setBuses(res.data.data || []);
    } catch (err) {
      console.error("Erreur chargement des bus:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBuses();
    } else {
      console.warn("Token non trouvé dans le localStorage !");
      setLoading(false);
    }
  }, [token]);

  // Créer ou modifier un bus
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      if (editingBus) {
        await api.put(`/buses/${editingBus.id}`, form);
      } else {
        await api.post(`/buses`, form);
      }
      setModalOpen(false);
      resetForm();
      fetchBuses();
    } catch (err) {
      console.error("Erreur création/mise à jour:", err);
      alert(err.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  // Supprimer un bus
  const handleDelete = async () => {
    try {
 
      await api.delete(`/buses/${busToDelete.id}`);
      setShowDeleteModal(false);
      setBusToDelete(null);
      fetchBuses();
    } catch (err) {
      console.error("Erreur suppression:", err);
      alert("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setForm({ numero: "", capacite: "", type: "Standard" });
    setEditingBus(null);
  };

  const openEdit = (bus) => {
    setEditingBus(bus);
    
    setForm({
      numero: bus.numero,
      capacite: bus.capacite,
      type: bus.type || "Standard"
    });
    setModalOpen(true);
  };

  const openDetailModal = (bus) => {
    setSelectedBus(bus);
    setShowDetailModal(true);
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return {};
    }
  };

  const filteredBuses = buses.filter(bus => {
    const matchesSearch = 
      bus.numero.toString().includes(searchTerm) ||
      bus.type?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !filters.type || bus.type === filters.type;

    return matchesSearch && matchesType;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case "VIP": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Standard": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Minibus": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "VIP": return "⭐";
      case "Standard": return "🚌";
      case "Minibus": return "🚐";
      default: return "🚗";
    }
  };

  // Calcul des statistiques
  const stats = {
    total: buses.length,
    vip: buses.filter(b => b.type === "VIP").length,
    standard: buses.filter(b => b.type === "Standard").length,
    minibus: buses.filter(b => b.type === "Minibus").length,
    capaciteTotale: buses.reduce((sum, bus) => sum + (bus.capacite || 0), 0)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des bus...</p>
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
            <FaBus className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Gestion des Bus
          </h1>
          <p className="text-gray-600">
            Gérez votre flotte de bus
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Bus"
            value={stats.total}
            icon={<FaBus className="text-2xl" />}
            color="bg-blue-500"
            subtitle={`${stats.capaciteTotale} places totales`}
          />
           <StatCard
            title="Munis Bus"
            value={stats.minibus}
            icon={<FaShieldAlt className="text-2xl" />}
            color="bg-purple-500"
            subtitle="Service premium"
          />
          <StatCard
            title="Bus Standard"
            value={stats.standard}
            icon={<FaRoad className="text-2xl" />}
            color="bg-green-500"
            subtitle="Bus classiques"
          />
          <StatCard
            title="Bus VIP"
            value={stats.vip}
            icon={<FaShieldAlt className="text-2xl" />}
            color="bg-purple-500"
            subtitle="Service premium"
          />
        </div>

        {/* Barre d'actions et filtres */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un bus par numéro ou type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <button
              onClick={() => {
                resetForm();
                setModalOpen(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 font-semibold"
            >
              <FaPlus />
              <span>Nouveau Bus</span>
            </button>
          </div>

          {/* Filtres avancés */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Tous les types</option>
                <option value="VIP">VIP</option>
                <option value="Standard">Standard</option>
                <option value="Minibus">Minibus</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ type: "" })}
                className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des bus */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBuses.map((bus) => (
            <div key={bus.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <FaBus className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">Bus #{bus.numero}</h3>
                      <p className="text-white/80 text-sm">ID: {bus.id}</p>
                    </div>
                  </div>
                  <div className="text-white text-2xl">
                    {getTypeIcon(bus.type)}
                  </div>
                </div>
              </div>

             

              {/* Content */}
              <div className="p-6">
                {/* Type et capacité */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getTypeIcon(bus.type)}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{bus.type || "Standard"}</p>
                      <p className="text-sm text-gray-500">Type de bus</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 text-lg font-bold text-blue-600">
                      <FaUsers className="text-blue-500" />
                      <span>{bus.capacite}</span>
                    </div>
                    <p className="text-sm text-gray-500">Places</p>
                  </div>
                </div>

                {/* Badge type */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(bus.type)}`}>
                    {bus.type || "Standard"}
                  </span>
                </div>

                {/* Informations supplémentaires */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>Date création:</span>
                    <span className="font-medium">
                      {bus.createdAt ? new Date(bus.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dernière modification:</span>
                    <span className="font-medium">
                      {bus.updatedAt ? new Date(bus.updatedAt).toLocaleDateString('fr-FR') : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => openDetailModal(bus)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition"
                  >
                    <FaEye />
                    <span className="text-sm">Détails</span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEdit(bus)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => {
                        setBusToDelete(bus);
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

        {filteredBuses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <FaBus className="text-gray-400 text-4xl mx-auto mb-4" />
            <h3 className="text-gray-600 text-lg font-medium">Aucun bus trouvé</h3>
            <p className="text-gray-500">
              {searchTerm || filters.type
                ? "Essayez de modifier vos critères de recherche" 
                : "Créez votre premier bus"
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal Création/Édition */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingBus ? "Modifier le Bus" : "Nouveau Bus"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro *
                    </label>
                    <input
                      type="number"
                      value={form.numero}
                      onChange={(e) => setForm({ ...form, numero: e.target.value })}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacité *
                    </label>
                    <input
                      type="number"
                      value={form.capacite}
                      onChange={(e) => setForm({ ...form, capacite: e.target.value })}
                      min="1"
                      max="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="Standard">Standard</option>
                    <option value="VIP">VIP</option>
                    <option value="Minibus">Minibus</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    {editingBus ? "Modifier" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails */}
      {showDetailModal && selectedBus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Détails du Bus</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* En-tête */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <FaBus className="text-white text-3xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Bus #{selectedBus.numero}</h3>
                    <p className="text-gray-600">Votre flotte</p>
                  </div>
                </div>

                {/* Informations principales */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getTypeIcon(selectedBus.type)}</span>
                        <span className="font-semibold text-gray-800">{selectedBus.type || "Standard"}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacité</label>
                      <div className="flex items-center space-x-2">
                        <FaUsers className="text-blue-500" />
                        <span className="font-semibold text-gray-800 text-xl">{selectedBus.capacite} places</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                      <p className="font-mono text-gray-800">{selectedBus.id}</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de création</label>
                    <p className="text-gray-800">
                      {selectedBus.createdAt ? new Date(selectedBus.createdAt).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dernière modification</label>
                    <p className="text-gray-800">
                      {selectedBus.updatedAt ? new Date(selectedBus.updatedAt).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                      openEdit(selectedBus);
                      setShowDetailModal(false);
                      
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
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
      {showDeleteModal && busToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Supprimer le Bus
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer le bus <strong>#{busToDelete.numero}</strong> ? 
                Cette action est irréversible.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setBusToDelete(null);
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

export default BusesAdmin;