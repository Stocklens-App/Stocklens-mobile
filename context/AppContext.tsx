// context/AppContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
// @ts-ignore - utils/registerForPushNotifications is still a plain JS module
import { registerForPushNotificationsAsync } from '../utils/registerForPushNotifications';
import type {
  Stock,
  MarketIndex,
  TrendingStock,
  AcademicModule,
  UserProfile,
} from '../types';

// Port the Spring backend listens on (see application.properties: server.port).
const API_PORT = 8081;

// Last-resort value if nothing else resolves.
const FALLBACK_BASE = `http://localhost:${API_PORT}`;

/**
 * In development, Expo tells the app which machine served the JS bundle —
 * Constants.expoConfig.hostUri looks like "192.168.1.42:8082". That host IS the
 * laptop running Metro, which is also the laptop running the backend, so we can
 * derive the API URL from it instead of anyone hardcoding an IP.
 *
 * This is why the IP no longer has to be edited by hand. Every teammate's phone
 * resolves their own machine automatically, on whatever network they're on.
 * Editing one shared constant is what caused the merge conflicts in this file's
 * history ("samuel kept his own ip adress here").
 *
 * Returns null in a production build, where there is no dev server.
 */
function baseFromExpoHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    // Older SDKs / bare workflow keep it here instead.
    (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost;

  const host = hostUri?.split(':')[0]?.trim();
  if (!host) return null;
  return `http://${host}:${API_PORT}`;
}

// Resolution order:
//   1. EXPO_PUBLIC_API_URL              — explicit override; wins (tunnels, staging, CI)
//   2. Expo's dev-server host           — automatic, correct on any network
//   3. app.json > expo.extra.apiBaseUrl — for release builds, where there is no dev server
//   4. FALLBACK_BASE                    — last resort
const configuredBase: string =
  process.env.EXPO_PUBLIC_API_URL ||
  baseFromExpoHost() ||
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ||
  FALLBACK_BASE;

// Trailing slashes would produce '//api/...' once axios joins the paths.
const BASE = configuredBase.replace(/\/+$/, '');

// Back-compat for screens that still build their own URLs. Prefer the shared `api`
// instance below — it is the only one that carries the auth token.
export const IP_ADDRESS = BASE.replace(/^https?:\/\//, '').split(':')[0];

// One shared axios instance — the token lives on it, so every call carries it.
//
// The timeout is not cosmetic. Axios has none by default, so if the backend is not
// running — or the phone is on a different network from the laptop — the request
// never settles. Every screen then sits on its spinner forever with nothing in the
// UI to explain why. With a timeout the request fails, the catch block runs, and
// the user sees the "check your connection" message the screens already have.
//
// 15s is deliberately generous: long enough for a slow mobile network and a cold
// Spring Boot start, short enough that nobody sits staring at a spinner wondering.
export const api: AxiosInstance = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

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
  scamAlerts: string[];
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
  modules: AcademicModule[];
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
  const [scamAlerts, setScamAlerts] = useState<string[]>([]);
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
  const [modules, setModules] = useState<AcademicModule[]>([]);
  const [modulesLoading, setModulesLoading] = useState<boolean>(true);
  const [modulesError, setModulesError] = useState<string | null>(null);

  const signOut = useCallback(async (): Promise<void> => {
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

  const signIn = useCallback(
    async (newToken: string, email: string, name: string): Promise<void> => {
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      await AsyncStorage.multiSet([
        ['token', newToken],
        ['email', email ?? ''],
        ['userName', name ?? ''],
      ]);
      setToken(newToken);
      setCurrentUserEmail(email);
      setUserName(name);
    },
    []
  );

  // Only a rejected token (401) signs the user out. A 403 from one misbehaving
  // endpoint must not tear down the whole session.
  useEffect(() => {
    const id = api.interceptors.response.use(
      (res) => res,
      (err: AxiosError) => {
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
      } catch (err) {
        console.log('Session restore error:', (err as Error).message);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const fetchHomeData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/home');
      setMarketIndices(response.data.marketIndices || []);
      setTrendingStocks(response.data.trendingStocks || []);
      setScamAlerts(response.data.scamAlerts || []);
    } catch (err) {
      setError('Failed to load data. Please check your connection.');
      console.log('AppContext home fetch error:', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStocks = useCallback(async (): Promise<void> => {
    try {
      setStocksLoading(true);
      setStocksError(null);
      const response = await api.get<Stock[]>('/api/stocks');
      setStocks(response.data || []);
    } catch (err) {
      setStocksError('Could not load stocks. Check your connection and try again.');
      setStocks([]);
      console.log('AppContext stocks fetch error:', (err as Error).message);
    } finally {
      setStocksLoading(false);
    }
  }, []);

  const fetchModules = useCallback(async (): Promise<void> => {
    try {
      setModulesLoading(true);
      setModulesError(null);
      const response = await api.get<AcademicModule[]>('/api/academic/all');
      setModules(response.data || []);
    } catch (err) {
      setModulesError('Could not load lessons. Check your connection.');
      setModules([]);
      console.log('AppContext modules fetch error:', (err as Error).message);
    } finally {
      setModulesLoading(false);
    }
  }, []);

  const refreshUnreadCount = useCallback(async (): Promise<void> => {
    try {
      const res = await api.get<{ unreadCount: number }>('/api/notifications/unread-count');
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.log('Unread count fetch error:', (err as Error).message);
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

    api
      .get<UserProfile>('/api/users/profile')
      .then(({ data }) => {
        if (!data) return;
        setNotificationsEnabled(!!data.notificationsEnabled);
        if (data.name) setUserName(data.name);

        if (data.notificationsEnabled) {
          registerForPushNotificationsAsync().then((pushToken: string | null) => {
            if (pushToken) {
              api
                .post('/api/users/push-token', { pushToken })
                .catch((err: Error) => console.log('Push token register error:', err.message));
            }
          });
        }
      })
      .catch((err: Error) => console.log('Profile load error (notifications):', err.message));
  }, [token]);

  const toggleNotifications = async (enabled: boolean): Promise<void> => {
    setNotificationsEnabled(enabled); // optimistic update
    try {
      await api.put('/api/users/notifications', { enabled });

      if (enabled) {
        const pushToken: string | null = await registerForPushNotificationsAsync();
        if (pushToken) {
          await api.post('/api/users/push-token', { pushToken });
        }
      }
    } catch (err) {
      console.log('Toggle notifications error:', (err as Error).message);
      setNotificationsEnabled(!enabled); // revert on failure
    }
  };

  const value: AppContextValue = {
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
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