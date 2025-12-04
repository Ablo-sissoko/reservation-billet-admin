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
  FaEye
} from "react-icons/fa";

import api from "../services/api";

const AvisCompagnie = () => {
  const [avis, setAvis] = useState([]);
  const [stats, setStats] = useState({
    moyenne: 0,
    total_avis: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAvis, setSelectedAvis] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const compagnieId = localStorage.getItem("compagnie_id");
  
  // ✅ Utiliser l'instance api configurée qui gère automatiquement les tokens
  const axiosAuth = api;

  useEffect(() => {
    fetchAvis();
  }, []);

  const fetchAvis = async () => {
    try {
      setLoading(true);
      const response = await axiosAuth.get(`/avis/compagnie/${compagnieId}`);
      const data = response.data;
      
      setAvis(data.avis);
      setStats({
        moyenne: data.moyenne,
        total_avis: data.total_avis,
        distribution: calculateDistribution(data.avis)
      });
    } catch (error) {
      console.error("Erreur chargement avis:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistribution = (avisList) => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    avisList.forEach(avis => {
      distribution[avis.note]++;
    });
    return distribution;
  };

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

  const filteredAvis = avis.filter(avisItem => {
    // Filtre par note
    if (filter !== "all" && avisItem.note !== parseInt(filter)) {
      return false;
    }
    
    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const userNom = avisItem.User?.nom?.toLowerCase() || "";
      const userPrenom = avisItem.User?.prenom?.toLowerCase() || "";
      const commentaire = avisItem.commentaire?.toLowerCase() || "";
      
      return userNom.includes(searchLower) || 
             userPrenom.includes(searchLower) || 
             commentaire.includes(searchLower);
    }
    
    return true;
  });

  const handleDeleteClick = (avisItem) => {
    setSelectedAvis(avisItem);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosAuth.delete(`/avis/${selectedAvis.id}`);
      setAvis(avis.filter(a => a.id !== selectedAvis.id));
      setShowDeleteModal(false);
      setSelectedAvis(null);
      
      // Recalculer les stats
      const newAvis = avis.filter(a => a.id !== selectedAvis.id);
      setStats(prev => ({
        ...prev,
        total_avis: prev.total_avis - 1,
        distribution: calculateDistribution(newAvis)
      }));
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

  // Statistiques pour les cartes
  const statCards = [
    {
      title: "Note Moyenne",
      value: stats.moyenne,
      icon: <FaStar className="text-2xl" />,
      color: "bg-yellow-500",
      subtitle: "Sur 5 étoiles"
    },
    {
      title: "Total Avis",
      value: stats.total_avis,
      icon: <FaComments className="text-2xl" />,
      color: "bg-blue-500",
      subtitle: "Avis clients"
    },
    {
      title: "Avis Positifs",
      value: stats.distribution[5] + stats.distribution[4],
      icon: <FaRegSmileBeam className="text-2xl" />,
      color: "bg-green-500",
      subtitle: "4-5 étoiles"
    },
    {
      title: "Satisfaction",
      value: stats.total_avis > 0 ? `${((stats.distribution[5] + stats.distribution[4]) / stats.total_avis * 100).toFixed(1)}%` : "0%",
      icon: <FaChartLine className="text-2xl" />,
      color: "bg-purple-500",
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des avis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-lg mb-4">
            <FaStar className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Avis des Clients
          </h1>
          <p className="text-gray-600">
            Découvrez ce que vos clients pensent de vos services
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
                  <FaChartLine className="mr-2 text-blue-600" />
                  Répartition des notes
                </h3>
                {[5, 4, 3, 2, 1].map(note => (
                  <DistributionBar
                    key={note}
                    note={note}
                    count={stats.distribution[note]}
                    total={stats.total_avis}
                  />
                ))}
              </div>

              {/* Filtres rapides */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <FaFilter className="mr-2 text-blue-600" />
                  Filtrer par note
                </h3>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "Tous les avis", count: stats.total_avis },
                    { value: "5", label: "⭐ 5 étoiles", count: stats.distribution[5] },
                    { value: "4", label: "⭐ 4 étoiles", count: stats.distribution[4] },
                    { value: "3", label: "⭐ 3 étoiles", count: stats.distribution[3] },
                    { value: "2", label: "⭐ 2 étoiles", count: stats.distribution[2] },
                    { value: "1", label: "⭐ 1 étoile", count: stats.distribution[1] }
                  ].map(filterOption => (
                    <button
                      key={filterOption.value}
                      onClick={() => setFilter(filterOption.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                        filter === filterOption.value
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{filterOption.label}</span>
                        <span className="bg-white px-2 py-1 rounded-full text-xs font-medium">
                          {filterOption.count}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Liste des avis */}
          <div className="lg:col-span-3">
            {/* Barre de recherche */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans les avis par nom ou commentaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Liste des avis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAvis.length === 0 ? (
                <div className="col-span-2 bg-white rounded-2xl shadow-lg p-12 text-center">
                  <FaExclamationTriangle className="text-gray-400 text-4xl mx-auto mb-4" />
                  <h3 className="text-gray-600 text-lg font-medium mb-2">
                    {searchTerm || filter !== "all" ? "Aucun avis trouvé" : "Aucun avis pour le moment"}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || filter !== "all" 
                      ? "Essayez de modifier vos critères de recherche" 
                      : "Les avis de vos clients apparaîtront ici"}
                  </p>
                </div>
              ) : (
                filteredAvis.map((avisItem) => (
                  <div
                    key={avisItem.id}
                    className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${getBgColorForNote(avisItem.note)}`}
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <FaUser className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold">
                              {avisItem.User?.prenom} {avisItem.User?.nom}
                            </h3>
                            <p className="text-white/80 text-sm">
                              {formatDate(avisItem.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-white text-2xl">
                          {getEmojiForNote(avisItem.note)}
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
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition"
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

            {/* Pagination/Info résultats */}
            {filteredAvis.length > 0 && (
              <div className="mt-6 text-center">
                <p className="text-gray-600 bg-white rounded-2xl shadow-lg p-4">
                  Affichage de <strong>{filteredAvis.length}</strong> avis sur <strong>{stats.total_avis}</strong> au total
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Détails */}
      {showDetailModal && selectedAvis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Détails de l'Avis</h2>
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
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                    <FaStar className="text-white text-3xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {selectedAvis.User?.prenom} {selectedAvis.User?.nom}
                    </h3>
                    <p className="text-gray-600">{formatDate(selectedAvis.createdAt)}</p>
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

export default AvisCompagnie;