import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AppContext = createContext();

export const IP_ADDRESS = '10.132.85.152';

export function AppProvider({ children }) {
  const [marketIndices, setMarketIndices] = useState([]);
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [scamAlerts, setScamAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const response = await axios.get(`http://${IP_ADDRESS}:8081/api/home`);
      setMarketIndices(response.data.marketIndices || []);
      setTrendingStocks(response.data.trendingStocks || []);
      setScamAlerts(response.data.scamAlerts || []);
    } catch (err) {
      setError('Failed to load data. Please check your connection.');
      console.log('AppContext fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{ marketIndices, trendingStocks, scamAlerts, loading, error, refetch: fetchHomeData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppContext);
}