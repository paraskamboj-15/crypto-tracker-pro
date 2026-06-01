import { useEffect, useState } from 'react';
import { getGlobalStats } from '../services/api';
import { Layers3, DollarSign, BarChart3, TrendingUp } from 'lucide-react';

const MarketStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getGlobalStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching market stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statItems = stats ? [
    {
      title: "Active Cryptocurrencies",
      value: stats.active_cryptocurrencies.toLocaleString(),
      icon: Layers3,
      color: "text-sky-400"
    },
    {
      title: "Total Market Cap",
      value: `$${Math.round(stats.total_market_cap.usd / 1e12).toLocaleString()} Trillion`, // e12 for trillion
      icon: DollarSign,
      color: "text-emerald-400"
    },
    {
      title: "24h Volume",
      value: `$${Math.round(stats.total_volume.usd / 1e9).toLocaleString()} Billion`, // e9 for billion
      icon: BarChart3,
      color: "text-amber-400"
    },
    {
      title: "Bitcoin Dominance",
      value: `${stats.market_cap_percentage.btc.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-orange-400"
    }
  ] : [];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-800/60 rounded-xl border border-slate-700/50"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div 
            key={index} 
            className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg flex items-start gap-5"
          >
            <div className={`p-3.5 rounded-xl bg-slate-700/50 ${item.color}`}>
              <Icon size={26} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1.5">{item.title}</p>
              <p className="text-white text-3xl font-extrabold tracking-tight">{item.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MarketStats;