import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaTicketAlt,
  FaQrcode,
  FaUser,
  FaBuilding,
  FaRoute,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaSearch,
  FaEye,
  FaDownload,
  FaFilter,
  FaChartBar,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaMapMarkerAlt,
  FaCreditCard,
  FaUsers,
  FaShieldAlt,
  FaExclamationTriangle,
  FaSync,
  FaBus
} from "react-icons/fa";

import api from "../services/api";

const SuperAdminEbillets = () => {
  const [ebillets, setEbillets] = useState([]);
  const [compagnies, setCompagnies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    compagnie: "",
    statut: "",
    dateDebut: "",
    dateFin: ""
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEbillet, setSelectedEbillet] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);




  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer toutes les compagnies et e-billets en parallèle
      const [compagniesRes, ebilletsRes] = await Promise.all([
        api.get("/compagnies"),
        api.get("/ebills")
      ]);

      setCompagnies(compagniesRes.data || []);
      
      // Traiter les e-billets pour parser les passagers
      const processedEbillets = (ebilletsRes.data?.ebillets || []).map(ebillet => ({
        ...ebillet,
        passagers: parsePassagers(ebillet.passagers)
      }));
      
      setEbillets(processedEbillets);
    } catch (error) {
      console.error("Erreur chargement données:", error);
      setError("Erreur lors du chargement des données. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const parsePassagers = (passagers) => {
    try {
      if (!passagers) return [];
      
      // Si c'est déjà un tableau, on le retourne directement
      if (Array.isArray(passagers)) return passagers;
      
      // Si c'est une chaîne JSON, on la parse
      if (typeof passagers === 'string') {
        const parsed = JSON.parse(passagers);
        return Array.isArray(parsed) ? parsed : [];
      }
      
      return [];
    } catch (error) {
      console.error("Erreur parsing passagers:", error, passagers);
      return [];
    }
  };

  const filteredEbillets = ebillets.filter(ebillet => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      ebillet.code_qr?.toLowerCase().includes(searchLower) ||
      ebillet.user?.nom?.toLowerCase().includes(searchLower) ||
      ebillet.user?.prenom?.toLowerCase().includes(searchLower) ||
      ebillet.trajet?.ville_depart?.toLowerCase().includes(searchLower) ||
      ebillet.trajet?.ville_arrivee?.toLowerCase().includes(searchLower) ||
      ebillet.paiement?.transaction_ref?.toLowerCase().includes(searchLower);

    const matchesCompagnie = !filters.compagnie || 
      ebillet.trajet?.compagnie === filters.compagnie;
    
    const matchesStatut = !filters.statut || ebillet.statut === filters.statut;

    // Filtre par date de création
    let matchesDate = true;
    if (filters.dateDebut) {
      const ebilletDate = new Date(ebillet.createdAt);
      const debutDate = new Date(filters.dateDebut);
      matchesDate = matchesDate && ebilletDate >= debutDate;
    }
    if (filters.dateFin) {
      const ebilletDate = new Date(ebillet.createdAt);
      const finDate = new Date(filters.dateFin);
      finDate.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && ebilletDate <= finDate;
    }

    return matchesSearch && matchesCompagnie && matchesStatut && matchesDate;
  });

  const openDetailModal = (ebillet) => {
    setSelectedEbillet(ebillet);
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

  const formatCurrency = (amount) => {
    if (!amount) return "0 FCFA";
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
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
      case "valide": return "bg-green-100 text-green-800 border-green-200";
      case "utilisé": return "bg-blue-100 text-blue-800 border-blue-200";
      case "annulé": return "bg-red-100 text-red-800 border-red-200";
      case "expiré": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case "valide": return <FaCheckCircle className="text-green-500" />;
      case "utilisé": return <FaCheckCircle className="text-blue-500" />;
      case "annulé": return <FaTimesCircle className="text-red-500" />;
      case "expiré": return <FaClock className="text-orange-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const getPaymentStatusColor = (statut) => {
    switch (statut?.toLowerCase()) {
      case 'réussi':
      case 'payé':
        return 'text-green-600';
      case 'en attente':
        return 'text-orange-600';
      case 'échoué':
      case 'annulé':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Calcul des statistiques
  const stats = {
    total: ebillets.length,
    valides: ebillets.filter(e => e.statut === "valide").length,
    utilises: ebillets.filter(e => e.statut === "utilisé").length,
    annules: ebillets.filter(e => e.statut === "annulé").length,
    expires: ebillets.filter(e => e.statut === "expiré").length,
    revenueTotal: ebillets.reduce((sum, e) => sum + parseFloat(e.prix_total || 0), 0),
    nouveauxCeMois: ebillets.filter(e => {
      if (!e.createdAt) return false;
      const created = new Date(e.createdAt);
      const now = new Date();
      return (now - created) < 30 * 24 * 60 * 60 * 1000;
    }).length,
    tauxUtilisation: ebillets.length > 0 
      ? ((ebillets.filter(e => e.statut === "utilisé").length / ebillets.length) * 100).toFixed(1)
      : 0
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const csvContent = [
        ["ID", "Code QR", "Statut", "Prix", "Passagers", "Client", "Compagnie", "Trajet", "Date Création", "Paiement", "Transaction"],
        ...filteredEbillets.map(e => [
          e.id,
          e.code_qr || 'N/A',
          e.statut || 'N/A',
          formatCurrency(e.prix_total),
          e.passagers?.length || 0,
          `${e.user?.prenom || ''} ${e.user?.nom || ''}`.trim() || 'N/A',
          e.trajet?.compagnie || 'N/A',
          `${e.trajet?.ville_depart || 'N/A'} → ${e.trajet?.ville_arrivee || 'N/A'}`,
          formatDateTime(e.createdAt),
          e.paiement?.mode || 'N/A',
          e.paiement?.transaction_ref || 'N/A'
        ])
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ebillets-superadmin-${new Date().toISOString().split('T')[0]}.csv`;
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

  const refreshData = () => {
    fetchInitialData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des e-billets...</p>
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
            Super Admin - Gestion des E-Billets
          </h1>
          <p className="text-gray-600 text-lg">
            Supervision complète de tous les e-billets de la plateforme
          </p>
        </div>

        {/* Alertes d'erreur */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <FaExclamationTriangle className="text-red-500 text-xl" />
              <div>
                <p className="text-red-800 font-medium">{error}</p>
                <button
                  onClick={refreshData}
                  className="text-red-600 hover:text-red-800 text-sm font-medium mt-1 flex items-center space-x-1"
                >
                  <FaSync className="text-sm" />
                  <span>Réessayer</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total E-Billets"
            value={stats.total}
            icon={<FaTicketAlt className="text-2xl" />}
            color="bg-purple-500"
            subtitle={`${stats.nouveauxCeMois} nouveaux ce mois`}
          />
          <StatCard
            title="Billets Valides"
            value={stats.valides}
            icon={<FaCheckCircle className="text-2xl" />}
            color="bg-green-500"
            subtitle="Prêts à être utilisés"
          />
          <StatCard
            title="Revenue Total"
            value={formatCurrency(stats.revenueTotal)}
            icon={<FaMoneyBillWave className="text-2xl" />}
            color="bg-blue-500"
            subtitle="Généré par les billets"
          />
          <StatCard
            title="Taux d'Utilisation"
            value={`${stats.tauxUtilisation}%`}
            icon={<FaChartBar className="text-2xl" />}
            color="bg-orange-500"
            subtitle={`${stats.utilises} utilisés`}
          />
        </div>

        {/* Barre d'actions et filtres */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par code QR, client, trajet ou référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshData}
                className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 font-semibold"
              >
                <FaSync />
                <span>Actualiser</span>
              </button>
              <button
                onClick={handleExport}
                disabled={exportLoading || filteredEbillets.length === 0}
                className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition flex items-center space-x-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaDownload />
                <span>{exportLoading ? "Export..." : `Exporter (${filteredEbillets.length})`}</span>
              </button>
            </div>
          </div>

          {/* Filtres avancés */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Compagnie</label>
              <select
                value={filters.compagnie}
                onChange={(e) => setFilters({ ...filters, compagnie: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              >
                <option value="">Toutes les compagnies</option>
                {compagnies.map(compagnie => (
                  <option key={compagnie.id} value={compagnie.nom}>
                    {compagnie.nom}
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
                <option value="valide">Valide</option>
                <option value="utilisé">Utilisé</option>
                <option value="annulé">Annulé</option>
                <option value="expiré">Expiré</option>
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
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
              {filteredEbillets.length} e-billets trouvés sur {ebillets.length} total
            </span>
            <button
              onClick={() => setFilters({ compagnie: "", statut: "", dateDebut: "", dateFin: "" })}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium flex items-center space-x-2"
            >
              <FaFilter />
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>

        {/* Liste des e-billets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEbillets.map((ebillet) => (
            <div key={ebillet.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-200">
              {/* Header avec statut */}
              <div className={`p-4 ${
                ebillet.statut === "valide" ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                ebillet.statut === "utilisé" ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                ebillet.statut === "annulé" ? 'bg-gradient-to-r from-red-500 to-pink-600' :
                'bg-gradient-to-r from-orange-500 to-amber-600'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <FaTicketAlt className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">E-Billet #{ebillet.id}</h3>
                      <p className="text-white/80 text-sm">{ebillet.trajet?.compagnie || 'Compagnie inconnue'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 text-white">
                      {getStatutIcon(ebillet.statut)}
                      <span className="text-sm font-medium capitalize">{ebillet.statut || 'inconnu'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Code QR */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FaQrcode className="text-purple-500" />
                    <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {ebillet.code_qr || 'Code non disponible'}
                    </span>
                  </div>
                </div>

                {/* Itinéraire */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <FaMapMarkerAlt className="text-red-500 mx-auto mb-1" />
                    <p className="font-semibold text-gray-800 text-sm">
                      {ebillet.trajet?.ville_depart || 'N/A'}
                    </p>
                  </div>
                  <div className="flex-1 mx-4 relative">
                    <div className="h-px bg-gradient-to-r from-red-400 to-blue-400"></div>
                    <FaBus className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  </div>
                  <div className="text-center">
                    <FaMapMarkerAlt className="text-blue-500 mx-auto mb-1" />
                    <p className="font-semibold text-gray-800 text-sm">
                      {ebillet.trajet?.ville_arrivee || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Date et heure */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-purple-500" />
                    <span>
                      {ebillet.trajet?.date_depart ? formatDate(ebillet.trajet.date_depart) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaClock className="text-green-500" />
                    <span>{ebillet.trajet?.heure_depart || 'N/A'}</span>
                  </div>
                </div>

                {/* Prix et passagers */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mb-4">
                  <div className="flex items-center space-x-2">
                    <FaMoneyBillWave className="text-green-600" />
                    <span className="font-semibold text-gray-700">Prix</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(ebillet.prix_total)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <FaUsers className="text-blue-500" />
                    <span>Passagers</span>
                  </div>
                  <span className="font-semibold">{ebillet.passagers?.length || 0}</span>
                </div>

                {/* Informations client */}
                <div className="border-t border-gray-200 pt-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-blue-600 text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">
                        {ebillet.user?.prenom || 'Prénom'} {ebillet.user?.nom || 'Nom'}
                      </p>
                      <p className="text-xs text-gray-500">{ebillet.user?.telephone || 'Téléphone non disponible'}</p>
                    </div>
                  </div>
                </div>

                {/* Paiement */}
                {ebillet.paiement && (
                  <div className="border-t border-gray-200 pt-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <FaCreditCard className="text-indigo-500" />
                        <span className="text-gray-600">Paiement</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">{ebillet.paiement.mode}</p>
                        <p className={`text-xs font-semibold ${getPaymentStatusColor(ebillet.paiement.statut)}`}>
                          {ebillet.paiement.statut}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => openDetailModal(ebillet)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition"
                  >
                    <FaEye />
                    <span className="text-sm">Détails</span>
                  </button>
                  <div className="text-xs text-gray-500">
                    Créé le {ebillet.createdAt ? formatDate(ebillet.createdAt) : 'Date inconnue'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEbillets.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <FaTicketAlt className="text-gray-400 text-4xl mx-auto mb-4" />
            <h3 className="text-gray-600 text-lg font-medium">Aucun e-billet trouvé</h3>
            <p className="text-gray-500">
              {searchTerm || Object.values(filters).some(f => f) 
                ? "Essayez de modifier vos critères de recherche" 
                : "Aucun e-billet enregistré dans le système"
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal Détails */}
      {showDetailModal && selectedEbillet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Détails de l'E-Billet</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* En-tête */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">E-Billet #{selectedEbillet.id}</h3>
                    <p className="text-gray-600">Code: {selectedEbillet.code_qr || 'Non disponible'}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 justify-end">
                      {getStatutIcon(selectedEbillet.statut)}
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatutColor(selectedEbillet.statut)}`}>
                        {selectedEbillet.statut || 'inconnu'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      {formatCurrency(selectedEbillet.prix_total)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          <p className="font-bold text-gray-800">{selectedEbillet.trajet?.ville_depart || 'N/A'}</p>
                          <p className="text-sm text-gray-600">Départ</p>
                        </div>
                        <div className="flex-1 mx-4 text-center relative">
                          <div className="h-1 bg-gradient-to-r from-red-400 to-blue-400 rounded-full"></div>
                          <FaBus className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-500" />
                        </div>
                        <div className="text-center">
                          <FaMapMarkerAlt className="text-blue-500 text-xl mx-auto mb-2" />
                          <p className="font-bold text-gray-800">{selectedEbillet.trajet?.ville_arrivee || 'N/A'}</p>
                          <p className="text-sm text-gray-600">Arrivée</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Compagnie:</span>
                          <p className="font-semibold">{selectedEbillet.trajet?.compagnie || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Compagnie ID:</span>
                          <p className="font-semibold">{selectedEbillet.trajet?.compagnie_id || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Date départ:</span>
                          <p className="font-semibold">
                            {selectedEbillet.trajet?.date_depart ? 
                              formatDate(selectedEbillet.trajet.date_depart) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Heure:</span>
                          <p className="font-semibold">{selectedEbillet.trajet?.heure_depart || 'N/A'}</p>
                        </div>
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
                          {selectedEbillet.user?.prenom || 'Prénom'} {selectedEbillet.user?.nom || 'Nom'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Téléphone:</span>
                        <span className="font-semibold">{selectedEbillet.user?.telephone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-semibold">{selectedEbillet.user?.email || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Passagers */}
                    <div className="mt-4">
                      <h5 className="font-semibold text-gray-800 mb-2">
                        Passagers ({selectedEbillet.passagers?.length || 0})
                      </h5>
                      <div className="space-y-2">
                        {selectedEbillet.passagers?.map((passager, index) => (
                          <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                            <span>{passager.prenom || 'Prénom'} {passager.nom || 'Nom'}</span>
                            <span className="text-gray-500">Âge: {passager.age || 'N/A'}</span>
                          </div>
                        ))}
                        {(selectedEbillet.passagers?.length === 0) && (
                          <p className="text-gray-500 text-sm">Aucun passager enregistré</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations paiement */}
                {selectedEbillet.paiement && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                      <FaCreditCard />
                      <span>Informations Paiement</span>
                    </h4>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-gray-600">Montant</p>
                          <p className="font-bold text-green-600 text-lg">
                            {formatCurrency(selectedEbillet.paiement.montant)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Mode</p>
                          <p className="font-semibold">{selectedEbillet.paiement.mode}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Statut</p>
                          <p className={`font-semibold ${getPaymentStatusColor(selectedEbillet.paiement.statut)}`}>
                            {selectedEbillet.paiement.statut}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Transaction</p>
                          <p className="font-mono text-sm">{selectedEbillet.paiement.transaction_ref}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Métadonnées */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de création</label>
                    <p className="text-gray-800">{formatDateTime(selectedEbillet.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dernière mise à jour</label>
                    <p className="text-gray-800">{formatDateTime(selectedEbillet.updatedAt)}</p>
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

export default SuperAdminEbillets;