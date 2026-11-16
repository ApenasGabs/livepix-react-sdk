export type RequestFn<T> = (token: string) => Promise<T>;

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

export interface MessageData {
  id: string;
  proof: string;
  reference: string;
  username: string;
  message: string;
  amount: number;
  currency: string;
  flagged: boolean;
  createdAt: string;
}

export interface GetMessagesParams {
  proof?: string;
  reference?: string;
  currency?: string;
  page?: number;
  limit?: number;
}

export interface CreateMessageInput {
  username: string;
  message: string;
  amount: number;
  currency: string;
  redirectUrl: string;
}

export interface CreateMessageData {
  reference: string;
  redirectUrl: string;
}

export interface SubscriptionPlanData {
  id: string;
  slug: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  createdAt: string;
}

export interface GetSubscriptionPlansParams {
  page?: number;
  limit?: number;
}

export interface CreateSubscriptionPlanInput {
  slug: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
}

export interface CreatedSubscriptionPlanData {
  id: string;
}

export interface UpdateSubscriptionPlanInput {
  slug?: string;
  name?: string;
  description?: string;
  amount?: number;
}

export type SubscriptionStatus = "active" | "pending" | "cancelled";

export type SubscriptionRecurrence =
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "yearly";

export interface SubscriptionData {
  id: string;
  subscriber: string;
  months: number;
  currency: string;
  amount: number;
  recurrence: SubscriptionRecurrence;
  status: SubscriptionStatus;
  renewAt: string;
  updatedAt: string;
  createdAt: string;
}

export interface GetSubscriptionsParams {
  status?: SubscriptionStatus;
  currency?: string;
  page?: number;
  limit?: number;
}

export interface SubscriptionSubscriberInput {
  username: string;
  email: string;
}

export interface CreateSubscriptionInput {
  planId: string;
  recurrence: SubscriptionRecurrence;
  subscriber: SubscriptionSubscriberInput;
  redirectUrl: string;
}

export interface CreateSubscriptionData {
  reference: string;
  redirectUrl: string;
}

export interface GetSubscriptionTransactionsParams {
  proof?: string;
  page?: number;
  limit?: number;
}

export interface SubscriptionTransactionData {
  id: string;
  proof: string;
  amount: number;
  createdAt: string;
}

export interface RewardData {
  id: string;
  type: string;
  title: string;
  description: string;
  triggers: Record<string, unknown>[];
  config: Record<string, unknown>;
  amount: number;
  status: string;
  updatedAt: string;
  createdAt: string;
}

export interface RewardGrantUser {
  id: string;
  username: string;
}

export interface RewardGrantData {
  id: string;
  user: RewardGrantUser;
  data: Record<string, unknown>;
  status: string;
  updatedAt: string;
  createdAt: string;
}

export interface ControlsData {
  autoPlay: boolean;
}

export interface UpdateControlsInput {
  autoPlay: boolean;
}

export interface LivePixClientConfig {
  redirectUrl?: string;
  /**
   * Endpoint BFF (Backend-For-Frontend) para criação segura de pagamento no servidor (POST)
   * Ex: "/api/livepix/payments"
   */
  paymentEndpoint?: string;
  /**
   * URL base de proxy/BFF para chamadas seguras ao backend próprio (ex: "/api/livepix")
   */
  proxyUrl?: string;
  /**
   * Nome de usuário público do criador na LivePix (ex: "apenasgabs" -> https://livepix.gg/apenasgabs)
   */
  username?: string;
  /**
   * ID público do cliente (opcional)
   */
  clientId?: string;
  /**
   * @deprecated Nunca passe `clientSecret` no frontend React. Use `paymentEndpoint`, `proxyUrl`, `username` ou `redirectUrl`.
   */
  clientSecret?: string;
}

export interface LivePixButtonProps extends LivePixClientConfig {
  onClick?: () => void;
  label?: string;
  amount?: number;
  currency?: string;
  disabled?: boolean;
}

export type UseLivePixConfig = LivePixClientConfig;

export interface LivePixClientSDK {
  mode: "bff" | "public";
  payments: {
    createPayment: (
      amount?: number,
      currency?: string,
      redirectUrl?: string
    ) => Promise<PaymentData>;
  };
  getPublicUrl: () => string | null;
}

export interface UseLivePixReturn {
  livePix: LivePixClientSDK | null;
  createPayment: (
    amount?: number,
    currency?: string,
    redirectUrl?: string
  ) => Promise<PaymentData>;
  getPublicUrl: () => string | null;
  loading: boolean;
  error: Error | null;
}

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
}
