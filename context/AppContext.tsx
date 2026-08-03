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
// @ts-ignore - utils/registerForPushNotifications is still a plain JS module
import { registerForPushNotificationsAsync } from '../utils/registerForPushNotifications';
import type {
  Stock,
  MarketIndex,
  TrendingStock,
  AcademicModule,
  UserProfile,
  PortfolioLot,
  PortfolioDividend,
  AddLotRequest,
  AddDividendRequest,
} from '../types';

// current backend IP
// export const IP_ADDRESS = '10.36.12.150';
const BASE = `https://backend-production-ec63.up.railway.app`;

// One shared axios instance — the token lives on it, so every call carries it.
export const api: AxiosInstance = axios.create({ baseURL: BASE });

interface AppContextValue {
  // Auth
  token: string | null;
  booting: boolean;
  signIn: (newToken: string, email: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  currentUserEmail: string | null;
  userName: string | null;
  profilePhoto: string | null;
  updateProfilePhoto: (dataUri: string | null) => Promise<void>;

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

  // Portfolio
  lots: PortfolioLot[];
  dividends: PortfolioDividend[];
  portfolioLoading: boolean;
  portfolioError: string | null;
  refetchPortfolio: () => Promise<void>;
  addLot: (req: AddLotRequest) => Promise<PortfolioLot>;
  updateLot: (id: number, req: AddLotRequest) => Promise<PortfolioLot>;
  deleteLot: (id: number) => Promise<void>;
  addDividend: (req: AddDividendRequest) => Promise<PortfolioDividend>;
  deleteDividend: (id: number) => Promise<void>;
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
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
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

  // ── Portfolio tab ──
  const [lots, setLots] = useState<PortfolioLot[]>([]);
  const [dividends, setDividends] = useState<PortfolioDividend[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState<boolean>(true);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  const signOut = useCallback(async (): Promise<void> => {
    await AsyncStorage.multiRemove(['token', 'email', 'userName']);
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setCurrentUserEmail(null);
    setUserName(null);
    setProfilePhoto(null);
    setMarketIndices([]);
    setTrendingStocks([]);
    setScamAlerts([]);
    setStocks([]);
    setModules([]);
    setLots([]);
    setDividends([]);
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

  const fetchPortfolio = useCallback(async (): Promise<void> => {
    try {
      setPortfolioLoading(true);
      setPortfolioError(null);
      const [lotsRes, divRes] = await Promise.all([
        api.get<PortfolioLot[]>('/portfolio-tracker/lots'),
        api.get<PortfolioDividend[]>('/portfolio-tracker/dividends'),
      ]);
      setLots(lotsRes.data || []);
      setDividends(divRes.data || []);
    } catch (err) {
      setPortfolioError('Could not load your portfolio. Check your connection.');
      console.log('AppContext portfolio fetch error:', (err as Error).message);
    } finally {
      setPortfolioLoading(false);
    }
  }, []);

  const addLot = useCallback(async (req: AddLotRequest): Promise<PortfolioLot> => {
    const { data } = await api.post<PortfolioLot>('/portfolio-tracker/lots', req);
    setLots((prev) => [data, ...prev]);
    return data;
  }, []);

  const updateLot = useCallback(
    async (id: number, req: AddLotRequest): Promise<PortfolioLot> => {
      const { data } = await api.put<PortfolioLot>(`/portfolio-tracker/lots/${id}`, req);
      setLots((prev) => prev.map((l) => (l.id === id ? data : l)));
      return data;
    },
    []
  );

  const deleteLot = useCallback(async (id: number): Promise<void> => {
    await api.delete(`/portfolio-tracker/lots/${id}`);
    setLots((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const addDividend = useCallback(async (req: AddDividendRequest): Promise<PortfolioDividend> => {
    const { data } = await api.post<PortfolioDividend>('/portfolio-tracker/dividends', req);
    setDividends((prev) => [data, ...prev]);
    return data;
  }, []);

  const deleteDividend = useCallback(async (id: number): Promise<void> => {
    await api.delete(`/portfolio-tracker/dividends/${id}`);
    setDividends((prev) => prev.filter((d) => d.id !== id));
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
    fetchPortfolio();
    refreshUnreadCount();
  }, [token, fetchHomeData, fetchStocks, fetchModules, fetchPortfolio, refreshUnreadCount]);

  // Load the signed-in user's profile — notification preference, photo, push.
  useEffect(() => {
    if (!token) return;
    api
      .get<UserProfile>('/api/users/profile')
      .then(({ data }) => {
        if (!data) return;
        setNotificationsEnabled(!!data.notificationsEnabled);
        if (data.name) setUserName(data.name);
        setProfilePhoto(data.profilePhoto ?? null);
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
    setNotificationsEnabled(enabled); // optimistic
    try {
      await api.put('/api/users/notifications', { enabled });
    } catch (err) {
      console.log('Toggle notifications error:', (err as Error).message);
      setNotificationsEnabled(!enabled); // revert ONLY if the save itself failed
      return;
    }
    // Best-effort push registration. Fails in Expo Go (unsupported since SDK 53),
    // works in the built APK. Must never revert the saved preference.
    if (enabled) {
      try {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          await api.post('/api/users/push-token', { pushToken });
        }
      } catch (err) {
        console.log('Push registration skipped (unsupported in Expo Go):', (err as Error).message);
      }
    }
  };

  const updateProfilePhoto = async (dataUri: string | null): Promise<void> => {
    const previous = profilePhoto;
    setProfilePhoto(dataUri); // optimistic
    try {
      await api.put('/api/users/photo', { photo: dataUri ?? '' });
    } catch (err) {
      console.log('Update profile photo error:', (err as Error).message);
      setProfilePhoto(previous); // revert on failure
      throw err; // let the screen surface an alert
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
    profilePhoto,
    updateProfilePhoto,

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

    // Portfolio
    lots,
    dividends,
    portfolioLoading,
    portfolioError,
    refetchPortfolio: fetchPortfolio,
    addLot,
    updateLot,
    deleteLot,
    addDividend,
    deleteDividend,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return ctx;
}

// Backwards-compatible alias — older screens imported useAppData.
export const useAppData = useAppContext;