// navigation/types.ts
import type { Stock, MarketIndex } from '../types';

// Every route in the app and what params it expects.
// Screens use these with StackScreenProps / CompositeScreenProps so that
// navigation calls and route params are type-checked.
export type RootStackParamList = {
  // ── Signed out ──
  Splash: undefined;
  Login: { autoEmail?: string; autoPassword?: string } | undefined;
  Register: undefined;
  VerifyOtp: { email: string };
  ForgotPassword: undefined;

  // ── Signed in ──
  MainTabs: { userName?: string } | undefined;
  Profile: undefined;
  AccountSettings: undefined;
  MyPortfolio: undefined;
  Notifications: undefined;
  IndexDetail: { index: MarketIndex };
  StockDetail: { stock: Stock };
};

export type MainTabParamList = {
  Home: { userName?: string } | undefined;
  Invest: undefined;
  Pulse: undefined;
  Learn: undefined;
};