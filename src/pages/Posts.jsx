import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  FaImage,
  FaPaperPlane,
  FaTimes,
  FaBuilding,
  FaSmile,
  FaHashtag,
  FaEdit,
  FaTrash,
  FaHeart,
  FaComment,
  FaEllipsisH,
  FaRegHeart,
  FaRegComment,
  FaPlus,
  FaSearch,
  FaFilter,
  FaChartLine,
  FaEye,
  FaUsers
} from "react-icons/fa";
import EmojiPicker from 'emoji-picker-react';

const API_BASE = "http://localhost:3000/api";

const GestionPostes = () => {
  // États pour la création
  const [form, setForm] = useState({
    titre: "",
    description: "",
    image: null
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // États pour la liste
  const [postes, setPostes] = useState([]);
  const [loadingPostes, setLoadingPostes] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [showActions, setShowActions] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const actionsRef = useRef(null);

  const compagnieId = localStorage.getItem("compagnie_id");
  const token = localStorage.getItem("token_compagnie");

  const axiosAuth = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  // Charger les posts au montage
  useEffect(() => {
    fetchPostes();
  }, []);

  // Fermer le menu d'actions en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      // On ne ferme pas si on clique sur un bouton d'action
      if (
        actionsRef.current &&
        !actionsRef.current.contains(event.target) &&
        !event.target.closest(".action-menu")
      ) {
        setShowActions(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPostes = async () => {
    try {
      const response = await axiosAuth.get("postes/compagnie/" + compagnieId );
      setPostes(response.data);
      

    } catch (error) {
      console.error("Erreur chargement posts:", error);
      setMessage("Erreur lors du chargement des posts");
    } finally {
      setLoadingPostes(false);
    }
  };

  // CRÉATION
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage("L'image ne doit pas dépasser 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        setMessage("Veuillez sélectionner une image valide");
        return;
      }
      setForm(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setForm(prev => ({ ...prev, image: null }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.description;
    const newText = text.substring(0, start) + emoji + text.substring(end);
    setForm(prev => ({ ...prev, description: newText }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!form.titre.trim() || !form.description.trim()) {
      setMessage("Le titre et la description sont obligatoires");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("compagnie_id", compagnieId);
      formData.append("titre", form.titre);
      formData.append("description", form.description);
      if (form.image) formData.append("image", form.image);

      await axiosAuth.post("/postes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Post créé avec succès! ✅");
      resetForm();
      fetchPostes();

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Erreur création post:", error);
      setMessage(error.response?.data?.message || "Erreur lors de la création du post");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ titre: "", description: "", image: null });
    setPreview(null);
    setEditingPost(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ACTIONS SUR LES POSTS
  const handleEdit = (poste) => {
    setEditingPost(poste.id);
    setForm({
      titre: poste.titre,
      description: poste.description,
      image: poste.image ? `${API_BASE.replace('/api', '')}/${poste.image}` : null
    });
    setPreview( poste.image ? `${API_BASE.replace('/api', '')}/${poste.image}` : null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("titre", form.titre);
      formData.append("description", form.description);
      if (form.image) formData.append("image", form.image);

      await axiosAuth.put(`/postes/${editingPost}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Post modifié avec succès! ✅");
      resetForm();
      fetchPostes();

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Erreur modification post:", error);
      setMessage(error.response?.data?.message || "Erreur lors de la modification du post");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce post ?")) return;

    try {
      await axiosAuth.delete(`/postes/${postId}`);
      setMessage("Post supprimé avec succès! ✅");
      setPostes(postes.filter(p => p.id !== postId));
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Erreur suppression post:", error);
      setMessage("Erreur lors de la suppression du post");
    }
  };

  const openDetailModal = (poste) => {
    setSelectedPost(poste);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrage des posts
  const filteredPostes = postes.filter(poste =>
    poste.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    poste.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistiques
  const stats = {
    total: postes.length,
    avecImages: postes.filter(p => p.image).length,
    totalLikes: postes.reduce((sum, p) => sum + (p.likes || 0), 0),
    totalCommentaires: postes.reduce((sum, p) => sum + (p.commentairesCount || 0), 0)
  };

  const characterCount = form.description.length;
  const maxCharacters = 1000;

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

  if (loadingPostes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des publications...</p>
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
            <FaPaperPlane className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Gestion des Publications
          </h1>
          <p className="text-gray-600">
            Partagez des actualités et communiquez avec vos clients
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Publications"
            value={stats.total}
            icon={<FaPaperPlane className="text-2xl" />}
            color="bg-blue-500"
            subtitle="Toutes vos publications"
          />
          <StatCard
            title="Publications avec Images"
            value={stats.avecImages}
            icon={<FaImage className="text-2xl" />}
            color="bg-green-500"
            subtitle="Contenu visuel"
          />
          <StatCard
            title="Total Likes"
            value={stats.totalLikes}
            icon={<FaHeart className="text-2xl" />}
            color="bg-purple-500"
            subtitle="Engagement total"
          />
          <StatCard
            title="Total Commentaires"
            value={stats.totalCommentaires}
            icon={<FaComment className="text-2xl" />}
            color="bg-orange-500"
            subtitle="Interactions clients"
          />
        </div>

        {/* Barre d'actions et filtres */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une publication..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 font-semibold"
            >
              <FaPlus />
              <span>Nouvelle Publication</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des publications */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">
                  Vos Publications ({filteredPostes.length})
                </h3>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {filteredPostes.length === 0 ? (
                  <div className="text-center py-12">
                    <FaPaperPlane className="text-gray-400 text-4xl mx-auto mb-4" />
                    <h3 className="text-gray-600 text-lg font-medium">Aucune publication trouvée</h3>
                    <p className="text-gray-500">
                      {searchTerm
                        ? "Essayez de modifier vos critères de recherche"
                        : "Créez votre première publication"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredPostes.map((poste) => (
                      <div key={poste.id} className="p-6 hover:bg-gray-50 transition duration-150">
                        {/* En-tête du post */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                              <FaBuilding className="text-white text-sm" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{poste.Compagnie?.nom}</h4>
                              <p className="text-gray-500 text-sm">{formatDate(poste.createdAt)}</p>
                            </div>
                          </div>

                          {/* Menu d'actions */}
                          <div className="relative" ref={actionsRef}>
                            <button
                              onClick={() => setShowActions(showActions === poste.id ? null : poste.id)}
                              className="p-2 text-gray-400 hover:text-gray-600 transition rounded-full hover:bg-gray-200"
                            >
                              <FaEllipsisH />
                            </button>

                            {showActions === poste.id && (
                              <div className="absolute right-0 top-10 bg-white shadow-xl rounded-lg border border-gray-200 z-10 min-w-32 py-1 action-menu">
                                <button
                                  onClick={() => {
                                    handleEdit(poste);
                                    setShowModal(true);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
                                >
                                  <FaEdit className="text-xs" />
                                  <span>Modifier</span>
                                </button>
                                <button
                                  onClick={() => openDetailModal(poste)}
                                  className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center space-x-2"
                                >
                                  <FaEye className="text-xs" />
                                  <span>Détails</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(poste.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                >
                                  <FaTrash className="text-xs" />
                                  <span>Supprimer</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Contenu du post */}
                        <div>
                          <h5 className="font-bold text-gray-800 text-lg mb-3">{poste.titre}</h5>
                          <p className="text-gray-700 whitespace-pre-line mb-4 line-clamp-3">
                            {poste.description}
                          </p>

                          {poste.image && (
                            <div className="mb-4">
                              <img
                                src={`${API_BASE.replace('/api', '')}${poste.image}`}
                                alt="Post"
                                className="w-full h-48 object-cover rounded-lg shadow-md cursor-pointer"
                              />

                            </div>
                          )}

                          {/* Statistiques */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-6 text-gray-600">
                              <div className="flex items-center space-x-2">
                                {poste.likes > 0 ? (
                                  <FaHeart className="text-red-500" />
                                ) : (
                                  <FaRegHeart className="text-gray-400" />
                                )}
                                <span className="text-sm font-medium">{poste.likes || 0}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <FaRegComment className="text-gray-400" />
                                <span className="text-sm font-medium">{poste.commentairesCount || 0}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => openDetailModal(poste)}
                              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition text-sm font-medium"
                            >
                              <FaEye />
                              <span>Voir détails</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Formulaire de création (dans une sidebar) */}
          <div className="bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              {editingPost ? "Modifier la Publication" : "Nouvelle Publication"}
            </h3>

            <form onSubmit={editingPost ? handleUpdate : handleSubmit}>
              {/* Titre */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="titre"
                    value={form.titre}
                    onChange={handleChange}
                    placeholder="Titre de la publication..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    maxLength={100}
                    required
                  />
                  <div className="absolute right-3 top-3">
                    <FaHashtag className="text-gray-400" />
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500 mt-1">
                  {form.titre.length}/100 caractères
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Contenu de votre publication..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                    maxLength={maxCharacters}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-blue-600 transition"
                  >
                    <FaSmile className="text-lg" />
                  </button>
                </div>

                <div className={`text-right text-xs mt-1 ${characterCount > maxCharacters * 0.9 ? 'text-orange-500' : 'text-gray-500'
                  }`}>
                  {characterCount}/{maxCharacters} caractères
                </div>

                {showEmojiPicker && (
                  <div className="absolute z-10 mt-2">
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      width={280}
                      height={350}
                    />
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image (optionnelle)
                </label>

                {!preview && (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FaImage className="text-gray-400 text-xl mx-auto mb-2" />
                    <p className="text-gray-600 font-medium text-sm">
                      Ajouter une image
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      PNG, JPG, JPEG (max. 5MB)
                    </p>
                  </div>
                )}

                {preview && (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition shadow-lg"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Message de statut */}
              {message && (
                <div className={`mb-4 p-3 rounded-lg text-center text-sm font-semibold ${message.includes("✅") || message.includes("succès")
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-100 text-red-700 border border-red-200"
                  }`}>
                  {message}
                </div>
              )}

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={loading || !form.titre.trim() || !form.description.trim()}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2 ${loading || !form.titre.trim() || !form.description.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{editingPost ? "Modification..." : "Publication..."}</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    <span>{editingPost ? "Modifier" : "Publier"}</span>
                  </>
                )}
              </button>

              {editingPost && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full mt-3 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Annuler
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Modal Détails */}
      {showModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Détails de la Publication</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* En-tête */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <FaPaperPlane className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{selectedPost.titre}</h3>
                    <p className="text-gray-600">Publié le {formatDate(selectedPost.createdAt)}</p>
                  </div>
                </div>

                {/* Contenu */}
                <div>
                  <p className="text-gray-700 whitespace-pre-line text-lg leading-relaxed">
                    {selectedPost.description}
                  </p>
                </div>

                {/* Image */}
                {selectedPost.image && (
                  <div>
                    <img
                      src={`${API_BASE.replace('/api', '')}${selectedPost.image}`}
                      alt="Publication"
                      className="w-full h-64 object-cover rounded-xl shadow-lg"
                    />
                  </div>
                )}

                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 text-2xl font-bold text-red-600 mb-2">
                      <FaHeart />
                      <span>{selectedPost.likes || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">Likes</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 text-2xl font-bold text-blue-600 mb-2">
                      <FaComment />
                      <span>{selectedPost.commentairesCount || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">Commentaires</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      handleEdit(selectedPost);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center space-x-2"
                  >
                    <FaEdit />
                    <span>Modifier</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPostes;