import { useEffect, useState } from "react";
import { getTrendingCoins } from "../services/api";
import { Search, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import CoinModal from "./CoinModal";
import MarketStats from "./MarketStats";
import CompareModal from "./CompareModal";

const CoinTable = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [compareCoins, setCompareCoins] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const coinsPerPage = 6; //6 coins per page for better UX

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const data = await getTrendingCoins("usd");
        setCoins(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoins();
  }, []);

  // Filter Logic
  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Search Handler
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Pagination Logic
  const indexOfLastCoin = currentPage * coinsPerPage; // eg. Page 2 * 10 = 20
  const indexOfFirstCoin = indexOfLastCoin - coinsPerPage; // eg. 20 - 10 = 10
  const currentCoins = filteredCoins.slice(indexOfFirstCoin, indexOfLastCoin); // index 10 to 20 for page 2

  const totalPages = Math.ceil(filteredCoins.length / coinsPerPage);

  // Compare Checkbox Handler
  const handleCheckboxClick = (e, coin) => {
    e.stopPropagation(); //prevent row click event (modal open) when checkbox is clicked

    if (compareCoins.find((c) => c.id === coin.id)) {
      setCompareCoins(compareCoins.filter((c) => c.id !== coin.id));//if already selected, remove from compare list
    } else if (compareCoins.length < 2) {
      setCompareCoins([...compareCoins, coin]);//if less than 2 coins selected, add to compare list
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-slate-300">
        Fetching Data... ⏳
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-white">Cryptocurrency Market</h2>

        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800/50 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm backdrop-blur-sm"
            placeholder="Search coin by name or symbol..."
            value={searchQuery}
            onChange={handleSearch} // Updated search handler
          />
        </div>
      </div>
      <MarketStats /> 
      <div className="overflow-x-auto bg-slate-800/50 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">
              <th className="p-5 font-semibold">Coin</th>
              <th className="p-5 font-semibold">Price</th>
              <th className="p-5 font-semibold">24h Change</th>
              <th className="p-5 font-semibold">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {currentCoins.length > 0 ? (
              currentCoins.map((coin) => {
                const isSelected = compareCoins.find((c) => c.id === coin.id);

                return (
                  <tr
                    key={coin.id}
                    onClick={() => setSelectedCoin(coin)}
                    className={`border-b border-slate-700/50 transition-all duration-200 cursor-pointer hover:bg-slate-700/30 ${
                      isSelected ? "bg-indigo-500/10" : ""
                    }`}
                  >
                    <td className="p-5 flex items-center gap-4">
                      <div
                        onClick={(e) => handleCheckboxClick(e, coin)}
                        className={`min-w-[20px] w-5 h-5 rounded border flex items-center justify-center transition-colors hover:border-indigo-400 ${
                          isSelected
                            ? "bg-indigo-500 border-indigo-500"
                            : "border-slate-500"
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle2 size={14} className="text-white" />
                        )}
                      </div>

                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-9 h-9 rounded-full shadow-lg"
                      />
                      <div>
                        <p className="font-bold text-white text-base">
                          {coin.name}
                        </p>
                        <p className="text-xs text-slate-400 uppercase font-medium mt-0.5">
                          {coin.symbol}
                        </p>
                      </div>
                    </td>

                    <td className="p-5 text-white font-medium text-base">
                      ${coin.current_price.toLocaleString()}
                    </td>
                    <td
                      className={`p-5 font-semibold text-base ${coin.price_change_percentage_24h > 0 ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {coin.price_change_percentage_24h > 0 ? "+" : ""}
                      {coin.price_change_percentage_24h?.toFixed(2)}%
                    </td>
                    <td className="p-5 text-slate-300 font-medium">
                      ${coin.market_cap.toLocaleString()}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="p-10 text-center text-slate-400">
                   No match found for <u><b>{searchQuery}</b></u>.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination UI Component */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-700 bg-slate-800/30">
            <p className="text-sm text-slate-400">
              Showing{" "}
              <span className="font-medium text-white">
                {indexOfFirstCoin + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-white">
                {Math.min(indexOfLastCoin, filteredCoins.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-white">
                {filteredCoins.length}
              </span>{" "}
              coins
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Modal */}
      {selectedCoin && (
        <CoinModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />
      )}
      {/* Floating Action Button for Comparison */}
      {compareCoins.length === 2 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <button
            onClick={() => setShowCompareModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] font-bold tracking-wide flex items-center gap-3 transition-all"
          >
            Compare {compareCoins[0].name} vs {compareCoins[1].name}
          </button>
        </div>
      )}
      {/* Compare Modal */}
      {showCompareModal && (
        <CompareModal
          coins={compareCoins}
          onClose={() => {
            setShowCompareModal(false);
            setCompareCoins([]); //deselect coins after comparison
          }}
        />
      )}
      {selectedCoin && compareCoins.length === 0 && (
        <CoinModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />
      )}
    </div>
  );
};

export default CoinTable;
