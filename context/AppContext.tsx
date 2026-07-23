// context/AppContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync } from '../utils/registerForPushNotifications';

export const IP_ADDRESS = '10.100.132.167';

const BASE = `http://${IP_ADDRESS}:8081`;

// One shared axios instance — the token lives on it, so every call carries it.
export const api = axios.create({ baseURL: BASE });

interface MarketIndex {
  symbol: string;
  name: string;
  flag: string;
  price: number;
  changeValue: number;
  changePercent: number;
  positive: boolean;
  sparklineData: number[];
}

interface TrendingStock {
  ticker: string;
  companyName: string;
  currentPrice: number;
  priceChangePercent: number;
  positive: boolean;
  logoColor: string;
  initials: string;
}

interface ScamAlert {
  [key: string]: any;
}

interface Stock {
  [key: string]: any;
}

interface Module {
  [key: string]: any;
}

interface AppContextValue {
  // Auth
  token: string | null;
  booting: boolean;
  signIn: (newToken: string, email: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  currentUserEmail: string | null;
  userName: string | null;
  // Home
  marketIndices: MarketIndex[];
  trendingStocks: TrendingStock[];
  scamAlerts: ScamAlert[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  // Notifications
  notificationsEnabled: boolean;
  toggleNotifications: (enabled: boolean) => Promise<void>;
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  // Stocks
  stocks: Stock[];
  stocksLoading: boolean;
  stocksError: string | null;
  refetchStocks: () => Promise<void>;
  // Learn
  modules: Module[];
  modulesLoading: boolean;
  modulesError: string | null;
  refetchModules: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // ── Auth ──
  const [token, setToken] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [booting, setBooting] = useState<boolean>(true); // still reading stored session

  // ── Home tab data ──
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [trendingStocks, setTrendingStocks] = useState<TrendingStock[]>([]);
  const [scamAlerts, setScamAlerts] = useState<ScamAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // ── Stock list (Invest + Pulse tabs) ──
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stocksLoading, setStocksLoading] = useState<boolean>(true);
  const [stocksError, setStocksError] = useState<string | null>(null);

  // ── Learn tab modules ──
  const [modules, setModules] = useState<Module[]>([]);
  const [modulesLoading, setModulesLoading] = useState<boolean>(true);
  const [modulesError, setModulesError] = useState<string | null>(null);

  const signOut = useCallback(async () => {
    console.log('🔴 signOut called', new Error().stack);
    await AsyncStorage.multiRemove(['token', 'email', 'userName']);
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setCurrentUserEmail(null);
    setUserName(null);
    setMarketIndices([]);
    setTrendingStocks([]);
    setScamAlerts([]);
    setStocks([]);
    setModules([]);
    setUnreadCount(0);
    setNotificationsEnabled(false);
  }, []);

  const signIn = useCallback(async (newToken: string, email: string, name: string) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    await AsyncStorage.multiSet([
      ['token', newToken],
      ['email', email ?? ''],
      ['userName', name ?? ''],
    ]);
    setToken(newToken);
    setCurrentUserEmail(email);
    setUserName(name);
  }, []);

  // Only a rejected token (401) signs the user out. A 403 from one misbehaving
  // endpoint must not tear down the whole session.
  useEffect(() => {
    const id = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          signOut();
        }
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, [signOut]);

  // Restore a saved session on cold start.
  useEffect(() => {
    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem('token');
        const savedEmail = await AsyncStorage.getItem('email');
        const savedName = await AsyncStorage.getItem('userName');
        if (savedToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          setToken(savedToken);
          setCurrentUserEmail(savedEmail);
          setUserName(savedName);
        }
      } catch (err: any) {
        console.log('Session restore error:', err.message);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const fetchHomeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/home');
      setMarketIndices(response.data.marketIndices || []);
      setTrendingStocks(response.data.trendingStocks || []);
      setScamAlerts(response.data.scamAlerts || []);
    } catch (err: any) {
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
      const response = await api.get('/api/stocks');
      setStocks(response.data || []);
    } catch (err: any) {
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
      const response = await api.get('/api/academic/all');
      setModules(response.data || []);
    } catch (err: any) {
      setModulesError('Could not load lessons. Check your connection.');
      setModules([]);
      console.log('AppContext modules fetch error:', err.message);
    } finally {
      setModulesLoading(false);
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/api/notifications/unread-count');
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err: any) {
      console.log('Unread count fetch error:', err.message);
    }
  }, []);

  // Everything is behind auth now, so data loads only once a token exists.
  useEffect(() => {
    if (!token) return;
    fetchHomeData();
    fetchStocks();
    fetchModules();
    refreshUnreadCount();
  }, [token, fetchHomeData, fetchStocks, fetchModules, refreshUnreadCount]);

  // Load the signed-in user's notification preference and register for push.
  useEffect(() => {
    if (!token) return;

    api.get('/api/users/profile')
      .then(({ data }) => {
        if (!data) return;
        setNotificationsEnabled(!!data.notificationsEnabled);
        if (data.name) setUserName(data.name);

        if (data.notificationsEnabled) {
          registerForPushNotificationsAsync().then((pushToken) => {
            if (pushToken) {
              api.post('/api/users/push-token', { pushToken })
                .catch((err: any) => console.log('Push token register error:', err.message));
            }
          });
        }
      })
      .catch((err: any) => console.log('Profile load error (notifications):', err.message));
  }, [token]);

  const toggleNotifications = async (enabled: boolean) => {
    setNotificationsEnabled(enabled); // optimistic update
    try {
      await api.put('/api/users/notifications', { enabled });

      if (enabled) {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          await api.post('/api/users/push-token', { pushToken });
        }
      }
    } catch (err: any) {
      console.log('Toggle notifications error:', err.message);
      setNotificationsEnabled(!enabled); // revert on failure
    }
  };

  return (
    <AppContext.Provider
      value={{
        // Auth
        token,
        booting,
        signIn,
        signOut,
        currentUserEmail,
        userName,
        // Home
        marketIndices,
        trendingStocks,
        scamAlerts,
        loading,
        error,
        refetch: fetchHomeData,
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

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Backward-compat alias — pre-rewrite screens (e.g. the GSE / IndexDetailScreen)
// still import useAppData. Same hook, old name. Safe to remove once every screen
// has been migrated to useAppContext.
export const useAppData = useAppContext;