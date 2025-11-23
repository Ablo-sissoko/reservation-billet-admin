import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  AreaChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  FaBus,
  FaRoute,
  FaTicketAlt,
  FaMoneyBillWave,
  FaUsers,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaUser,
  FaPlus,
  FaBuilding,
  FaStar,
  FaComments,
  FaEye,
  FaDownload
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../services/api";



const DashboardSuperAdmin = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [exportLoading, setExportLoading] = useState(false);

  const navigate = useNavigate();
  
  // Récupérer le token depuis le localStorage (adaptez selon votre système d'auth)
 

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/dashboard/superadmin?periode=${timeRange}`);

      if (data.success) {
        setDashboardData(data.data);
      } else {
        console.warn("⚠️ Échec récupération dashboard:", data.message);
        // En cas d'erreur, utiliser les données mockées temporairement
        setDashboardData(generateMockData());
      }
    } catch (error) {
      console.error("❌ Erreur chargement dashboard:", error.response?.data || error);
      // En cas d'erreur réseau, utiliser les données mockées
      setDashboardData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  // Génération de données mock pour la démonstration (fallback)
  const generateMockData = () => {
    const compagnies = ["Transport Mali", "Buses Express", "Voyageurs SA", "Trans-Mali", "Bus Plus"];
    const mois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    
    return {
      stats: {
        totalCompagnies: 12,
        totalUtilisateurs: 1542,
        totalTrajets: 289,
        totalReservations: 5432,
        totalRevenue: 45218000,
        tauxOccupationMoyen: 68,
        totalAvis: 234,
        noteMoyenne: 4.2
      },
      variations: {
        compagnies: { valeur: 2, pourcentage: 20 },
        utilisateurs: { valeur: 124, pourcentage: 8.7 },
        trajets: { valeur: 23, pourcentage: 8.6 },
        reservations: { valeur: 432, pourcentage: 8.6 },
        revenue: { valeur: 3420000, pourcentage: 8.2 },
        occupation: { valeur: 3, pourcentage: 4.6 }
      },
      graphiques: {
        revenueMensuel: mois.map(mois => ({
          mois,
          revenue: Math.floor(Math.random() * 8000000) + 2000000,
          transactions: Math.floor(Math.random() * 500) + 200
        })),
        occupationHebdomadaire: [
          { name: "Lun", occupation: 65 },
          { name: "Mar", occupation: 72 },
          { name: "Mer", occupation: 68 },
          { name: "Jeu", occupation: 75 },
          { name: "Ven", occupation: 80 },
          { name: "Sam", occupation: 85 },
          { name: "Dim", occupation: 60 }
        ],
        trajetsPopulaires: [
          { name: "Bamako → Ségou", reservations: 342, revenue: 10260000 },
          { name: "Bamako → Mopti", reservations: 298, revenue: 11920000 },
          { name: "Ségou → Sikasso", reservations: 234, revenue: 7020000 },
          { name: "Kayes → Bamako", reservations: 198, revenue: 7920000 },
          { name: "Mopti → Tombouctou", reservations: 156, revenue: 6240000 }
        ],
        repartitionCompagnies: compagnies.map((compagnie, index) => ({
          name: compagnie,
          value: Math.floor(Math.random() * 30) + 15,
          revenue: Math.floor(Math.random() * 10000000) + 5000000
        })),
        evolutionUtilisateurs: mois.map(mois => ({
          mois,
          nouveaux: Math.floor(Math.random() * 50) + 20,
          total: Math.floor(Math.random() * 200) + 1300
        }))
      },
      recent: {
        reservations: Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          user: { prenom: ["Moussa", "Aïcha", "Ibrahim", "Fatoumata"][i % 4], nom: ["Diallo", "Traoré", "Keita", "Cissé"][i % 4] },
          trajet: { ville_depart: "Bamako", ville_arrivee: ["Ségou", "Mopti", "Kayes", "Sikasso"][i % 4] },
          prix_total: Math.floor(Math.random() * 15000) + 5000,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        })),
        compagnies: Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          nom: compagnies[i],
          email: `contact@${compagnies[i].toLowerCase().replace(/\s/g, '')}.com`,
          date_creation: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          statut: "active"
        }))
      }
    };
  };

  // Fonction pour formater les variations
  const formatVariation = (variation, type = "nombre") => {
    if (!variation) return null;
    
    const { valeur, pourcentage } = variation;
    const isPositive = valeur >= 0;
    const absValue = Math.abs(valeur);
    const absPercentage = Math.abs(pourcentage);

    if (type === "pourcentage") {
      return {
        text: `${isPositive ? '+' : '-'}${absPercentage}%`,
        type: isPositive ? "up" : "down"
      };
    } else if (type === "currency") {
      return {
        text: `${isPositive ? '+' : '-'}${formatCurrency(absValue)}`,
        type: isPositive ? "up" : "down"
      };
    } else {
      if (absValue === 0) return null;
      
      let text = '';
      if (absValue === 1) {
        text = isPositive ? '+1 ce mois' : '-1 ce mois';
      } else {
        text = isPositive ? `+${absValue} ce mois` : `-${absValue} ce mois`;
      }
      
      return {
        text,
        type: isPositive ? "up" : "down"
      };
    }
  };

  // Fonction pour formater les variations spécifiques
  const getVariationText = (statKey) => {
    if (!dashboardData?.variations) return null;
    
    const variation = dashboardData.variations[statKey];
    if (!variation) return null;

    switch (statKey) {
      case 'compagnies':
        return formatVariation(variation, 'nombre');
      case 'utilisateurs':
        return formatVariation(variation, 'nombre');
      case 'trajets':
        return formatVariation(variation, 'nombre');
      case 'reservations':
        return formatVariation(variation, 'nombre');
      case 'revenue':
        return formatVariation(variation, 'currency');
      case 'occupation':
        return formatVariation(variation, 'pourcentage');
      default:
        return formatVariation(variation, 'nombre');
    }
  };

  // Composants internes
  const StatCard = ({ title, value, icon, color, variation, subtitle }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{value}</h3>
          {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
          {variation && (
            <div
              className={`flex items-center mt-2 text-sm font-medium ${
                variation.type === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {variation.type === "up" ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
              <span>{variation.text}</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${color} text-white shadow-lg`}>{icon}</div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, icon, color, onClick, description }) => (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 group text-left"
    >
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </button>
  );

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(amount || 0);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}:{" "}
              {entry.name === "revenue" || entry.name === "value" ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Couleurs pour le graphique en camembert
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const response = await axiosAuth.get('/dashboard/superadmin/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard-superadmin-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur export:", error);
      // Fallback: export manuel si l'endpoint n'est pas disponible
      if (dashboardData) {
        const csvContent = [
          ["Métrique", "Valeur", "Variation"],
          ["Compagnies", dashboardData.stats.totalCompagnies, `${dashboardData.variations.compagnies.valeur >= 0 ? '+' : ''}${dashboardData.variations.compagnies.valeur}`],
          ["Utilisateurs", dashboardData.stats.totalUtilisateurs, `${dashboardData.variations.utilisateurs.valeur >= 0 ? '+' : ''}${dashboardData.variations.utilisateurs.valeur}`],
          ["Réservations", dashboardData.stats.totalReservations, `${dashboardData.variations.reservations.valeur >= 0 ? '+' : ''}${dashboardData.variations.reservations.valeur}`],
          ["Revenue", formatCurrency(dashboardData.stats.totalRevenue), `${dashboardData.variations.revenue.valeur >= 0 ? '+' : ''}${formatCurrency(dashboardData.variations.revenue.valeur)}`],
        ].map(row => row.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-superadmin-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Erreur de chargement</h2>
            <p className="text-gray-600 mb-6">Impossible de charger les données du dashboard.</p>
            <button
              onClick={fetchDashboardData}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { stats, graphiques, recent } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Tableau de Bord Super Admin
            </h1>
            <p className="text-gray-600 mt-2">
              Vue d'ensemble de l'ensemble de la plateforme
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition flex items-center space-x-2 font-semibold disabled:opacity-50"
            >
              <FaDownload />
              <span>{exportLoading ? "Export..." : "Exporter"}</span>
            </button>
            <div className="text-sm text-gray-500 bg-white px-3 py-2 rounded-xl shadow-sm">
              📅{" "}
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Compagnies"
            value={stats.totalCompagnies}
            icon={<FaBuilding className="text-2xl" />}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            variation={getVariationText('compagnies')}
            subtitle="Compagnies actives"
          />
          <StatCard
            title="Utilisateurs"
            value={stats.totalUtilisateurs}
            icon={<FaUsers className="text-2xl" />}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            variation={getVariationText('utilisateurs')}
            subtitle="Utilisateurs inscrits"
          />
          <StatCard
            title="Réservations"
            value={stats.totalReservations}
            icon={<FaTicketAlt className="text-2xl" />}
            color="bg-gradient-to-br from-green-500 to-green-600"
            variation={getVariationText('reservations')}
            subtitle="Réservations totales"
          />
          <StatCard
            title="Revenue Total"
            value={formatCurrency(stats.totalRevenue)}
            icon={<FaMoneyBillWave className="text-2xl" />}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
            variation={getVariationText('revenue')}
            subtitle="Chiffre d'affaires"
          />
          <StatCard
            title="Trajets Actifs"
            value={stats.totalTrajets}
            icon={<FaRoute className="text-2xl" />}
            color="bg-gradient-to-br from-red-500 to-red-600"
            variation={getVariationText('trajets')}
            subtitle="Trajets programmés"
          />
          <StatCard
            title="Taux d'Occupation"
            value={`${stats.tauxOccupationMoyen}%`}
            icon={<FaChartLine className="text-2xl" />}
            color="bg-gradient-to-br from-indigo-500 to-indigo-600"
            variation={getVariationText('occupation')}
            subtitle="Moyenne globale"
          />
          <StatCard
            title="Avis Clients"
            value={stats.totalAvis}
            icon={<FaComments className="text-2xl" />}
            color="bg-gradient-to-br from-pink-500 to-pink-600"
            variation={formatVariation({ valeur: 12, pourcentage: 5.4 }, 'nombre')}
            subtitle={`Note moyenne: ${stats.noteMoyenne}/5`}
          />
          <StatCard
            title="Satisfaction"
            value={`${stats.noteMoyenne}/5`}
            icon={<FaStar className="text-2xl" />}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            variation={formatVariation({ valeur: 0.2, pourcentage: 5 }, 'pourcentage')}
            subtitle="Note moyenne"
          />
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenu mensuel */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-6">
              <FaChartLine className="mr-3 text-purple-600" /> Évolution du Revenue
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={graphiques.revenueMensuel || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="mois" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8B5CF6"
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="transactions"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: "#10B981", r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Répartition par compagnie */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-6">
              <FaBuilding className="mr-3 text-blue-600" /> Répartition par Compagnie
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={graphiques.repartitionCompagnies || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(graphiques.repartitionCompagnies || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Graphiques secondaires */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Taux d'occupation */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-6">
              <FaUsers className="mr-3 text-green-600" /> Taux d'Occupation Hebdomadaire
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graphiques.occupationHebdomadaire || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [`${v}%`, "Occupation"]} />
                  <Bar dataKey="occupation" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Évolution utilisateurs */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-6">
              <FaUser className="mr-3 text-blue-600" /> Évolution des Utilisateurs
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graphiques.evolutionUtilisateurs || []}>
                  <defs>
                    <linearGradient id="colorUtilisateurs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="mois" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3B82F6"
                    fill="url(#colorUtilisateurs)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="nouveaux"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ fill: "#8B5CF6", r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Dernières activités et actions rapides */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trajets populaires */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <FaRoute className="mr-3 text-purple-600" /> Trajets Populaires
            </h2>
            <div className="space-y-4">
              {(graphiques.trajetsPopulaires || []).slice(0, 5).map((trajet, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm mb-1">{trajet.name}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>🎫 {trajet.reservations} réservations</span>
                      <span>💰 {formatCurrency(trajet.revenue)}</span>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dernières réservations */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FaTicketAlt className="mr-3 text-green-600" /> Dernières Réservations
                </h2>
                <div className="space-y-4">
                  {(recent.reservations || []).map((reservation, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-green-50 transition group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition">
                          <FaUser className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {reservation.user?.prenom} {reservation.user?.nom}
                          </p>
                          <p className="text-xs text-gray-500">
                            {reservation.trajet?.ville_depart} → {reservation.trajet?.ville_arrivee}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800 text-sm">
                          {formatCurrency(reservation.prix_total)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(reservation.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FaPlus className="mr-3 text-purple-600" /> Actions Rapides
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <QuickActionCard
                    title="Gérer Compagnies"
                    icon={<FaBuilding className="text-white text-lg" />}
                    color="bg-gradient-to-br from-purple-500 to-purple-600"
                    onClick={() => navigate("/compagnies")}
                    description="Gérer toutes les compagnies"
                  />
                  <QuickActionCard
                    title="Voir Utilisateurs"
                    icon={<FaUsers className="text-white text-lg" />}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                    onClick={() => navigate("/utilisateurs")}
                    description="Consulter les utilisateurs"
                  />
                  <QuickActionCard
                    title="Analyser Avis"
                    icon={<FaStar className="text-white text-lg" />}
                    color="bg-gradient-to-br from-yellow-500 to-yellow-600"
                    onClick={() => navigate("/avis")}
                    description="Voir les avis clients"
                  />
                  <QuickActionCard
                    title="Rapports Détaillés"
                    icon={<FaChartLine className="text-white text-lg" />}
                    color="bg-gradient-to-br from-green-500 to-green-600"
                    onClick={() => navigate("/rapports")}
                    description="Analyses approfondies"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSuperAdmin;