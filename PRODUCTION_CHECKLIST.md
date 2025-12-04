# ✅ Checklist de Production - Dashboard Admin

## 🔐 Sécurité

- [x] Variables d'environnement configurées (`.env.example` créé)
- [x] URLs hardcodées remplacées par variables d'environnement
- [x] Gestion centralisée des tokens via intercepteurs
- [x] Suppression des données mockées
- [x] Timeout API configuré
- [x] Gestion d'erreur centralisée améliorée
- [ ] Validation des entrées utilisateur (à implémenter si nécessaire)
- [ ] Protection CSRF (si nécessaire)
- [ ] Rate limiting côté client (si nécessaire)

## 📊 Données

- [x] Toutes les données mockées supprimées
- [x] Utilisation exclusive des données API
- [x] Gestion des erreurs réseau améliorée
- [x] Messages d'erreur clairs pour l'utilisateur

## 🚀 Configuration Production

### 1. Variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
VITE_API_BASE_URL=https://votre-domaine.com/api
VITE_API_TIMEOUT=10000
VITE_DEV_MODE=false
```

### 2. Build de production

```bash
npm run build
```

Le build sera généré dans le dossier `dist/`.

### 3. Déploiement

#### Option 1: Serveur statique (Nginx, Apache)
- Copier le contenu de `dist/` vers le répertoire web de votre serveur
- Configurer le serveur pour servir `index.html` pour toutes les routes (SPA)

#### Option 2: Vercel/Netlify
- Connecter votre repository
- Configurer les variables d'environnement dans le dashboard
- Déployer automatiquement

#### Option 3: Docker
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔍 Vérifications avant déploiement

- [ ] Toutes les URLs pointent vers l'API de production
- [ ] Les tokens sont correctement gérés
- [ ] Les erreurs sont bien gérées et affichées
- [ ] Les images se chargent correctement
- [ ] Les formulaires fonctionnent
- [ ] Les redirections après login/logout fonctionnent
- [ ] Le build se fait sans erreur
- [ ] Les console.log sont supprimés en production

## 📝 Notes

- Les `console.log` sont automatiquement supprimés en production grâce à la configuration Vite
- Les source maps sont désactivées pour la sécurité
- Le code est minifié et optimisé pour la production
- Les chunks sont séparés pour un meilleur chargement

