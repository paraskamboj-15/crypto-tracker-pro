import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getCoinChartData } from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { X, CheckCircle2 } from 'lucide-react';

const CompareModal = ({ coins, onClose }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [coin1, coin2] = coins; // Destructure the two coins for easier access

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const fetchCompareData = async () => {
      setLoading(true);
      try {
        // Both coins data fetch together for better performance
        const [data1, data2] = await Promise.all([
          getCoinChartData(coin1.id, 7),
          getCoinChartData(coin2.id, 7)
        ]);

        // Merge data based on time for dual line chart
        const mergedData = data1.map((item, index) => ({
          time: item.time,
          [coin1.name]: item.price,
          [coin2.name]: data2[index] ? data2[index].price : null,
        }));

        setChartData(mergedData);
      } catch (error) {
        console.error("Error loading comparison chart:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompareData();

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [coin1.id, coin2.id]);

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl p-6 shadow-2xl relative max-h-[95vh] overflow-y-auto">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full">
          <X size={20} />
        </button>

        {/* Comparison Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 border-b border-slate-800 pb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Comparison <span className="text-indigo-400 font-normal text-lg">(7 Days)</span>
          </h2>
          
          <div className="flex items-center gap-8">
            {/* Coin 1 Badge */}
            <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-xl border border-indigo-500/30">
              <img src={coin1.image} alt={coin1.name} className="w-8 h-8 rounded-full" />
              <div>
                <p className="text-white font-bold">{coin1.name}</p>
                <p className="text-indigo-400 text-sm font-semibold">${coin1.current_price.toLocaleString()}</p>
              </div>
            </div>
            
            <span className="text-slate-500 font-bold italic">VS</span>

            {/* Coin 2 Badge */}
            <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-xl border border-emerald-500/30">
              <img src={coin2.image} alt={coin2.name} className="w-8 h-8 rounded-full" />
              <div>
                <p className="text-white font-bold">{coin2.name}</p>
                <p className="text-emerald-400 text-sm font-semibold">${coin2.current_price.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dual Axis Chart Area */}
        <div className="h-[400px] w-full bg-slate-800/20 rounded-xl p-4 border border-slate-700/50">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p>Analyzing market data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{fill: '#94a3b8'}} tickMargin={10} minTickGap={30} />
                
                {/* Left Axis for Coin 1 */}
                <YAxis 
                  yAxisId="left" 
                  stroke="#818cf8" 
                  tick={{fill: '#818cf8'}} 
                  domain={['auto', 'auto']} 
                  tickFormatter={(val) => `$${val.toLocaleString()}`}
                />
                
                {/* Right Axis for Coin 2 */}
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#34d399" 
                  tick={{fill: '#34d399'}} 
                  domain={['auto', 'auto']} 
                  tickFormatter={(val) => `$${val.toLocaleString()}`}
                />
                
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                
                <Line yAxisId="left" type="monotone" dataKey={coin1.name} stroke="#818cf8" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey={coin2.name} stroke="#34d399" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Side-by-Side Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {[
            { label: "Market Cap", v1: coin1.market_cap, v2: coin2.market_cap },
            { label: "24h Volume", v1: coin1.total_volume, v2: coin2.total_volume },
            { label: "24h High", v1: coin1.high_24h, v2: coin2.high_24h },
          ].map((stat, i) => (
            <div key={i} className="col-span-2 md:col-span-1 bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
              <p className="text-slate-400 text-sm text-center mb-3">{stat.label}</p>
              <div className="flex justify-between items-center">
                <span className="text-indigo-400 font-semibold">${stat.v1.toLocaleString()}</span>
                <span className="text-emerald-400 font-semibold">${stat.v2.toLocaleString()}</span>
              </div>
              {/* Visual Indicator Line */}
              <div className="w-full h-1.5 bg-slate-700 rounded-full mt-3 flex overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full" 
                  style={{ width: `${(stat.v1 / (stat.v1 + stat.v2)) * 100}%` }}
                ></div>
                <div 
                  className="bg-emerald-500 h-full" 
                  style={{ width: `${(stat.v2 / (stat.v1 + stat.v2)) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CompareModal;