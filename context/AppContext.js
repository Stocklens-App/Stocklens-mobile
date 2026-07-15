import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../context/axios';
import { API_CONFIG } from '../context/api';

const AppContext = createContext();

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
      setLoading(true);
      setError(null);

      const response = await api.get(API_CONFIG.ENDPOINTS.HOME);
console.log("HOME API RESPONSE:", response.data);
      setMarketIndices(response.data?.marketIndices ?? []);
      setTrendingStocks(response.data?.trendingStocks ?? []);
      setScamAlerts(response.data?.scamAlerts ?? []);
    } catch (err) {
      console.log('AppContext fetch error:', err.message);
      setError('Network error. Check backend or connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        marketIndices,
        trendingStocks,
        scamAlerts,
        loading,
        error,
        refetch: fetchHomeData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppContext);
}