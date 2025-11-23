import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api"; // A adapter en prod

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ✅ Intercepteur pour ajouter automatiquement le bon token
api.interceptors.request.use(
  (config) => {
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

// ✅ Gestion des tokens expirés + redirection automatique
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const pathname = window.location.pathname;

      // 🎯 Si on est dans l'espace super admin → retour login super admin
      if (pathname.startsWith("/super-admin")) {
        localStorage.removeItem("token_superadmin");
        window.location.href = "/super-admin/login";
      } 
      // 🏢 Sinon → retour login admin compagnie
      else {
        localStorage.removeItem("token_compagnie");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
