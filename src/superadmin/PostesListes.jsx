import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  FaNewspaper,
  FaBuilding,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaThumbsUp,
  FaThumbsDown,
  FaComments,
  FaEye,
  FaTimes,
  FaImage,
  FaSave,
  FaExclamationTriangle,
  FaPaperPlane,
  FaSmile,
  FaHashtag,
  FaEllipsisH,
  FaHeart,
  FaComment,
  FaRegHeart,
  FaRegComment,
  FaChartLine,
  FaUsers,
  FaFilter
} from "react-icons/fa";
import EmojiPicker from 'emoji-picker-react';
import api from "../services/api";


const PostCard = React.memo(({ post, onEdit, onDelete, onView, onActions }) => {
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {post.image && (
        <div className="h-48 overflow-hidden cursor-pointer" onClick={() => onView(post)}>
          <img 
            src={post.image} 
            alt={post.titre}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {post.Compagnie?.logo_url ? (
              <img 
                src={post.Compagnie.logo_url} 
                alt={post.Compagnie.nom}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <FaBuilding className="text-white text-sm" />
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">
              {post.Compagnie?.nom}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString('fr-FR')}
            </span>
            <div className="relative" ref={actionsRef}>
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 text-gray-400 hover:text-gray-600 transition rounded-full hover:bg-gray-100"
              >
                <FaEllipsisH className="text-sm" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-8 bg-white shadow-xl rounded-lg border border-gray-200 z-10 min-w-32 py-1">
                  <button
                    onClick={() => onView(post)}
                    className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
                  >
                    <FaEye className="text-xs" />
                    <span>Voir détails</span>
                  </button>
                  <button
                    onClick={() => onEdit(post)}
                    className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center space-x-2"
                  >
                    <FaEdit className="text-xs" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => onDelete(post)}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <FaTrash className="text-xs" />
                    <span>Supprimer</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition"
            onClick={() => onView(post)}>
          {post.titre}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.description}
        </p>

        {/* Statistiques */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full">
              <FaThumbsUp className="text-green-500" />
              <span className="font-medium">{post.likes || 0}</span>
            </div>
            <div className="flex items-center space-x-1 bg-red-50 px-2 py-1 rounded-full">
              <FaThumbsDown className="text-red-500" />
              <span className="font-medium">{post.dislikes || 0}</span>
            </div>
            <div className="flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-full">
              <FaComments className="text-blue-500" />
              <span className="font-medium">{post.commentairesCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center justify-between border-t pt-4">
          <button
            onClick={() => onView(post)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition font-medium"
          >
            <FaEye />
            <span className="text-sm">Voir plus</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(post)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
              title="Modifier"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => onDelete(post)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Supprimer"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

const PostFormModal = ({ post, compagnies, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    titre: post?.titre || "",
    description: post?.description || "",
    image: post?.image || "",
    compagnie_id: post?.compagnie_id || ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [preview, setPreview] = useState(post?.image || null);
  const textareaRef = useRef(null);

  const characterCount = formData.description.length;
  const maxCharacters = 1000;

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.description;
    const newText = text.substring(0, start) + emoji + text.substring(end);
    setFormData(prev => ({ ...prev, description: newText }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.titre.trim()) newErrors.titre = "Le titre est requis";
    if (!formData.description.trim()) newErrors.description = "La description est requise";
    if (!formData.compagnie_id) newErrors.compagnie_id = "La compagnie est requise";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData, post?.id);
      onClose();
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, image: value }));
    setPreview(value);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: "" }));
    setPreview(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {post ? "Modifier le Post" : "Nouveau Post"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Compagnie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compagnie *
              </label>
              <select
                value={formData.compagnie_id}
                onChange={(e) => setFormData({ ...formData, compagnie_id: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                  errors.compagnie_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner une compagnie</option>
                {compagnies.map(compagnie => (
                  <option key={compagnie.id} value={compagnie.id}>
                    {compagnie.nom}
                  </option>
                ))}
              </select>
              {errors.compagnie_id && (
                <p className="text-red-500 text-sm mt-1">{errors.compagnie_id}</p>
              )}
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                    errors.titre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Titre du post..."
                  maxLength={100}
                />
                <div className="absolute right-3 top-3">
                  <FaHashtag className="text-gray-400" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-1">
                {errors.titre && (
                  <p className="text-red-500 text-sm">{errors.titre}</p>
                )}
                <span className="text-xs text-gray-500 ml-auto">
                  {formData.titre.length}/100
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Description du post..."
                  maxLength={maxCharacters}
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-blue-600 transition"
                >
                  <FaSmile className="text-lg" />
                </button>
              </div>
              <div className="flex justify-between items-center mt-1">
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
                <span className={`text-xs ${
                  characterCount > maxCharacters * 0.9 ? 'text-orange-500' : 'text-gray-500'
                }`}>
                  {characterCount}/{maxCharacters}
                </span>
              </div>

              {showEmojiPicker && (
                <div className="absolute z-10 mt-2">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    width={300}
                    height={400}
                  />
                </div>
              )}
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de l'image
              </label>
              
              {!preview && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition mb-3">
                  <FaImage className="text-gray-400 text-2xl mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Ajouter une image</p>
                  <p className="text-gray-500 text-sm mt-1">Collez l'URL de l'image</p>
                </div>
              )}

              <div className="flex space-x-3">
                <input
                  type="url"
                  value={formData.image}
                  onChange={handleImageChange}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="https://example.com/image.jpg"
                />
                {preview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              
              {preview && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Aperçu:</p>
                  <img 
                    src={preview} 
                    alt="Aperçu" 
                    className="h-32 object-cover rounded-lg border shadow-sm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 font-medium"
              >
                <FaSave />
                <span>{loading ? "Sauvegarde..." : "Sauvegarder"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const PostDetailModal = ({ post, onClose }) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Détails du Post</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes />
            </button>
          </div>

          <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <div className="flex items-center space-x-4">
                {post.Compagnie?.logo_url ? (
                  <img 
                    src={post.Compagnie.logo_url} 
                    alt={post.Compagnie.nom}
                    className="w-16 h-16 rounded-2xl object-cover shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-md">
                    <FaBuilding className="text-white text-2xl" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{post.Compagnie?.nom}</h3>
                  <p className="text-gray-600">
                    {new Date(post.createdAt).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full">
                  <FaThumbsUp className="text-green-500" />
                  <span className="font-bold text-gray-800">{post.likes || 0}</span>
                </div>
                <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-full">
                  <FaThumbsDown className="text-red-500" />
                  <span className="font-bold text-gray-800">{post.dislikes || 0}</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-full">
                  <FaComments className="text-blue-500" />
                  <span className="font-bold text-gray-800">{post.commentairesCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Image */}
            {post.image && (
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={post.image} 
                  alt={post.titre}
                  className="w-full h-80 object-cover"
                />
              </div>
            )}

            {/* Contenu */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">{post.titre}</h1>
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line bg-gray-50 p-6 rounded-xl">
                  {post.description}
                </p>
              </div>
            </div>

            {/* Métriques détaillées */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 mb-1">{post.likes || 0}</div>
                <div className="text-sm text-blue-600 font-medium">Likes</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <div className="text-2xl font-bold text-red-600 mb-1">{post.dislikes || 0}</div>
                <div className="text-sm text-red-600 font-medium">Dislikes</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600 mb-1">{post.commentairesCount || 0}</div>
                <div className="text-sm text-green-600 font-medium">Commentaires</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color} text-white shadow-md`}>
        {icon}
      </div>
    </div>
  </div>
);

const PostesManagement = () => {
  const [postes, setPostes] = useState([]);
  const [compagnies, setCompagnies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompagnie, setSelectedCompagnie] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
    
      
      const [postesRes, compagniesRes] = await Promise.all([
        api.get("/postes"),
        api.get("/compagnies")
      ]);

      setPostes(postesRes.data);
      setCompagnies(compagniesRes.data);
      setError(null);
    } catch (error) {
      console.error("Erreur chargement:", error);
      setError("Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  const filteredPostes = useMemo(() => {
    return postes.filter(poste => {
      const matchesSearch = 
        poste.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poste.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poste.Compagnie?.nom.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCompagnie = !selectedCompagnie || 
        poste.compagnie_id === parseInt(selectedCompagnie);

      return matchesSearch && matchesCompagnie;
    });
  }, [postes, searchTerm, selectedCompagnie]);

  const handleCreatePost = () => {
    setSelectedPost(null);
    setShowFormModal(true);
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setShowFormModal(true);
  };

  const handleViewPost = (post) => {
    setSelectedPost(post);
    setShowDetailModal(true);
  };

  const handleSavePost = async (formData, postId) => {
    try {
      setActionLoading(true);

      
      if (postId) {
        await api.put(`/postes/${postId}`, formData);
      } else {
        await api.post("/postes", formData);
      }
      
      await fetchData();
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePost = async (post) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le post "${post.titre}" ?`)) {
      return;
    }

    try {
      setActionLoading(true);
      
      await api.delete(`/postes/${post.id}`);
      await fetchData();
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setActionLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: postes.length,
    withImage: postes.filter(p => p.image).length,
    totalLikes: postes.reduce((sum, p) => sum + (p.likes || 0), 0),
    totalComments: postes.reduce((sum, p) => sum + (p.commentairesCount || 0), 0),
    totalDislikes: postes.reduce((sum, p) => sum + (p.dislikes || 0), 0)
  }), [postes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <FaNewspaper className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Gestion des Posts
          </h1>
          <p className="text-gray-600 text-lg">
            Créez et gérez les posts des compagnies de transport
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Posts"
            value={stats.total}
            icon={<FaNewspaper className="text-2xl" />}
            color="bg-blue-500"
            subtitle="Toutes publications"
          />
          <StatCard
            title="Avec Image"
            value={stats.withImage}
            icon={<FaImage className="text-2xl" />}
            color="bg-green-500"
            subtitle="Contenu visuel"
          />
          <StatCard
            title="Total Likes"
            value={stats.totalLikes}
            icon={<FaThumbsUp className="text-2xl" />}
            color="bg-purple-500"
            subtitle="Engagement positif"
          />
          <StatCard
            title="Total Dislikes"
            value={stats.totalDislikes}
            icon={<FaThumbsDown className="text-2xl" />}
            color="bg-red-500"
            subtitle="Feedback négatif"
          />
          <StatCard
            title="Total Commentaires"
            value={stats.totalComments}
            icon={<FaComments className="text-2xl" />}
            color="bg-orange-500"
            subtitle="Interactions"
          />
        </div>

        {/* Barre d'actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un post par titre, description ou compagnie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              <select
                value={selectedCompagnie}
                onChange={(e) => setSelectedCompagnie(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition min-w-48"
              >
                <option value="">Toutes les compagnies</option>
                {compagnies.map(compagnie => (
                  <option key={compagnie.id} value={compagnie.id}>
                    {compagnie.nom}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCreatePost}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center space-x-2 font-semibold shadow-lg"
            >
              <FaPlus />
              <span>Nouveau Post</span>
            </button>
          </div>
        </div>

        {/* Liste des posts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <FaExclamationTriangle className="text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {filteredPostes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <FaNewspaper className="text-gray-400 text-5xl mx-auto mb-4" />
            <h3 className="text-gray-600 text-xl font-medium mb-2">
              {searchTerm || selectedCompagnie 
                ? "Aucun post trouvé" 
                : "Aucun post créé"
              }
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm || selectedCompagnie 
                ? "Essayez de modifier vos critères de recherche ou de filtrage" 
                : "Commencez par créer votre premier post pour partager des actualités"
              }
            </p>
            {!searchTerm && !selectedCompagnie && (
              <button
                onClick={handleCreatePost}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center space-x-2 mx-auto font-semibold"
              >
                <FaPlus />
                <span>Créer votre premier Post</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPostes.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
                onView={handleViewPost}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        {showFormModal && (
          <PostFormModal
            post={selectedPost}
            compagnies={compagnies}
            onSave={handleSavePost}
            onClose={() => setShowFormModal(false)}
          />
        )}

        {showDetailModal && (
          <PostDetailModal
            post={selectedPost}
            onClose={() => setShowDetailModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default PostesManagement;