import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaRoute,
  FaBus,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaUsers,
  FaChartLine
} from "react-icons/fa";
import api from "../services/api";



const Trajets = () => {
  const [trajets, setTrajets] = useState([]);
  const [villes, setVilles] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedTrajet, setSelectedTrajet] = useState(null);
  const [trajetToDelete, setTrajetToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    ville_depart: "",
    ville_arrivee: "",
    date: ""
  });

  const [form, setForm] = useState({
    bus_id: "",
    ville_depart_id: "",
    ville_arrivee_id: "",
    date_depart: "",
    heure_depart: "",
    prix: "",
  });

  const token = localStorage.getItem("token_compagnie");
  const compagnieId = localStorage.getItem("compagnie_id");


  useEffect(() => {
    if (token && compagnieId) {
      fetchVilles();
      fetchBuses();
      fetchTrajets();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchVilles = async () => {
    try {
      const res = await api.get(`/villes`);
      setVilles(res.data || []);
    } catch (error) {
      console.error("Erreur récupération villes:", error);
    }
  };

  const fetchBuses = async () => {
    try {
      const res = await api.get(`/buses/compagnie/${compagnieId}`);
      setBuses(res.data?.data || []);
    } catch (error) {
      console.error("Erreur récupération buses:", error);
    }
  };

  const fetchTrajets = async () => {
    try {
      const res = await api.get(`/trajets/compagnie/${compagnieId}`);
      if (res.data.success) setTrajets(res.data.data || []);
    } catch (error) {
      console.error("Erreur récupération trajets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir la capacité d'un bus
  const getBusCapacity = (busId) => {
    const bus = buses.find(b => b.id === busId);
    return bus ? bus.capacite : 0;
  };

  // Fonction pour obtenir le numéro d'un bus
  const getBusNumber = (busId) => {
    const bus = buses.find(b => b.id === busId);
    return bus ? bus.numero : "N/A";
  };

  const saveTrajet = async () => {
    try {
      const dataToSend = {
        bus_id: parseInt(form.bus_id),
        ville_depart_id: parseInt(form.ville_depart_id),
        ville_arrivee_id: parseInt(form.ville_arrivee_id),
        date_depart: form.date_depart,
        heure_depart: form.heure_depart,
        prix: parseFloat(form.prix)
      };

      if (editing) {
        await api.put(`/trajets/${editing}`, dataToSend);
      } else {
        await api.post(`/trajets`, dataToSend);
      }
      
      fetchTrajets();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Erreur sauvegarde trajet:", error);
      alert(error.response?.data?.message || "Erreur lors de la sauvegarde");
    }
  };

  const deleteTrajet = async () => {
    try {
      await api.delete(`/trajets/${trajetToDelete.id}`);
      setTrajets(trajets.filter((t) => t.id !== trajetToDelete.id));
      setShowDeleteModal(false);
      setTrajetToDelete(null);
    } catch (error) {
      console.error("Erreur suppression trajet:", error);
    }
  };

  const openModal = (trajet = null) => {
    if (trajet) {
      setEditing(trajet.id);
      setForm({
        bus_id: trajet.bus_id?.toString() || "",
        ville_depart_id: trajet.ville_depart_id?.toString() || "",
        ville_arrivee_id: trajet.ville_arrivee_id?.toString() || "",
        date_depart: trajet.date_depart?.split("T")[0] || "",
        heure_depart: trajet.heure_depart || "",
        prix: trajet.prix?.toString() || "",
      });
    } else {
      setEditing(null);
      resetForm();
    }
    setShowModal(true);
  };

  const openDetailModal = (trajet) => {
    setSelectedTrajet(trajet);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setForm({
      bus_id: "",
      ville_depart_id: "",
      ville_arrivee_id: "",
      date_depart: "",
      heure_depart: "",
      prix: "",
    });
  };

  const filteredTrajets = trajets.filter(trajet => {
    const matchesSearch = 
      trajet.VilleDepart?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trajet.VilleArrivee?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getBusNumber(trajet.bus_id).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepart = !filters.ville_depart || trajet.ville_depart_id === parseInt(filters.ville_depart);
    const matchesArrivee = !filters.ville_arrivee || trajet.ville_arrivee_id === parseInt(filters.ville_arrivee);
    const matchesDate = !filters.date || trajet.date_depart.startsWith(filters.date);

    return matchesSearch && matchesDepart && matchesArrivee && matchesDate;
  });

  // Calcul des statistiques CORRIGÉ
  const stats = {
    total: trajets.length,
   
    revenuTotal: trajets.reduce((sum, t) => {
      const capaciteBus = getBusCapacity(t.bus_id);
      const placesOccupees = capaciteBus - t.place_disponibles;
      return sum + (t.prix * placesOccupees);
    }, 0),
    tauxRemplissage: trajets.length > 0 
      ? (trajets.reduce((sum, t) => {
          const capaciteBus = getBusCapacity(t.bus_id);
          if (capaciteBus === 0) return sum;
          return sum + ((capaciteBus - t.place_disponibles) / capaciteBus * 100);
        }, 0) / trajets.length).toFixed(1)
      : 0
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

  const getVilleName = (villeId) => {
    const ville = villes.find(v => v.id === villeId);
    return ville ? ville.nom : "—";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des trajets...</p>
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
            <FaRoute className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Gestion des Trajets
          </h1>
          <p className="text-gray-600">
            Planifiez et gérez vos trajets en temps réel
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Trajets"
            value={stats.total}
            icon={<FaRoute className="text-2xl" />}
            color="bg-blue-500"
            subtitle="Tous vos trajets"
          />
          
          <StatCard
            title="Revenu Total"
            value={`${stats.revenuTotal.toLocaleString()} FCFA`}
            icon={<FaMoneyBillWave className="text-2xl" />}
            color="bg-purple-500"
            subtitle="Revenus générés"
          />
          <StatCard
            title="Taux Remplissage"
            value={`${stats.tauxRemplissage}%`}
            icon={<FaChartLine className="text-2xl" />}
            color="bg-orange-500"
            subtitle="Moyenne d'occupation"
          />
        </div>

        {/* Barre d'actions et filtres */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un trajet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <button
              onClick={() => openModal()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 font-semibold"
            >
              <FaPlus />
              <span>Nouveau Trajet</span>
            </button>
          </div>

          {/* Filtres avancés */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Départ</label>
              <select
                value={filters.ville_depart}
                onChange={(e) => setFilters({ ...filters, ville_depart: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Tous les départs</option>
                {villes.map(ville => (
                  <option key={ville.id} value={ville.id}>
                    {ville.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Arrivée</label>
              <select
                value={filters.ville_arrivee}
                onChange={(e) => setFilters({ ...filters, ville_arrivee: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Toutes les arrivées</option>
                {villes.map(ville => (
                  <option key={ville.id} value={ville.id}>
                    {ville.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ ville_depart: "", ville_arrivee: "", date: "" })}
                className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des trajets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTrajets.map((trajet) => {
            const busCapacity = getBusCapacity(trajet.bus_id);
            const placesOccupees = busCapacity - trajet.place_disponibles;
            const tauxOccupation = busCapacity > 0 ? Math.round((placesOccupees / busCapacity) * 100) : 0;

            return (
              <div key={trajet.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <FaBus className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">Bus {getBusNumber(trajet.bus_id)}</h3>
                        <p className="text-white/80 text-sm">{trajet.place_disponibles} places disponibles</p>
                      </div>
                    </div>
                    <div className="text-white text-2xl">
                      🚌
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Itinéraire */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <FaMapMarkerAlt className="text-green-500 text-xl mb-1" />
                      <p className="font-semibold text-gray-800">{trajet.VilleDepart?.nom || getVilleName(trajet.ville_depart_id)}</p>
                      <p className="text-sm text-gray-500">Départ</p>
                    </div>
                    <div className="flex-1 mx-4 relative">
                      <div className="h-0.5 bg-gray-300"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <FaRoute className="text-blue-500" />
                      </div>
                    </div>
                    <div className="text-center">
                      <FaMapMarkerAlt className="text-red-500 text-xl mb-1" />
                      <p className="font-semibold text-gray-800">{trajet.VilleArrivee?.nom || getVilleName(trajet.ville_arrivee_id)}</p>
                      <p className="text-sm text-gray-500">Arrivée</p>
                    </div>
                  </div>

                  {/* Horaires et prix */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 text-lg font-bold text-blue-600">
                        <FaCalendarAlt className="text-blue-500" />
                        <span>{new Date(trajet.date_depart).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <p className="text-sm text-gray-500">Date</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 text-lg font-bold text-green-600">
                        <FaClock className="text-green-500" />
                        <span>{trajet.heure_depart}</span>
                      </div>
                      <p className="text-sm text-gray-500">Heure</p>
                    </div>
                  </div>

                  {/* Prix et occupation */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{trajet.prix?.toLocaleString()} FCFA</div>
                      <p className="text-sm text-gray-500">Prix par place</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center space-x-2 text-lg font-bold text-orange-600">
                        <FaUsers className="text-orange-500" />
                        <span>{placesOccupees}/{busCapacity}</span>
                      </div>
                      <p className="text-sm text-gray-500">Occupation</p>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Taux d'occupation</span>
                      <span>{tauxOccupation}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${tauxOccupation}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button
                      onClick={() => openDetailModal(trajet)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition"
                    >
                      <FaEye />
                      <span className="text-sm">Détails</span>
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openModal(trajet)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => {
                          setTrajetToDelete(trajet);
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
            );
          })}
        </div>

        {filteredTrajets.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <FaRoute className="text-gray-400 text-4xl mx-auto mb-4" />
            <h3 className="text-gray-600 text-lg font-medium">Aucun trajet trouvé</h3>
            <p className="text-gray-500">
              {searchTerm || Object.values(filters).some(f => f) 
                ? "Essayez de modifier vos critères de recherche" 
                : "Créez votre premier trajet"
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal Création/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editing ? "Modifier le Trajet" : "Nouveau Trajet"}
              </h2>
              
              <form onSubmit={(e) => { e.preventDefault(); saveTrajet(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bus *
                    </label>
                    <select
                      value={form.bus_id}
                      onChange={(e) => setForm({ ...form, bus_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    >
                      <option value="">Sélectionner un bus</option>
                      {buses.map((bus) => (
                        <option key={bus.id} value={bus.id}>
                          Bus {bus.numero} ({bus.capacite} places)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix (FCFA) *
                    </label>
                    <input
                      type="number"
                      placeholder="Entrez le prix"
                      value={form.prix}
                      onChange={(e) => setForm({ ...form, prix: e.target.value })}
                      min="1"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville de départ *
                    </label>
                    <select
                      value={form.ville_depart_id}
                      onChange={(e) => setForm({ ...form, ville_depart_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    >
                      <option value="">Sélectionner ville de départ</option>
                      {villes.map((v) => (
                        <option key={v.id} value={v.id}>{v.nom}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville d'arrivée *
                    </label>
                    <select
                      value={form.ville_arrivee_id}
                      onChange={(e) => setForm({ ...form, ville_arrivee_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    >
                      <option value="">Sélectionner ville d'arrivée</option>
                      {villes.map((v) => (
                        <option key={v.id} value={v.id}>{v.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de départ *
                    </label>
                    <input
                      type="date"
                      value={form.date_depart}
                      onChange={(e) => setForm({ ...form, date_depart: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure de départ *
                    </label>
                    <input
                      type="time"
                      value={form.heure_depart}
                      onChange={(e) => setForm({ ...form, heure_depart: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
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
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    {editing ? "Modifier" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails */}
      {showDetailModal && selectedTrajet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Détails du Trajet</h2>
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
                    <FaRoute className="text-white text-3xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Trajet #{selectedTrajet.id}</h3>
                    <p className="text-gray-600">Bus {getBusNumber(selectedTrajet.bus_id)}</p>
                  </div>
                </div>

                {/* Itinéraire */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <FaMapMarkerAlt className="text-green-500 text-2xl mb-2" />
                      <p className="font-bold text-gray-800">{selectedTrajet.VilleDepart?.nom || getVilleName(selectedTrajet.ville_depart_id)}</p>
                      <p className="text-sm text-gray-500">Départ</p>
                    </div>
                    <div className="flex-1 mx-4 relative">
                      <div className="h-0.5 bg-gray-400"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <FaRoute className="text-blue-500 text-xl" />
                      </div>
                    </div>
                    <div className="text-center">
                      <FaMapMarkerAlt className="text-red-500 text-2xl mb-2" />
                      <p className="font-bold text-gray-800">{selectedTrajet.VilleArrivee?.nom || getVilleName(selectedTrajet.ville_arrivee_id)}</p>
                      <p className="text-sm text-gray-500">Arrivée</p>
                    </div>
                  </div>
                </div>

                {/* Informations détaillées */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date et heure</label>
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="text-blue-500" />
                        <span className="font-semibold">
                          {new Date(selectedTrajet.date_depart).toLocaleDateString('fr-FR')} à {selectedTrajet.heure_depart}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
                      <div className="flex items-center space-x-2">
                        <FaMoneyBillWave className="text-green-500" />
                        <span className="font-semibold text-xl">{selectedTrajet.prix?.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                      <div className="flex items-center space-x-2">
                        <FaUsers className="text-orange-500" />
                        <span className="font-semibold">
                          {getBusCapacity(selectedTrajet.bus_id) - selectedTrajet.place_disponibles}/{getBusCapacity(selectedTrajet.bus_id)} places
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Taux d'occupation</label>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ 
                            width: `${Math.round(((getBusCapacity(selectedTrajet.bus_id) - selectedTrajet.place_disponibles) / getBusCapacity(selectedTrajet.bus_id)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 text-right">
                        {Math.round(((getBusCapacity(selectedTrajet.bus_id) - selectedTrajet.place_disponibles) / getBusCapacity(selectedTrajet.bus_id)) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openModal(selectedTrajet);
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
      {showDeleteModal && trajetToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Supprimer le Trajet
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer le trajet de <strong>{trajetToDelete.VilleDepart?.nom || getVilleName(trajetToDelete.ville_depart_id)}</strong> à <strong>{trajetToDelete.VilleArrivee?.nom || getVilleName(trajetToDelete.ville_arrivee_id)}</strong> ? 
                Cette action est irréversible.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setTrajetToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={deleteTrajet}
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

export default Trajets;