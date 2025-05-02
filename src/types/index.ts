declare type RequestFn<T> = (token: string) => Promise<T>;

export interface APIClientOptions {
  clientId: string;
  clientSecret: string;
  scope?: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface AccountData {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string | null;
}

export interface PaymentData {
  redirectUrl: string;
  reference: string;
}

export interface GetPaymentData {
  id: string;
  currency: string;
  amount: number;
  proof: string;
}

export interface CurrencyData {
  symbol: string;
  minimumAmount: number;
  decimals: number;
}

export interface WalletBalanceData {
  currency: string;
  balance: number;
  balanceHeld: number;
  balancePending: number;
}

export interface TransactionData {
  proof: string;
  amount: number;
  balance: number;
  releaseAt: number;
  timestamp: number;
}

export interface WebhookData {
  id: string;
  url: string;
}

export interface LivePixButtonProps {
  onClick?: () => void;
  label?: string;
  amount?: number;
  currency?: string;
  redirectUrl?: string;
  disabled?: boolean;
  clientId?: string;
  clientSecret?: string;
}

export interface UseLivePixConfig {
  clientId: string;
  clientSecret: string;
}

export interface UseLivePixReturn {
  livePix: any; // Substituir pelo tipo correto do LivePixSDK
  loading: boolean;
  error: Error | null;
}

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
}
