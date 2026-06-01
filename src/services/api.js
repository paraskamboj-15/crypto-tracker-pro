import axios from 'axios';

const API = axios.create({
    baseURL: 'https://api.coingecko.com/api/v3',
});

//Fetch top 50 trending coins by market cap
export const getTrendingCoins = async (currency = 'usd') => {
    try {
        const response = await API.get(`/coins/markets`, {
            params: {
                vs_currency: currency,
                order: 'market_cap_desc',
                per_page: 50,
                page: 1,
                sparkline: false
            }
        });
        return response.data;
    } catch (error) {
        console.error("API Fetch Error:", error);
        throw error; 
    }
};

//Fetch historical price data for a specific coin
export const getCoinChartData = async (id, days = 7) => {
    try {
        const response = await API.get(`/coins/${id}/market_chart`, {
            params: {
                vs_currency: 'usd',
                days: days,
            }
        });
        
        return response.data.prices.map((item) => {
            const date = new Date(item[0]);
            const timeFormat = days === 1 
                ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : date.toLocaleDateString();
                
            return {
                time: timeFormat,
                price: item[1]
            };
        });
    } catch (error) {
        console.error("Chart API Error:", error);
        throw error;
    }
};

//Fetch global cryptocurrency market statistics
export const getGlobalStats = async () => {
    try {
        const response = await API.get('/global');
        return response.data.data;
    } catch (error) {
        console.error("Global Stats API Error:", error);
        throw error;
    }
};