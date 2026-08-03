// types.ts
// Shared shapes for data returned by the backend.
// Field names mirror StockDTO / BrokerDTO on the Spring side.

export interface Broker {
  id: number | string;
  name: string;
  deepLink?: string | null;
  telephone?: string | null;
  address?: string | null;
}

export interface Stock {
  id: number | string;
  symbol: string;
  name: string;
  sector?: string;
  currentPrice: number;
  priceChangePercentage: number;
  logoColor?: string;
  history?: number[];
  verifiedBrokers?: Broker[];

  // From the GSE live feed
  volume?: number | null;

  // From the GSE company profile
  industry?: string | null;
  marketCap?: number | null;
  sharesOutstanding?: number | null;
  eps?: number | null;
  dps?: number | null;

  // Official company contacts, used for verification
  website?: string | null;
  companyEmail?: string | null;
  telephone?: string | null;
  address?: string | null;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  flag: string;
  price: number;
  changeValue: number;
  changePercent: number;
  positive: boolean;
  sparklineData: number[];
}

export interface TrendingStock {
  ticker: string;
  companyName: string;
  currentPrice: number;
  priceChangePercent: number;
  positive: boolean;
  logoColor: string;
  initials: string;
  sector?: string;
  sparklineData: number[];
}

export interface AcademicModule {
  id: number | string;
  category: string;
  question: string;
  answer: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  isVerified?: boolean;
  modulesCompleted?: number;
  streakDays?: number;
  portfolioValue?: number;
  portfolioReturnPct?: number;
  notificationsEnabled?: boolean;
  pushToken?: string | null;
  profilePhoto?: string | null;
}

// ── Portfolio tracker ──

export interface PortfolioLot {
  id: number;
  ticker: string;
  companyName?: string | null;
  shares: number;
  buyPrice: number;
  buyFees: number;
  brokerId?: number | null;
  purchaseDate: string; // ISO yyyy-mm-dd
  notes?: string | null;
}

export interface PortfolioDividend {
  id: number;
  ticker: string;
  amount: number;
  perShare?: number | null;
  paymentDate: string; // ISO yyyy-mm-dd
  notes?: string | null;
}

export interface AddLotRequest {
  ticker: string;
  companyName?: string;
  shares: number;
  buyPrice: number;
  buyFees: number;
  brokerId?: number | null;
  purchaseDate?: string;
  notes?: string;
}

export interface AddDividendRequest {
  ticker: string;
  amount: number;
  perShare?: number;
  paymentDate?: string;
  notes?: string;
}

export interface PortfolioSale {
  id: number;
  lotId: number;
  ticker: string;
  sharesSold: number;
  salePrice: number;
  saleFees: number;
  saleDate: string;
  notes?: string | null;
}

export interface AddSaleRequest {
  lotId: number;
  sharesSold: number;
  salePrice: number;
  saleFees: number;
  saleDate?: string;
  notes?: string;
}