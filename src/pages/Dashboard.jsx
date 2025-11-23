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
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../services/api";


const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");

  const navigate = useNavigate();
  const compagnieId = localStorage.getItem("compagnie_id");
 

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (!compagnieId) {
        console.warn("⚠️ Aucun compagnie_id trouvé dans le localStorage.");
        return;
      }

      const { data } = await api.get(`/dashboard/compagnie/${compagnieId}`);

      if (data.success) {
        setDashboardData(data.data);
      } else {
        console.warn("⚠️ Échec récupération dashboard:", data.message);
      }
    } catch (error) {
      console.error("❌ Erreur chargement dashboard:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
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
      // Type nombre
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
    if (!dashboardData?.stats?.variations) return null;
    
    const variation = dashboardData.stats.variations[statKey];
    if (!variation) return null;

    switch (statKey) {
      case 'bus':
        return formatVariation(variation, 'nombre');
      case 'trajets':
        return formatVariation(variation, 'nombre');
      case 'ebillets':
        return formatVariation(variation, 'nombre');
      case 'revenue':
        return formatVariation(variation, 'currency');
      case 'clients':
        return formatVariation(variation, 'nombre');
      default:
        return formatVariation(variation, 'nombre');
    }
  };

  // ✅ Composants internes
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
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group text-left"
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
              {entry.name === "revenue" ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Erreur de chargement</h2>
            <p className="text-gray-600 mb-6">Impossible de charger les données du dashboard.</p>
            <button
              onClick={fetchDashboardData}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Tableau de Bord
            </h1>
            <p className="text-gray-600 mt-2">
              Aperçu des performances de votre compagnie
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
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

        {/* Statistiques principales DYNAMIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Bus"
            value={stats.totalBus}
            icon={<FaBus className="text-2xl" />}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            variation={getVariationText('bus')}
            subtitle="Votre flotte active"
          />
          <StatCard
            title="Trajets Actifs"
            value={stats.totalTrajets}
            icon={<FaRoute className="text-2xl" />}
            color="bg-gradient-to-br from-green-500 to-green-600"
            variation={getVariationText('trajets')}
            subtitle="Trajets programmés"
          />
          <StatCard
            title="E-billets Vendus"
            value={stats.totalEbillets}
            icon={<FaTicketAlt className="text-2xl" />}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            variation={getVariationText('ebillets')}
            subtitle="Ventes ce mois"
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
            title="Taux d'Occupation"
            value={`${stats.tauxOccupation}%`}
            icon={<FaUsers className="text-2xl" />}
            color="bg-gradient-to-br from-indigo-500 to-indigo-600"
            variation={getVariationText('occupation')}
            subtitle="Moyenne globale"
          />
          <StatCard
            title="Clients Actifs"
            value={stats.clientsActifs}
            icon={<FaUser className="text-2xl" />}
            color="bg-gradient-to-br from-pink-500 to-pink-600"
            variation={getVariationText('clients')}
            subtitle="Clients uniques"
          />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenu mensuel */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-6">
              <FaChartLine className="mr-3 text-blue-600" /> Évolution du Revenue
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={graphiques.revenueMensuel || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="mois" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
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

          {/* Taux d'occupation */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-6">
              <FaUsers className="mr-3 text-green-600" /> Taux d'Occupation Hebdomadaire
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graphiques.occupationHebdomadaire || []}>
                  <defs>
                    <linearGradient id="colorOccupation" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [`${v}%`, "Occupation"]} />
                  <Area
                    type="monotone"
                    dataKey="occupation"
                    stroke="#10B981"
                    fill="url(#colorOccupation)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Trajets populaires + e-billets récents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              {/* Derniers e-billets */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FaTicketAlt className="mr-3 text-blue-600" /> Derniers E-billets
                </h2>
                <div className="space-y-4">
                  {(recent.ebillets || []).map((billet, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-blue-50 transition group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition">
                          <FaUser className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {billet.user?.prenom} {billet.user?.nom}
                          </p>
                          <p className="text-xs text-gray-500">
                            {billet.trajet?.ville_depart} → {billet.trajet?.ville_arrivee}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-gray-800 text-sm">
                          {formatCurrency(billet.prix_total)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(billet.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FaPlus className="mr-3 text-green-600" /> Actions Rapides
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <QuickActionCard
                    title="Ajouter un Bus"
                    icon={<FaBus className="text-white text-lg" />}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                    onClick={() => navigate("/bus")}
                    description="Ajouter un nouveau bus"
                  />
                  <QuickActionCard
                    title="Créer un Trajet"
                    icon={<FaRoute className="text-white text-lg" />}
                    color="bg-gradient-to-br from-green-500 to-green-600"
                    onClick={() => navigate("/trajets")}
                    description="Planifier un trajet"
                  />
                  <QuickActionCard
                    title="Voir E-billets"
                    icon={<FaTicketAlt className="text-white text-lg" />}
                    color="bg-gradient-to-br from-purple-500 to-purple-600"
                    onClick={() => navigate("/sales")}
                    description="Consulter les ventes"
                  />
                  <QuickActionCard
                    title="Rapports"
                    icon={<FaChartLine className="text-white text-lg" />}
                    color="bg-gradient-to-br from-orange-500 to-orange-600"
                    onClick={() => navigate("/sales")}
                    description="Analyser les performances"
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

export default Dashboard;