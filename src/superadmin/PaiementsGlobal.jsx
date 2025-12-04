import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaMoneyBillWave,
  FaCreditCard,
  FaBuilding,
  FaUser,
  FaRoute,
  FaCalendarAlt,
  FaSearch,
  FaEye,
  FaChartBar,
  FaReceipt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaFilter,
  FaDownload,
  FaMapMarkerAlt,
  FaExchangeAlt
} from "react-icons/fa";
import api from "../services/api";

const PaiementsManagement = () => {
  const [paiements, setPaiements] = useState([]);
  const [compagnies, setCompagnies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    compagnie: "",
    statut: "",
    mode: "",
    dateDebut: "",
    dateFin: ""
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPaiement, setSelectedPaiement] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);


  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      
      // Récupérer toutes les compagnies d'abord
      const compagniesRes = await api.get("/compagnies");
      setCompagnies(compagniesRes.data);

      // Récupérer les paiements pour chaque compagnie
      const allPaiements = [];
      for (const compagnie of compagniesRes.data) {
        try {
          const paiementsRes = await api.get(`/paiements/compagnie/${compagnie.id}`);
          if (paiementsRes.data && paiementsRes.data.paiements) {
            // Ajouter les informations de l'utilisateur manquantes
            const paiementsAvecUser = await Promise.all(
              paiementsRes.data.paiements.map(async (paiement) => {
                try {
                  const userRes = await api.get(`/users/${paiement.Reservation.user_id}`);
                  return {
                    ...paiement,
                    Reservation: {
                      ...paiement.Reservation,
                      User: userRes.data
                    }
                  };
                } catch (error) {
                  console.error(`Erreur chargement user ${paiement.Reservation.user_id}:`, error);
                  return {
                    ...paiement,
                    Reservation: {
                      ...paiement.Reservation,
                      User: {
                        nom: "Inconnu",
                        prenom: "Utilisateur",
                        telephone: "N/A"
                      }
                    }
                  };
                }
              })
            );
            allPaiements.push(...paiementsAvecUser);
          }
        } catch (error) {
          console.error(`Erreur chargement paiements compagnie ${compagnie.id}:`, error);
        }
      }
      
      setPaiements(allPaiements);
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPaiements = paiements.filter(paiement => {
    const matchesSearch = 
      paiement.transaction_ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paiement.Reservation?.User?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paiement.Reservation?.User?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paiement.Reservation?.Trajet?.VilleDepart?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paiement.Reservation?.Trajet?.VilleArrivee?.nom?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompagnie = !filters.compagnie || 
      paiement.Reservation?.Trajet?.Compagnie?.nom === filters.compagnie;
    const matchesStatut = !filters.statut || paiement.statut === filters.statut;
    const matchesMode = !filters.mode || paiement.mode === filters.mode;

    // Filtre par date
    let matchesDate = true;
    if (filters.dateDebut) {
      const paiementDate = new Date(paiement.createdAt);
      const debutDate = new Date(filters.dateDebut);
      matchesDate = matchesDate && paiementDate >= debutDate;
    }
    if (filters.dateFin) {
      const paiementDate = new Date(paiement.createdAt);
      const finDate = new Date(filters.dateFin);
      finDate.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && paiementDate <= finDate;
    }

    return matchesSearch && matchesCompagnie && matchesStatut && matchesMode && matchesDate;
  });

  const openDetailModal = (paiement) => {
    setSelectedPaiement(paiement);
    setShowDetailModal(true);
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-1 ${trend.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case "réussi": return "bg-green-100 text-green-800 border-green-200";
      case "en_attente": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "échoué": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case "réussi": return <FaCheckCircle className="text-green-500" />;
      case "en_attente": return <FaClock className="text-yellow-500" />;
      case "échoué": return <FaTimesCircle className="text-red-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const getModeColor = (mode) => {
    switch (mode) {
      case "Orange Money": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Moov Money": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Carte Bancaire": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Wave": return "bg-green-100 text-green-800 border-green-200";
      case "carte": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getModeDisplayName = (mode) => {
    switch (mode) {
      case "carte": return "Carte Bancaire";
      default: return mode || "Non spécifié";
    }
  };

  // Calcul des statistiques basées sur les données réelles
  const stats = {
    total: paiements.length,
    totalRevenue: paiements.reduce((sum, p) => sum + parseFloat(p.montant || 0), 0),
    reussis: paiements.filter(p => p.statut === "réussi").length,
    enAttente: paiements.filter(p => p.statut === "en_attente").length,
    echoues: paiements.filter(p => p.statut === "échoué").length,
    revenueMensuel: paiements
      .filter(p => p.statut === "réussi" && new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, p) => sum + parseFloat(p.montant || 0), 0)
  };

  const compagniesUniques = [...new Set(paiements.map(p => p.Reservation?.Trajet?.Compagnie?.nom).filter(Boolean))];
  const modesPaiement = [...new Set(paiements.map(p => p.mode).filter(Boolean))];

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const csvContent = [
        ["ID", "Transaction", "Montant", "Mode", "Statut", "Date", "Client", "Compagnie", "Trajet"],
        ...filteredPaiements.map(p => [
          p.id,
          p.transaction_ref,
          formatCurrency(p.montant),
          getModeDisplayName(p.mode),
          p.statut,
          formatDateTime(p.createdAt),
          `${p.Reservation?.User?.prenom || ''} ${p.Reservation?.User?.nom || ''}`.trim(),
          p.Reservation?.Trajet?.Compagnie?.nom || 'N/A',
          `${p.Reservation?.Trajet?.VilleDepart?.nom || 'N/A'} → ${p.Reservation?.Trajet?.VilleArrivee?.nom || 'N/A'}`
        ])
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paiements-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur export:", error);
      alert("Erreur lors de l'export");
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des paiements...</p>
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
            <FaMoneyBillWave className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Gestion des Paiements
          </h1>
          <p className="text-gray-600">
            Supervisez et gérez tous les paiements de la plateforme
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Paiements"
            value={stats.total}
            icon={<FaReceipt className="text-2xl" />}
            color="bg-purple-500"
            subtitle={`${stats.reussis} réussis`}
          />
          <StatCard
            title="Revenue Total"
            value={formatCurrency(stats.totalRevenue)}
            icon={<FaMoneyBillWave className="text-2xl" />}
            color="bg-green-500"
            subtitle={`${formatCurrency(stats.revenueMensuel)} ce mois`}
          />
          <StatCard
            title="Taux de Réussite"
            value={`${stats.total > 0 ? ((stats.reussis / stats.total) * 100).toFixed(1) : 0}%`}
            icon={<FaChartBar className="text-2xl" />}
            color="bg-blue-500"
            subtitle={`${stats.echoues} échecs`}
          />
          <StatCard
            title="En Attente"
            value={stats.enAttente}
            icon={<FaClock className="text-2xl" />}
            color="bg-yellow-500"
            subtitle="Paiements en cours"
          />
        </div>

        {/* Barre d'actions et filtres */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un paiement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                disabled={exportLoading}
                className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition flex items-center space-x-2 font-semibold disabled:opacity-50"
              >
                <FaDownload />
                <span>{exportLoading ? "Export..." : "Exporter"}</span>
              </button>
            </div>
          </div>

          {/* Filtres avancés */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Compagnie</label>
              <select
                value={filters.compagnie}
                onChange={(e) => setFilters({ ...filters, compagnie: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              >
                <option value="">Toutes les compagnies</option>
                {compagniesUniques.map(compagnie => (
                  <option key={compagnie} value={compagnie}>
                    {compagnie}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              >
                <option value="">Tous les statuts</option>
                <option value="réussi">Réussi</option>
                <option value="en_attente">En attente</option>
                <option value="échoué">Échoué</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
              <select
                value={filters.mode}
                onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              >
                <option value="">Tous les modes</option>
                {modesPaiement.map(mode => (
                  <option key={mode} value={mode}>
                    {getModeDisplayName(mode)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
              <input
                type="date"
                value={filters.dateDebut}
                onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
              <input
                type="date"
                value={filters.dateFin}
                onChange={(e) => setFilters({ ...filters, dateFin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setFilters({ compagnie: "", statut: "", mode: "", dateDebut: "", dateFin: "" })}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium flex items-center space-x-2"
            >
              <FaFilter />
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>

        {/* Liste des paiements */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Compagnie & Trajet
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Mode & Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPaiements.map((paiement) => (
                  <tr key={paiement.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-mono text-sm text-gray-900">{paiement.transaction_ref}</p>
                        <p className="text-xs text-gray-500">ID: {paiement.id}</p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-blue-600 text-sm" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {paiement.Reservation?.User?.prenom} {paiement.Reservation?.User?.nom}
                          </p>
                          <p className="text-sm text-gray-500">{paiement.Reservation?.User?.telephone || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{paiement.Reservation?.Trajet?.Compagnie?.nom || 'N/A'}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          
                          <FaRoute className="text-gray-400" />
                          <span>
                            {paiement.Reservation?.Trajet?.VilleDepart?.nom || 'N/A'} → {paiement.Reservation?.Trajet?.VilleArrivee?.nom || 'N/A'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Bus {paiement.Reservation?.Trajet?.Bus?.numero || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-right">
                        <p className="font-bold text-green-600 text-lg">
                          {formatCurrency(paiement.montant)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(paiement.Reservation?.prix_total)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${getModeColor(paiement.mode)}`}>
                          {getModeDisplayName(paiement.mode)}
                        </span>
                        <div className="flex items-center space-x-2">
                          {getStatutIcon(paiement.statut)}
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatutColor(paiement.statut)}`}>
                            {paiement.statut}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>
                        <p>{formatDate(paiement.createdAt)}</p>
                        <p className="text-xs text-gray-500">
                          {paiement.createdAt ? new Date(paiement.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openDetailModal(paiement)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Voir détails"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPaiements.length === 0 && (
            <div className="text-center py-12">
              <FaMoneyBillWave className="text-gray-400 text-4xl mx-auto mb-4" />
              <h3 className="text-gray-600 text-lg font-medium">Aucun paiement trouvé</h3>
              <p className="text-gray-500">
                {searchTerm || Object.values(filters).some(f => f) 
                  ? "Essayez de modifier vos critères de recherche" 
                  : "Aucun paiement enregistré"
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Détails */}
      {showDetailModal && selectedPaiement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Détails du Paiement</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* En-tête */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Transaction #{selectedPaiement.transaction_ref}</h3>
                    <p className="text-gray-600">ID: {selectedPaiement.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedPaiement.montant)}
                    </p>
                    <div className="flex items-center space-x-2 justify-end mt-1">
                      {getStatutIcon(selectedPaiement.statut)}
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatutColor(selectedPaiement.statut)}`}>
                        {selectedPaiement.statut}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Informations paiement */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                      <FaCreditCard />
                      <span>Informations Paiement</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mode de paiement:</span>
                        <span className="font-semibold">{getModeDisplayName(selectedPaiement.mode)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Statut:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatutColor(selectedPaiement.statut)}`}>
                          {selectedPaiement.statut}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date et heure:</span>
                        <span className="font-semibold">{formatDateTime(selectedPaiement.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Informations client */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                      <FaUser />
                      <span>Informations Client</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nom complet:</span>
                        <span className="font-semibold">
                          {selectedPaiement.Reservation?.User?.prenom} {selectedPaiement.Reservation?.User?.nom}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Téléphone:</span>
                        <span className="font-semibold">{selectedPaiement.Reservation?.User?.telephone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations trajet */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                    <FaRoute />
                    <span>Informations Trajet</span>
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-center">
                        <FaMapMarkerAlt className="text-red-500 text-xl mx-auto mb-2" />
                        <p className="font-bold text-gray-800">{selectedPaiement.Reservation?.Trajet?.VilleDepart?.nom || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Départ</p>
                      </div>
                      <div className="flex-1 mx-4 text-center">
                        <FaExchangeAlt className="text-gray-400 text-xl mb-2" />
                        <div className="h-1 bg-gradient-to-r from-red-400 to-blue-400 rounded-full"></div>
                      </div>
                      <div className="text-center">
                        <FaMapMarkerAlt className="text-blue-500 text-xl mx-auto mb-2" />
                        <p className="font-bold text-gray-800">{selectedPaiement.Reservation?.Trajet?.VilleArrivee?.nom || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Arrivée</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Compagnie:</span>
                        <p className="font-semibold">{selectedPaiement.Reservation?.Trajet?.Compagnie?.nom || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Bus:</span>
                        <p className="font-semibold">{selectedPaiement.Reservation?.Trajet?.Bus?.numero || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Date départ:</span>
                        <p className="font-semibold">
                          {selectedPaiement.Reservation?.Trajet?.date_depart ? 
                            formatDate(selectedPaiement.Reservation.Trajet.date_depart) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Heure:</span>
                        <p className="font-semibold">{selectedPaiement.Reservation?.Trajet?.heure_depart || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Résumé financier */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Résumé Financier</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Montant payé:</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedPaiement.montant)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Prix du trajet:</p>
                      <p className="text-xl font-semibold text-gray-800">
                        {formatCurrency(selectedPaiement.Reservation?.prix_total)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaiementsManagement;