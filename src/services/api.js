import axios from "axios";

// ✅ Utiliser les variables d'environnement avec fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || "10000");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Log de l'URL utilisée en développement
if (import.meta.env.DEV) {
  console.log(`🌐 Dashboard API Base URL: ${API_BASE_URL}`);
}

// ✅ Intercepteur pour ajouter automatiquement le bon token
api.interceptors.request.use(
  (config) => {
    // ✅ Récupérer les tokens selon le contexte
    const tokenSuperAdmin = localStorage.getItem("token_superadmin");
    const tokenCompagnie = localStorage.getItem("token_compagnie");

    // ✅ Priorité : Super Admin > Compagnie
    if (tokenSuperAdmin) {
      config.headers.Authorization = `Bearer ${tokenSuperAdmin}`;
    } else if (tokenCompagnie) {
      config.headers.Authorization = `Bearer ${tokenCompagnie}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Gestion centralisée des erreurs API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Gestion améliorée des erreurs réseau
    if (error.code === 'ECONNABORTED') {
      console.error("⏱️  Timeout: La requête a pris trop de temps");
    } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error(`🌐 Erreur réseau: Impossible de se connecter à ${API_BASE_URL}`);
      console.error("💡 Vérifiez que:");
      console.error("   1. Le serveur backend est démarré");
      console.error("   2. L'URL de l'API est correcte dans .env");
    }

    // ✅ Gestion des tokens expirés + redirection automatique
    if (error.response?.status === 401) {
      const pathname = window.location.pathname;

      // 🎯 Si on est dans l'espace super admin → retour login super admin
      if (pathname.startsWith("/super-admin")) {
        localStorage.removeItem("token_superadmin");
        localStorage.removeItem("user_superadmin");
        window.location.href = "/super-admin/login";
      } 
      // 🏢 Sinon → retour login admin compagnie
      else {
        localStorage.removeItem("token_compagnie");
        localStorage.removeItem("compagnie_id");
        window.location.href = "/login";
      }
    }

    // ✅ Gestion des erreurs serveur (500, 503, etc.)
    if (error.response?.status >= 500) {
      console.error("❌ Erreur serveur:", error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
