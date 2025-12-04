import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaQrcode,
  FaUser,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaBus,
  FaPhone,
  FaTicketAlt,
  FaUsers,
  FaSearch,
  FaFilter,
  FaEye,
  FaChartLine,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from "react-icons/fa";

import api from "../services/api";

const EbilletsCompagnie = () => {
  const [ebillets, setEbillets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    statut: "",
    date: ""
  });
  const [selectedEbillet, setSelectedEbillet] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const fetchEbillets = async () => {
      try {
        const compagnieId = localStorage.getItem("compagnie_id");

        if (!compagnieId) {
          setError("Aucune compagnie connectée.");
          setLoading(false);
          return;
        }

        const response = await api.get(`/ebills/compagnie/${compagnieId}`);

        let billets = response.data.ebillets || [];

        // 🔹 Parser les passagers (string JSON → tableau)
        billets = billets.map((b) => ({
          ...b,
          passagers: (() => {
            try {
              return typeof b.passagers === "string"
                ? JSON.parse(b.passagers)
                : b.passagers || [];
            } catch {
              return [];
            }
          })(),
        }));

        setEbillets(billets);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Erreur lors du chargement des e-billets"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEbillets();
  }, []);

  const getStatusColor = (statut) => {
    switch (statut) {
      case "valide":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "utilisé":
        return "bg-orange-100 text-blue-800 border-blue-200";
      case "annulé":
        return "bg-red-100 text-red-800 border-red-200";
      case "expiré":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case "valide":
        return <FaCheckCircle className="text-emerald-500" />;
      case "utilisé":
        return <FaCheckCircle className="text-blue-500" />;
      case "annulé":
        return <FaTimesCircle className="text-red-500" />;
      case "expiré":
        return <FaClock className="text-orange-500" />;
      default:
        return <FaTicketAlt className="text-gray-500" />;
    }
  };

  const getPaymentStatusColor = (statut) => {
    switch (statut?.toLowerCase()) {
      case "réussi":
      case "payé":
        return "text-emerald-600";
      case "en attente":
        return "text-orange-600";
      case "échoué":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredEbillets = ebillets.filter(ebillet => {
    const matchesSearch = 
      ebillet.code_qr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ebillet.user?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ebillet.user?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ebillet.trajet?.ville_depart?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ebillet.trajet?.ville_arrivee?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatut = !filters.statut || ebillet.statut === filters.statut;
    const matchesDate = !filters.date || 
      (ebillet.trajet?.date_depart && ebillet.trajet.date_depart.startsWith(filters.date));

    return matchesSearch && matchesStatut && matchesDate;
  });

  // Calcul des statistiques
  const stats = {
    total: ebillets.length,
    valides: ebillets.filter(b => b.statut === "valide").length,
    utilises: ebillets.filter(b => b.statut === "utilisé").length,
    annules: ebillets.filter(b => b.statut === "annulé").length,
    revenuTotal: ebillets.reduce((sum, b) => sum + (b.prix_total || 0), 0),
    tauxUtilisation: ebillets.length > 0 
      ? ((ebillets.filter(b => b.statut === "utilisé").length / ebillets.length) * 100).toFixed(1)
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

  const openDetailModal = (ebillet) => {
    setSelectedEbillet(ebillet);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des e-billets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur</h2>
          <p className="text-gray-600">{error}</p>
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
            <FaTicketAlt className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            E-billets de la Compagnie
          </h1>
          <p className="text-gray-600">
            Gestion et suivi des billets électroniques
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Billets"
            value={stats.total}
            icon={<FaTicketAlt className="text-2xl" />}
            color="bg-blue-500"
            subtitle="Tous les e-billets"
          />
          <StatCard
            title="Billets Valides"
            value={stats.valides}
            icon={<FaCheckCircle className="text-2xl" />}
            color="bg-green-500"
            subtitle="Billets actifs"
          />
          <StatCard
            title="Revenu Total"
            value={`${stats.revenuTotal.toLocaleString()} FCFA`}
            icon={<FaMoneyBillWave className="text-2xl" />}
            color="bg-purple-500"
            subtitle="Chiffre d'affaires"
          />
          <StatCard
            title="Taux d'Utilisation"
            value={`${stats.tauxUtilisation}%`}
            icon={<FaChartLine className="text-2xl" />}
            color="bg-orange-500"
            subtitle="Billets utilisés"
          />
        </div>

        {/* Barre d'actions et filtres */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un e-billet par code QR, passager ou ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Filtres avancés */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Tous les statuts</option>
                <option value="valide">Valide</option>
                <option value="utilisé">Utilisé</option>
                <option value="annulé">Annulé</option>
                <option value="expiré">Expiré</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de trajet</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ statut: "", date: "" })}
                className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des e-billets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEbillets.map((ebillet) => (
            <div key={ebillet.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <FaTicketAlt className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">E-Billet #{ebillet.code_qr}</h3>
                      <p className="text-white/80 text-sm">
                        {ebillet.passagers?.length || 0} passager{ebillet.passagers?.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-white text-xl">
                    {getStatusIcon(ebillet.statut)}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Itinéraire */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <FaMapMarkerAlt className="text-green-500 text-xl mb-1" />
                    <p className="font-semibold text-gray-800 text-sm">{ebillet.trajet?.ville_depart}</p>
                    <p className="text-sm text-gray-500">Départ</p>
                  </div>
                  <div className="flex-1 mx-4 relative">
                    <div className="h-0.5 bg-gray-300"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <FaBus className="text-blue-500" />
                    </div>
                  </div>
                  <div className="text-center">
                    <FaMapMarkerAlt className="text-red-500 text-xl mb-1" />
                    <p className="font-semibold text-gray-800 text-sm">{ebillet.trajet?.ville_arrivee}</p>
                    <p className="text-sm text-gray-500">Arrivée</p>
                  </div>
                </div>

                {/* Date/Heure */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 text-lg font-bold text-blue-600">
                      <FaCalendarAlt className="text-blue-500" />
                      <span className="text-sm">
                        {ebillet.trajet?.date_depart ? 
                          new Date(ebillet.trajet.date_depart).toLocaleDateString('fr-FR') : 'N/A'
                        }
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Date</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 text-lg font-bold text-green-600">
                      <FaClock className="text-green-500" />
                      <span className="text-sm">{ebillet.trajet?.heure_depart}</span>
                    </div>
                    <p className="text-sm text-gray-500">Heure</p>
                  </div>
                </div>

                {/* Prix et statut */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{ebillet.prix_total?.toLocaleString()} FCFA</div>
                    <p className="text-sm text-gray-500">Prix total</p>
                  </div>
                  <div className="text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ebillet.statut)}`}>
                      {ebillet.statut}
                    </span>
                  </div>
                </div>

                {/* Informations passager */}
                {ebillet.user && (
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <FaUser className="text-white text-xs" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">
                          {ebillet.user.prenom} {ebillet.user.nom}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <FaPhone className="text-gray-400" />
                          <span>{ebillet.user.telephone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Paiement */}
                {ebillet.paiement && (
                  <div className="border-t border-gray-200 pt-4 mb-4">
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
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => openDetailModal(ebillet)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition"
                  >
                    <FaEye />
                    <span className="text-sm">Détails</span>
                  </button>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <FaQrcode />
                    <span>{ebillet.code_qr}</span>
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
                : "Aucun e-billet généré pour le moment"
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal Détails */}
      {showDetailModal && selectedEbillet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Détails de l'E-Billet</h2>
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
                    <FaTicketAlt className="text-white text-3xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">E-Billet #{selectedEbillet.code_qr}</h3>
                    <p className="text-gray-600">Code QR unique</p>
                  </div>
                </div>

                {/* Itinéraire */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <FaMapMarkerAlt className="text-green-500 text-2xl mb-2" />
                      <p className="font-bold text-gray-800">{selectedEbillet.trajet?.ville_depart}</p>
                      <p className="text-sm text-gray-500">Départ</p>
                    </div>
                    <div className="flex-1 mx-4 relative">
                      <div className="h-0.5 bg-gray-400"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <FaBus className="text-blue-500 text-xl" />
                      </div>
                    </div>
                    <div className="text-center">
                      <FaMapMarkerAlt className="text-red-500 text-2xl mb-2" />
                      <p className="font-bold text-gray-800">{selectedEbillet.trajet?.ville_arrivee}</p>
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
                          {selectedEbillet.trajet?.date_depart ? 
                            new Date(selectedEbillet.trajet.date_depart).toLocaleDateString('fr-FR') : 'N/A'
                          } à {selectedEbillet.trajet?.heure_depart}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix total</label>
                      <div className="flex items-center space-x-2">
                        <FaMoneyBillWave className="text-green-500" />
                        <span className="font-semibold text-xl">{selectedEbillet.prix_total?.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedEbillet.statut)}
                        <span className="font-semibold capitalize">{selectedEbillet.statut}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Passagers</label>
                      <div className="flex items-center space-x-2">
                        <FaUsers className="text-orange-500" />
                        <span className="font-semibold">{selectedEbillet.passagers?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Liste des passagers */}
                {selectedEbillet.passagers?.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Détails des passagers</h4>
                    <div className="space-y-2">
                      {selectedEbillet.passagers.map((passager, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-800">
                              {passager.prenom} {passager.nom}
                            </p>
                            <p className="text-sm text-gray-600">Âge: {passager.age} ans</p>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Passager {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Informations utilisateur */}
                {selectedEbillet.user && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Client</h4>
                    <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <FaUser className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {selectedEbillet.user.prenom} {selectedEbillet.user.nom}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <FaPhone className="text-gray-400" />
                            <span>{selectedEbillet.user.telephone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Informations paiement */}
                {selectedEbillet.paiement && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Paiement</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Mode de paiement</p>
                          <p className="font-semibold">{selectedEbillet.paiement.mode}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Statut</p>
                          <p className={`font-semibold ${getPaymentStatusColor(selectedEbillet.paiement.statut)}`}>
                            {selectedEbillet.paiement.statut}
                          </p>
                        </div>
                        {selectedEbillet.paiement.transaction_ref && (
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600">Référence transaction</p>
                            <p className="font-mono text-sm">{selectedEbillet.paiement.transaction_ref}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EbilletsCompagnie;