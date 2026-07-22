import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { registerForPushNotificationsAsync } from '../utils/registerForPushNotifications';

const AppContext = createContext();

export const IP_ADDRESS = '10.100.132.167';

const BASE = `http://${IP_ADDRESS}:8081`;

export function AppProvider({ children }) {
  // ── Home tab data ──
  const [marketIndices, setMarketIndices] = useState([]);
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [scamAlerts, setScamAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  const fetchUnreadCount = useCallback(async (email) => {
    if (!email) return;
    try {
      const res = await fetch(
        `http://${IP_ADDRESS}:8081/api/notifications/unread-count?email=${encodeURIComponent(email)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.log('Unread count fetch error:', err.message);
    }
  }, []);

  const refreshUnreadCount = useCallback(() => {
    fetchUnreadCount(currentUserEmail);
  }, [currentUserEmail, fetchUnreadCount]);

  // When a user logs in, load their notification preference + unread count,
  // and register their device for push notifications if they've opted in.
  useEffect(() => {
    if (!currentUserEmail) return;

    fetch(`http://${IP_ADDRESS}:8081/api/users/profile?email=${encodeURIComponent(currentUserEmail)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setNotificationsEnabled(!!data.notificationsEnabled);

        if (data.notificationsEnabled) {
          registerForPushNotificationsAsync().then((token) => {
            if (token) {
              fetch(`http://${IP_ADDRESS}:8081/api/users/push-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUserEmail, pushToken: token }),
              }).catch((err) => console.log('Push token register error:', err.message));
            }
          });
        }
      })
      .catch((err) => console.log('Profile load error (notifications):', err.message));

    fetchUnreadCount(currentUserEmail);
  }, [currentUserEmail, fetchUnreadCount]);

  const toggleNotifications = async (enabled) => {
    setNotificationsEnabled(enabled); // optimistic update
    try {
      const res = await fetch(`http://${IP_ADDRESS}:8081/api/users/notifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUserEmail, enabled }),
      });
      if (!res.ok) throw new Error('Failed to update notification preference');

      if (enabled) {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await fetch(`http://${IP_ADDRESS}:8081/api/users/push-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUserEmail, pushToken: token }),
          });
        }
      }
    } catch (err) {
      console.log('Toggle notifications error:', err.message);
      setNotificationsEnabled(!enabled); // revert on failure
    }
  };

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
        // User / auth
        currentUserEmail,
        setCurrentUserEmail,
        // Notifications
        notificationsEnabled,
        toggleNotifications,
        unreadCount,
        refreshUnreadCount,
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

export function useAppContext() {
  return useContext(AppContext);
}