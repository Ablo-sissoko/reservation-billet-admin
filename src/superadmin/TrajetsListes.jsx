import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaRoute,
  FaBus,
  FaBuilding,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaSearch,
  FaUsers,
  FaClock,
  FaExchangeAlt,
  FaFilter,
  FaChartLine,
  FaTicketAlt,
  FaShieldAlt
} from "react-icons/fa";
import api from "../services/api";


const SuperAdminTrajets = () => {
  const [trajets, setTrajets] = useState([]);
  const [compagnies, setCompagnies] = useState([]);
  const [villes, setVilles] = useState([]);
  const [allBuses, setAllBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États pour les modales
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // États pour l'édition et sélection
  const [editingTrajet, setEditingTrajet] = useState(null);
  const [selectedTrajet, setSelectedTrajet] = useState(null);
  const [trajetToDelete, setTrajetToDelete] = useState(null);

  // États pour recherche et filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    compagnie: "",
    ville_depart: "",
    ville_arrivee: "",
    date: "",
    statut: ""
  });

  // État du formulaire
  const [form, setForm] = useState({
    compagnie_id: "",
    bus_id: "",
    ville_depart_id: "",
    ville_arrivee_id: "",
    date_depart: "",
    heure_depart: "",
    prix: "",
    place_disponibles: ""
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);


  // Chargement initial des données
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Filtrer les buses quand une compagnie est sélectionnée
  useEffect(() => {
    if (form.compagnie_id) {
      const busesForCompagnie = allBuses.filter(bus => 
        bus.compagnie_id === parseInt(form.compagnie_id)
      );
      setFilteredBuses(busesForCompagnie);
      
      // Réinitialiser la sélection du bus si le bus actuel n'appartient pas à la nouvelle compagnie
      if (form.bus_id) {
        const currentBus = busesForCompagnie.find(bus => bus.id === parseInt(form.bus_id));
        if (!currentBus) {
          setForm(prev => ({ ...prev, bus_id: "" }));
        }
      }
    } else {
      setFilteredBuses([]);
    }
  }, [form.compagnie_id, allBuses]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Récupérer toutes les données nécessaires
      const [trajetsRes, compagniesRes, villesRes, busesRes] = await Promise.all([
        api.get("/trajets"),
        api.get("/compagnies"),
        api.get("/villes"),
        api.get("/buses")
      ]);

      setTrajets(trajetsRes.data || []);
      setCompagnies(compagniesRes.data || []);
      setVilles(villesRes.data || []);
      
      // Stocker tous les buses
      const busesData = busesRes.data?.data || busesRes.data || [];
      setAllBuses(busesData);
      setFilteredBuses([]);
    } catch (error) {
      console.error("Erreur chargement données:", error);
      alert("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = {};

    if (!form.compagnie_id) {
      errors.compagnie_id = "La compagnie est requise";
    }

    if (!form.bus_id) {
      errors.bus_id = "Le bus est requis";
    }

    if (!form.ville_depart_id) {
      errors.ville_depart_id = "La ville de départ est requise";
    }

    if (!form.ville_arrivee_id) {
      errors.ville_arrivee_id = "La ville d'arrivée est requise";
    }

    if (form.ville_depart_id === form.ville_arrivee_id) {
      errors.ville_arrivee_id = "Les villes de départ et d'arrivée doivent être différentes";
    }

    if (!form.date_depart) {
      errors.date_depart = "La date de départ est requise";
    } else if (new Date(form.date_depart) < new Date().setHours(0, 0, 0, 0)) {
      errors.date_depart = "La date de départ doit être aujourd'hui ou dans le futur";
    }

    if (!form.heure_depart) {
      errors.heure_depart = "L'heure de départ est requise";
    }

    if (!form.prix || form.prix <= 0) {
      errors.prix = "Le prix doit être supérieur à 0";
    }

    if (form.place_disponibles && form.place_disponibles < 0) {
      errors.place_disponibles = "Le nombre de places disponibles ne peut pas être négatif";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fonctions pour gérer les trajets
  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitLoading(true);
      
      const trajetData = {
        compagnie_id: parseInt(form.compagnie_id),
        bus_id: parseInt(form.bus_id),
        ville_depart_id: parseInt(form.ville_depart_id),
        ville_arrivee_id: parseInt(form.ville_arrivee_id),
        date_depart: form.date_depart,
        heure_depart: form.heure_depart,
        prix: parseFloat(form.prix),
        place_disponibles: parseInt(form.place_disponibles) || 0
      };

      if (editingTrajet) {
        await api.put(`/trajets/${editingTrajet.id}`, trajetData);
      } else {
        await api.post("/trajets", trajetData);
      }
      
      setShowModal(false);
      resetForm();
      fetchInitialData();
    } catch (error) {
      console.error("Erreur création/mise à jour:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Erreur lors de l'opération";
      alert(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!trajetToDelete) return;
    
    try {
      
      await api.delete(`/trajets/${trajetToDelete.id}`);
      setShowDeleteModal(false);
      setTrajetToDelete(null);
      fetchInitialData();
    } catch (error) {
      console.error("Erreur suppression:", error);
      const errorMessage = error.response?.data?.message || 
                          "Erreur lors de la suppression";
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setForm({
      compagnie_id: "",
      bus_id: "",
      ville_depart_id: "",
      ville_arrivee_id: "",
      date_depart: "",
      heure_depart: "",
      prix: "",
      place_disponibles: ""
    });
    setEditingTrajet(null);
    setFormErrors({});
    setFilteredBuses([]);
  };

  const openEditModal = (trajet) => {
    setEditingTrajet(trajet);
    setForm({
      compagnie_id: trajet.compagnie_id?.toString() || "",
      bus_id: trajet.bus_id?.toString() || "",
      ville_depart_id: trajet.ville_depart_id?.toString() || "",
      ville_arrivee_id: trajet.ville_arrivee_id?.toString() || "",
      date_depart: trajet.date_depart?.split('T')[0] || "",
      heure_depart: trajet.heure_depart || "",
      prix: trajet.prix?.toString() || "",
      place_disponibles: trajet.place_disponibles?.toString() || "0"
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openDetailModal = (trajet) => {
    setSelectedTrajet(trajet);
    setShowDetailModal(true);
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Fonctions utilitaires
  const isFutureTrajet = (trajet) => {
    if (!trajet.date_depart || !trajet.heure_depart) return false;
    const trajetDateTime = new Date(trajet.date_depart + 'T' + trajet.heure_depart);
    return trajetDateTime > new Date();
  };

  const getStatutTrajet = (trajet) => {
    if (trajet.place_disponibles === 0) return { text: "Complet", color: "red", bg: "red" };
    if (isFutureTrajet(trajet)) return { text: "À venir", color: "green", bg: "green" };
    return { text: "Terminé", color: "gray", bg: "gray" };
  };

  const getCompagnieName = (compagnieId) => {
    const compagnie = compagnies.find(c => c.id === compagnieId);
    return compagnie ? compagnie.nom : "Compagnie inconnue";
  };

  const getVilleName = (villeId) => {
    const ville = villes.find(v => v.id === villeId);
    return ville ? ville.nom : "Ville inconnue";
  };

  const getBusInfo = (busId) => {
    const bus = allBuses.find(b => b.id === busId);
    if (bus) {
      return `Bus ${bus.numero} (${bus.capacite} places)`;
    }
    
    const trajetWithBus = trajets.find(t => t.bus_id === busId && t.Bus);
    if (trajetWithBus && trajetWithBus.Bus) {
      return `Bus ${trajetWithBus.Bus.numero} (${trajetWithBus.Bus.capacite} places)`;
    }
    
    return `Bus #${busId}`;
  };

  // Filtrage des trajets
  const filteredTrajets = trajets.filter(trajet => {
    const matchesSearch = 
      getVilleName(trajet.ville_depart_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getVilleName(trajet.ville_arrivee_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCompagnieName(trajet.compagnie_id).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompagnie = !filters.compagnie || trajet.compagnie_id === parseInt(filters.compagnie);
    const matchesDepart = !filters.ville_depart || trajet.ville_depart_id === parseInt(filters.ville_depart);
    const matchesArrivee = !filters.ville_arrivee || trajet.ville_arrivee_id === parseInt(filters.ville_arrivee);
    const matchesDate = !filters.date || trajet.date_depart.startsWith(filters.date);
    const matchesStatut = !filters.statut || 
      (filters.statut === "futur" && isFutureTrajet(trajet)) ||
      (filters.statut === "passe" && !isFutureTrajet(trajet)) ||
      (filters.statut === "complet" && trajet.place_disponibles === 0);

    return matchesSearch && matchesCompagnie && matchesDepart && matchesArrivee && matchesDate && matchesStatut;
  });

  // Calcul des statistiques
  const stats = {
    total: trajets.length,
    aujourdhui: trajets.filter(t => {
      const today = new Date().toISOString().split('T')[0];
      return t.date_depart && t.date_depart.startsWith(today);
    }).length,
    futurs: trajets.filter(isFutureTrajet).length,
    compagniesActives: [...new Set(trajets.map(t => t.compagnie_id))].length,
    revenuTotal: trajets.reduce((sum, t) => {
      const capaciteBus = t.Bus?.capacite || 50;
      const placesOccupees = capaciteBus - (t.place_disponibles || 0);
      return sum + (t.prix * placesOccupees);
    }, 0),
    tauxRemplissage: trajets.length > 0 
      ? (trajets.reduce((sum, t) => {
          const capaciteBus = t.Bus?.capacite || 50;
          if (capaciteBus === 0) return sum;
          return sum + ((capaciteBus - (t.place_disponibles || 0)) / capaciteBus * 100);
        }, 0) / trajets.length).toFixed(1)
      : 0
  };

  // Composant de carte de statistique
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des trajets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <FaShieldAlt className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Super Admin - Gestion des Trajets
          </h1>
          <p className="text-gray-600 text-lg">
            Contrôle et supervision de tous les trajets de la plateforme
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Trajets"
            value={stats.total}
            icon={<FaRoute className="text-2xl" />}
            color="bg-purple-500"
          />
          <StatCard
            title="Aujourd'hui"
            value={stats.aujourdhui}
            icon={<FaCalendarAlt className="text-2xl" />}
            color="bg-green-500"
          />
          <StatCard
            title="Trajets Futurs"
            value={stats.futurs}
            icon={<FaTicketAlt className="text-2xl" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Compagnies"
            value={stats.compagniesActives}
            icon={<FaBuilding className="text-2xl" />}
            color="bg-orange-500"
          />
          <StatCard
            title="Taux Remplissage"
            value={`${stats.tauxRemplissage}%`}
            icon={<FaChartLine className="text-2xl" />}
            color="bg-red-500"
          />
        </div>

        {/* Barre d'actions et filtres */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un trajet, compagnie ou ville..."
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
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition flex items-center space-x-2 font-semibold shadow-lg"
            >
              <FaPlus />
              <span>Nouveau Trajet</span>
            </button>
          </div>

          {/* Filtres avancés */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Compagnie</label>
              <select
                value={filters.compagnie}
                onChange={(e) => setFilters({ ...filters, compagnie: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              >
                <option value="">Toutes compagnies</option>
                {compagnies.map(compagnie => (
                  <option key={compagnie.id} value={compagnie.id}>
                    {compagnie.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Départ</label>
              <select
                value={filters.ville_depart}
                onChange={(e) => setFilters({ ...filters, ville_depart: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              >
                <option value="">Tous départs</option>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              >
                <option value="">Toutes arrivées</option>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              >
                <option value="">Tous statuts</option>
                <option value="futur">À venir</option>
                <option value="passe">Terminé</option>
                <option value="complet">Complet</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  compagnie: "",
                  ville_depart: "",
                  ville_arrivee: "",
                  date: "",
                  statut: ""
                })}
                className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition font-medium flex items-center justify-center space-x-2"
              >
                <FaFilter />
                <span>Réinitialiser</span>
              </button>
            </div>
          </div>
        </div>

        {/* Liste des trajets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTrajets.map((trajet) => {
            const statut = getStatutTrajet(trajet);
            const capaciteBus = trajet.Bus?.capacite || 50;
            const tauxOccupation = capaciteBus > 0 
              ? Math.round(((capaciteBus - (trajet.place_disponibles || 0)) / capaciteBus) * 100)
              : 0;

            return (
              <div key={trajet.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-200">
                {/* Header avec statut */}
                <div className={`p-4 ${statut.bg === 'red' ? 'bg-red-500' : statut.bg === 'green' ? 'bg-green-500' : 'bg-gray-500'} bg-gradient-to-r from-${statut.bg}-500 to-${statut.bg}-600`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <FaBuilding className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{getCompagnieName(trajet.compagnie_id)}</h3>
                        <p className="text-white/80 text-sm">{getBusInfo(trajet.bus_id)}</p>
                      </div>
                    </div>
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {statut.text}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Itinéraire */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <FaMapMarkerAlt className="text-red-500 mx-auto mb-1" />
                      <p className="font-semibold text-gray-800 text-sm">
                        {getVilleName(trajet.ville_depart_id)}
                      </p>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="h-px bg-gradient-to-r from-red-400 to-blue-400"></div>
                      <FaExchangeAlt className="text-gray-400 mx-auto -mt-2" />
                    </div>
                    <div className="text-center">
                      <FaMapMarkerAlt className="text-blue-500 mx-auto mb-1" />
                      <p className="font-semibold text-gray-800 text-sm">
                        {getVilleName(trajet.ville_arrivee_id)}
                      </p>
                    </div>
                  </div>

                  {/* Date et heure */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="text-purple-500" />
                      <span>{trajet.date_depart ? new Date(trajet.date_depart).toLocaleDateString('fr-FR') : 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-green-500" />
                      <span>{trajet.heure_depart || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Prix et occupation */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mb-4">
                    <div className="flex items-center space-x-2">
                      <FaMoneyBillWave className="text-green-600" />
                      <span className="font-semibold text-gray-700">Prix</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {trajet.prix?.toLocaleString()} FCFA
                    </span>
                  </div>

                  {/* Barre de progression occupation */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Occupation</span>
                      <span>{capaciteBus - (trajet.place_disponibles || 0)}/{capaciteBus} places</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${tauxOccupation}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{tauxOccupation}% rempli</span>
                      <span>{trajet.place_disponibles || 0} places libres</span>
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
                        onClick={() => openEditModal(trajet)}
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
                {editingTrajet ? "Modifier le Trajet" : "Nouveau Trajet"}
              </h2>
              
              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compagnie *
                    </label>
                    <select
                      value={form.compagnie_id}
                      onChange={(e) => handleInputChange("compagnie_id", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition ${
                        formErrors.compagnie_id ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    >
                      <option value="">Sélectionnez une compagnie</option>
                      {compagnies.map(compagnie => (
                        <option key={compagnie.id} value={compagnie.id}>
                          {compagnie.nom}
                        </option>
                      ))}
                    </select>
                    {formErrors.compagnie_id && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.compagnie_id}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bus *
                    </label>
                    <select
                      value={form.bus_id}
                      onChange={(e) => handleInputChange("bus_id", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition ${
                        formErrors.bus_id ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                      disabled={!form.compagnie_id}
                    >
                      <option value="">Sélectionnez un bus</option>
                      {filteredBuses.map(bus => (
                        <option key={bus.id} value={bus.id}>
                          Bus {bus.numero} ({bus.capacite} places)
                        </option>
                      ))}
                    </select>
                    {formErrors.bus_id && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.bus_id}</p>
                    )}
                    {!form.compagnie_id && (
                      <p className="text-sm text-gray-500 mt-1">Veuillez d'abord sélectionner une compagnie</p>
                    )}
                    {form.compagnie_id && filteredBuses.length === 0 && (
                      <p className="text-sm text-yellow-600 mt-1">Aucun bus disponible pour cette compagnie</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville de Départ *
                    </label>
                    <select
                      value={form.ville_depart_id}
                      onChange={(e) => handleInputChange("ville_depart_id", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition ${
                        formErrors.ville_depart_id ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    >
                      <option value="">Sélectionnez une ville</option>
                      {villes.map(ville => (
                        <option key={ville.id} value={ville.id}>
                          {ville.nom}
                        </option>
                      ))}
                    </select>
                    {formErrors.ville_depart_id && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.ville_depart_id}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville d'Arrivée *
                    </label>
                    <select
                      value={form.ville_arrivee_id}
                      onChange={(e) => handleInputChange("ville_arrivee_id", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition ${
                        formErrors.ville_arrivee_id ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    >
                      <option value="">Sélectionnez une ville</option>
                      {villes.map(ville => (
                        <option key={ville.id} value={ville.id}>
                          {ville.nom}
                        </option>
                      ))}
                    </select>
                    {formErrors.ville_arrivee_id && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.ville_arrivee_id}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de Départ *
                    </label>
                    <input
                      type="date"
                      value={form.date_depart}
                      onChange={(e) => handleInputChange("date_depart", e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition ${
                        formErrors.date_depart ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    {formErrors.date_depart && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.date_depart}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure de Départ *
                    </label>
                    <input
                      type="time"
                      value={form.heure_depart}
                      onChange={(e) => handleInputChange("heure_depart", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition ${
                        formErrors.heure_depart ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    {formErrors.heure_depart && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.heure_depart}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix (FCFA) *
                    </label>
                    <input
                      type="number"
                      value={form.prix}
                      onChange={(e) => handleInputChange("prix", e.target.value)}
                      min="1"
                      step="0.01"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition ${
                        formErrors.prix ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    {formErrors.prix && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.prix}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Places Disponibles
                    </label>
                    <input
                      type="number"
                      value={form.place_disponibles}
                      onChange={(e) => handleInputChange("place_disponibles", e.target.value)}
                      min="0"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition ${
                        formErrors.place_disponibles ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {formErrors.place_disponibles && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.place_disponibles}</p>
                    )}
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
                    disabled={submitLoading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitLoading}
                  >
                    {submitLoading ? "Chargement..." : editingTrajet ? "Modifier" : "Créer"}
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
                {/* Compagnie et Bus */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <FaBuilding className="text-purple-600 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{getCompagnieName(selectedTrajet.compagnie_id)}</h3>
                    <p className="text-gray-600">{getBusInfo(selectedTrajet.bus_id)}</p>
                  </div>
                </div>

                {/* Itinéraire détaillé */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <FaMapMarkerAlt className="text-red-500 text-2xl mb-2" />
                      <p className="font-bold text-gray-800">{getVilleName(selectedTrajet.ville_depart_id)}</p>
                      <p className="text-sm text-gray-600">Départ</p>
                    </div>
                    <div className="flex-1 mx-6 text-center">
                      <FaExchangeAlt className="text-gray-400 text-xl mb-2" />
                      <div className="h-1 bg-gradient-to-r from-red-400 to-blue-400 rounded-full"></div>
                    </div>
                    <div className="text-center">
                      <FaMapMarkerAlt className="text-blue-500 text-2xl mb-2" />
                      <p className="font-bold text-gray-800">{getVilleName(selectedTrajet.ville_arrivee_id)}</p>
                      <p className="text-sm text-gray-600">Arrivée</p>
                    </div>
                  </div>
                </div>

                {/* Informations détaillées */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date de départ</label>
                      <p className="text-gray-800 font-semibold">
                        {selectedTrajet.date_depart ? new Date(selectedTrajet.date_depart).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Heure de départ</label>
                      <p className="text-gray-800 font-semibold">{selectedTrajet.heure_depart || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
                      <p className="text-blue-600 font-bold text-xl">
                        {selectedTrajet.prix?.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Places disponibles</label>
                      <p className="text-gray-800 font-semibold">{selectedTrajet.place_disponibles || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Statut */}
                <div className={`p-4 rounded-lg ${
                  getStatutTrajet(selectedTrajet).bg === 'green' 
                    ? 'bg-green-100 border border-green-200' 
                    : getStatutTrajet(selectedTrajet).bg === 'red'
                    ? 'bg-red-100 border border-red-200'
                    : 'bg-gray-100 border border-gray-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      getStatutTrajet(selectedTrajet).bg === 'green' ? 'bg-green-500' : 
                      getStatutTrajet(selectedTrajet).bg === 'red' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="font-semibold">
                      Statut: {getStatutTrajet(selectedTrajet).text}
                    </span>
                  </div>
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
                Êtes-vous sûr de vouloir supprimer le trajet de <strong>{getVilleName(trajetToDelete.ville_depart_id)}</strong> à <strong>{getVilleName(trajetToDelete.ville_arrivee_id)}</strong> ? 
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

export default SuperAdminTrajets;