import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaStar,
  FaUser,
  FaCalendarAlt,
  FaTrash,
  FaExclamationTriangle,
  FaFilter,
  FaSearch,
  FaRegSmileBeam,
  FaRegSadTear,
  FaRegMeh,
  FaChartLine,
  FaUsers,
  FaComments,
  FaEye,
  FaBuilding,
  FaTimes,
  FaDownload
} from "react-icons/fa";

import api from "../services/api";

const AvisSuperAdmin = () => {
  const [avis, setAvis] = useState([]);
  const [compagnies, setCompagnies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    compagnie: "",
    note: "all",
    search: ""
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAvis, setSelectedAvis] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);


  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
     
      
      // Récupérer tous les avis
      const avisRes = await api.get("/avis");
      setAvis(avisRes.data.avis);

      // Extraire les compagnies uniques des avis
      const compagniesUniques = [...new Map(
        avisRes.data.avis
          .map(avisItem => avisItem.Compagnie)
          .filter(Boolean)
          .map(compagnie => [compagnie.id, compagnie])
      ).values()];
      
      setCompagnies(compagniesUniques);

    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calcul des statistiques globales
  const stats = {
    total: avis.length,
    moyenne: avis.length > 0 ? (avis.reduce((sum, a) => sum + a.note, 0) / avis.length).toFixed(1) : 0,
    distribution: calculateDistribution(avis),
    compagniesCount: compagnies.length
  };

  function calculateDistribution(avisList) {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    avisList.forEach(avis => {
      distribution[avis.note]++;
    });
    return distribution;
  }

  const filteredAvis = avis.filter(avisItem => {
    // Filtre par compagnie
    if (filters.compagnie && avisItem.compagnie_id !== parseInt(filters.compagnie)) {
      return false;
    }
    
    // Filtre par note
    if (filters.note !== "all" && avisItem.note !== parseInt(filters.note)) {
      return false;
    }
    
    // Filtre par recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const userNom = avisItem.User?.nom?.toLowerCase() || "";
      const userPrenom = avisItem.User?.prenom?.toLowerCase() || "";
      const commentaire = avisItem.commentaire?.toLowerCase() || "";
      const compagnieNom = avisItem.Compagnie?.nom?.toLowerCase() || "";
      
      return userNom.includes(searchLower) || 
             userPrenom.includes(searchLower) || 
             commentaire.includes(searchLower) ||
             compagnieNom.includes(searchLower);
    }
    
    return true;
  });

  const getEmojiForNote = (note) => {
    if (note >= 4) return <FaRegSmileBeam className="text-green-500 text-xl" />;
    if (note >= 3) return <FaRegMeh className="text-yellow-500 text-xl" />;
    return <FaRegSadTear className="text-red-500 text-xl" />;
  };

  const getTextColorForNote = (note) => {
    if (note >= 4) return "text-green-600";
    if (note >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getBgColorForNote = (note) => {
    if (note >= 4) return "bg-green-50 border-green-200";
    if (note >= 3) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const handleDeleteClick = (avisItem) => {
    setSelectedAvis(avisItem);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      
      await api.delete(`/avis/${selectedAvis.id}`);
      setAvis(avis.filter(a => a.id !== selectedAvis.id));
      setShowDeleteModal(false);
      setSelectedAvis(null);
    } catch (error) {
      console.error("Erreur suppression avis:", error);
    }
  };

  const openDetailModal = (avisItem) => {
    setSelectedAvis(avisItem);
    setShowDetailModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StarRating = ({ note, size = "text-lg" }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`${size} ${
              star <= note ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const DistributionBar = ({ note, count, total }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <div className="flex items-center space-x-3 mb-2">
        <div className="flex items-center space-x-1 w-8">
          <span className="text-sm font-medium text-gray-600">{note}</span>
          <FaStar className="text-yellow-400 text-xs" />
        </div>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-sm text-gray-500 w-12 text-right">
          {count} ({percentage.toFixed(0)}%)
        </span>
      </div>
    );
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const csvContent = [
        ["ID", "Client", "Compagnie", "Note", "Commentaire", "Date"],
        ...filteredAvis.map(avis => [
          avis.id,
          `${avis.User?.prenom} ${avis.User?.nom}`,
          avis.Compagnie?.nom,
          avis.note,
          `"${avis.commentaire || ''}"`,
          formatDate(avis.createdAt)
        ])
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `avis-${new Date().toISOString().split('T')[0]}.csv`;
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

  // Statistiques pour les cartes
  const statCards = [
    {
      title: "Total Avis",
      value: stats.total,
      icon: <FaComments className="text-2xl" />,
      color: "bg-blue-500",
      subtitle: "Avis totaux"
    },
    {
      title: "Note Moyenne",
      value: stats.moyenne,
      icon: <FaStar className="text-2xl" />,
      color: "bg-yellow-500",
      subtitle: "Sur 5 étoiles"
    },
    {
      title: "Compagnies",
      value: stats.compagniesCount,
      icon: <FaBuilding className="text-2xl" />,
      color: "bg-purple-500",
      subtitle: "Compagnies évaluées"
    },
    {
      title: "Satisfaction",
      value: stats.total > 0 ? `${((stats.distribution[5] + stats.distribution[4]) / stats.total * 100).toFixed(1)}%` : "0%",
      icon: <FaChartLine className="text-2xl" />,
      color: "bg-green-500",
      subtitle: "Taux de satisfaction"
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des avis...</p>
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
            <FaStar className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Gestion des Avis
          </h1>
          <p className="text-gray-600">
            Supervisez tous les avis clients de la plateforme
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
          {/* Sidebar - Filtres et distribution */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              {/* Distribution des notes */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <FaChartLine className="mr-2 text-purple-600" />
                  Répartition des notes
                </h3>
                {[5, 4, 3, 2, 1].map(note => (
                  <DistributionBar
                    key={note}
                    note={note}
                    count={stats.distribution[note]}
                    total={stats.total}
                  />
                ))}
              </div>

              {/* Filtres */}
              <div className="space-y-4">
                {/* Filtre par compagnie */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <FaBuilding className="mr-2 text-purple-600" />
                    Compagnie
                  </h3>
                  <select
                    value={filters.compagnie}
                    onChange={(e) => setFilters({ ...filters, compagnie: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  >
                    <option value="">Toutes les compagnies</option>
                    {compagnies.map(compagnie => (
                      <option key={compagnie.id} value={compagnie.id}>
                        {compagnie.nom}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtre par note */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <FaFilter className="mr-2 text-purple-600" />
                    Note
                  </h3>
                  <select
                    value={filters.note}
                    onChange={(e) => setFilters({ ...filters, note: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  >
                    <option value="all">Toutes les notes</option>
                    <option value="5">⭐ 5 étoiles</option>
                    <option value="4">⭐ 4 étoiles</option>
                    <option value="3">⭐ 3 étoiles</option>
                    <option value="2">⭐ 2 étoiles</option>
                    <option value="1">⭐ 1 étoile</option>
                  </select>
                </div>

                {/* Bouton réinitialiser */}
                <button
                  onClick={() => setFilters({ compagnie: "", note: "all", search: "" })}
                  className="w-full bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition font-medium flex items-center justify-center space-x-2"
                >
                  <FaTimes />
                  <span>Réinitialiser</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content - Liste des avis */}
          <div className="lg:col-span-3">
            {/* Barre d'actions et recherche */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par client, compagnie ou commentaire..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  />
                </div>
                <button
                  onClick={handleExport}
                  disabled={exportLoading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center space-x-2 font-semibold disabled:opacity-50"
                >
                  <FaDownload />
                  <span>{exportLoading ? "Export..." : "Exporter CSV"}</span>
                </button>
              </div>
            </div>

            {/* Liste des avis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAvis.length === 0 ? (
                <div className="col-span-2 bg-white rounded-2xl shadow-lg p-12 text-center">
                  <FaExclamationTriangle className="text-gray-400 text-4xl mx-auto mb-4" />
                  <h3 className="text-gray-600 text-lg font-medium mb-2">
                    {filters.search || filters.compagnie || filters.note !== "all" 
                      ? "Aucun avis trouvé" 
                      : "Aucun avis sur la plateforme"}
                  </h3>
                  <p className="text-gray-500">
                    {filters.search || filters.compagnie || filters.note !== "all" 
                      ? "Essayez de modifier vos critères de recherche" 
                      : "Les avis des clients apparaîtront ici"}
                  </p>
                </div>
              ) : (
                filteredAvis.map((avisItem) => (
                  <div
                    key={avisItem.id}
                    className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${getBgColorForNote(avisItem.note)}`}
                  >
                    {/* Header avec compagnie */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <FaBuilding className="text-white/80 text-sm" />
                          <span className="text-white/90 text-sm font-medium">
                            {avisItem.Compagnie?.nom}
                          </span>
                        </div>
                        <div className="text-white text-2xl">
                          {getEmojiForNote(avisItem.note)}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <FaUser className="text-white text-sm" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-sm">
                            {avisItem.User?.prenom} {avisItem.User?.nom}
                          </h3>
                          <p className="text-white/80 text-xs">
                            {formatDate(avisItem.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Note en étoiles */}
                      <div className="flex items-center justify-between mb-4">
                        <StarRating note={avisItem.note} />
                        <span className={`text-xl font-bold ${getTextColorForNote(avisItem.note)}`}>
                          {avisItem.note}/5
                        </span>
                      </div>

                      {/* Commentaire */}
                      {avisItem.commentaire && (
                        <div className="mb-4">
                          <p className="text-gray-700 leading-relaxed line-clamp-3">
                            "{avisItem.commentaire}"
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <button
                          onClick={() => openDetailModal(avisItem)}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition font-medium"
                        >
                          <FaEye />
                          <span className="text-sm">Détails</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(avisItem)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer cet avis"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Info résultats */}
            {filteredAvis.length > 0 && (
              <div className="mt-6 text-center">
                <p className="text-gray-600 bg-white rounded-2xl shadow-lg p-4">
                  Affichage de <strong>{filteredAvis.length}</strong> avis sur <strong>{stats.total}</strong> au total
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Détails */}
      {showDetailModal && selectedAvis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Détails de l'Avis</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-6">
                {/* En-tête */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <FaStar className="text-white text-3xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {selectedAvis.User?.prenom} {selectedAvis.User?.nom}
                    </h3>
                    <p className="text-gray-600">{formatDate(selectedAvis.createdAt)}</p>
                  </div>
                </div>

                {/* Compagnie */}
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <FaBuilding className="text-purple-600 text-xl" />
                    <div>
                      <p className="text-sm font-medium text-purple-700">Compagnie</p>
                      <p className="font-semibold text-gray-800">{selectedAvis.Compagnie?.nom}</p>
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Note attribuée</p>
                      <StarRating note={selectedAvis.note} size="text-2xl" />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 text-3xl font-bold">
                        {getEmojiForNote(selectedAvis.note)}
                        <span className={getTextColorForNote(selectedAvis.note)}>
                          {selectedAvis.note}/5
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Commentaire */}
                {selectedAvis.commentaire && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Commentaire</h4>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-gray-700 leading-relaxed text-lg italic">
                        "{selectedAvis.commentaire}"
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleDeleteClick(selectedAvis);
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center space-x-2"
                  >
                    <FaTrash />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Supprimer l'avis
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.
              </p>
              
              {selectedAvis && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {selectedAvis.User?.prenom} {selectedAvis.User?.nom}
                      </p>
                      <p className="text-sm text-gray-600">{selectedAvis.Compagnie?.nom}</p>
                      <StarRating note={selectedAvis.note} size="text-sm" />
                    </div>
                  </div>
                  {selectedAvis.commentaire && (
                    <p className="text-gray-600 text-sm mt-2">
                      "{selectedAvis.commentaire}"
                    </p>
                  )}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedAvis(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteConfirm}
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

export default AvisSuperAdmin;