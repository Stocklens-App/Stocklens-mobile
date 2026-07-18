import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const AppContext = createContext();

export const IP_ADDRESS = '192.168.100.189';

const BASE = `http://${IP_ADDRESS}:8081`;

export function AppProvider({ children }) {
  // ── Home tab data ──
  const [marketIndices, setMarketIndices] = useState([]);
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [scamAlerts, setScamAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Stock list (Invest + Pulse tabs) ──
  const [stocks, setStocks] = useState([]);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [stocksError, setStocksError] = useState(null);

  // ── Learn tab modules ──
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [modulesError, setModulesError] = useState(null);

  const fetchHomeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BASE}/api/home`);
      setMarketIndices(response.data.marketIndices || []);
      setTrendingStocks(response.data.trendingStocks || []);
      setScamAlerts(response.data.scamAlerts || []);
    } catch (err) {
      setError('Failed to load data. Please check your connection.');
      console.log('AppContext home fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStocks = useCallback(async () => {
    try {
      setStocksLoading(true);
      setStocksError(null);
      const response = await axios.get(`${BASE}/api/stocks`);
      setStocks(response.data || []);
    } catch (err) {
      setStocksError('Could not load stocks. Check your connection and try again.');
      setStocks([]);
      console.log('AppContext stocks fetch error:', err.message);
    } finally {
      setStocksLoading(false);
    }
  }, []);

  const fetchModules = useCallback(async () => {
    try {
      setModulesLoading(true);
      setModulesError(null);
      const response = await axios.get(`${BASE}/api/academic/all`);
      setModules(response.data || []);
    } catch (err) {
      setModulesError('Could not load lessons. Check your connection.');
      setModules([]);
      console.log('AppContext modules fetch error:', err.message);
    } finally {
      setModulesLoading(false);
    }
  }, []);

  // Fire all three in parallel the moment the app starts — before login finishes.
  // By the time any tab is opened, the data is already here.
  useEffect(() => {
    fetchHomeData();
    fetchStocks();
    fetchModules();
  }, [fetchHomeData, fetchStocks, fetchModules]);

  return (
    <AppContext.Provider
      value={{
        // Home
        marketIndices,
        trendingStocks,
        scamAlerts,
        loading,
        error,
        refetch: fetchHomeData,
        // Stocks
        stocks,
        stocksLoading,
        stocksError,
        refetchStocks: fetchStocks,
        // Learn
        modules,
        modulesLoading,
        modulesError,
        refetchModules: fetchModules,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppContext);
}