import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getCoinChartData } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { X, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

// Timeframe options
const chartDays = [
  { label: "24h", value: 1 },
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "1Y", value: 365 },
];

const CoinModal = ({ coin, onClose }) => {
  const [chartData, setChartData] = useState([]);
  const [days, setDays] = useState(7); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const fetchChart = async () => {
      setLoading(true);
      try {
        const data = await getCoinChartData(coin.id, days);
        setChartData(data);
      } catch (error) {
        console.error("Error loading chart:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChart();

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [coin.id, days]); // Whenever coin or days change, chart data will be refetched

  // Custom Tooltip UI for Chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 p-3 rounded-lg shadow-xl">
          <p className="text-slate-300 text-sm mb-1">{label}</p>
          <p className="text-emerald-400 font-bold text-lg">
            ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
          </p>
        </div>
      );
    }
    return null;
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl p-6 shadow-2xl relative max-h-[95vh] overflow-y-auto">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-rose-400 transition-colors bg-slate-800 p-1 rounded-full">
          <X size={24} />
        </button>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pr-8">
          <div className="flex items-center gap-4">
            <img src={coin.image} alt={coin.name} className="w-14 h-14 rounded-full shadow-lg" />
            <div>
              <h3 className="text-3xl font-bold text-white">{coin.name} <span className="text-slate-400 text-xl uppercase font-medium">({coin.symbol})</span></h3>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-2xl font-bold text-white">${coin.current_price.toLocaleString()}</p>
                <span className={`px-2 py-1 rounded-md text-sm font-semibold flex items-center gap-1 ${coin.price_change_percentage_24h > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {coin.price_change_percentage_24h > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Timeframe Filters */}
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            {chartDays.map((day) => (
              <button
                key={day.value}
                onClick={() => setDays(day.value)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  days === day.value 
                    ? 'bg-indigo-500 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-80 w-full mb-6 bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p>Fetching {days} days data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide={true} />
                <YAxis domain={['auto', 'auto']} hide={true} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="price" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Market Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Market Cap</p>
            <p className="text-white font-semibold text-lg">${coin.market_cap.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Total Volume</p>
            <p className="text-white font-semibold text-lg">${coin.total_volume.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">24h High</p>
            <p className="text-emerald-400 font-semibold text-lg">${coin.high_24h.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">24h Low</p>
            <p className="text-rose-400 font-semibold text-lg">${coin.low_24h.toLocaleString()}</p>
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CoinModal;