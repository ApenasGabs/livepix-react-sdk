// SDK funcional
export { createApiClient, type ApiClient, type ApiClientConfig } from "./api/apiClient";
export {
  createLivePix,
  initDefaultLivePix,
  type LivePixSDK,
  type LivePixSDKOptions,
} from "./api/livePix";
export { createAccountApi, type AccountAPI } from "./api/modules/account";
export { createAlertsApi, type AlertsAPI } from "./api/modules/alerts";
export { createControlsApi, type ControlsAPI } from "./api/modules/controls";
export {
  createCurrenciesApi,
  type CurrenciesAPI,
} from "./api/modules/currencies";
export { createMessagesApi, type MessagesAPI } from "./api/modules/messages";
export { createPaymentApi, type PaymentAPI } from "./api/modules/payments";
export { createRewardsApi, type RewardsAPI } from "./api/modules/rewards";
export {
  createSubscriptionPlansApi,
  type SubscriptionPlansAPI,
} from "./api/modules/subscriptionPlans";
export {
  createSubscriptionsApi,
  type SubscriptionsAPI,
} from "./api/modules/subscriptions";
export { createWalletApi, type WalletAPI } from "./api/modules/wallet";
export { createWebhookApi, type WebhookAPI } from "./api/modules/webhooks";

// Componentes
export { default as LivePixButton } from "./components/LivePixButton";

// Hooks e helpers de cliente
export { default as useLivePix } from "./hooks/useLivePix";
export {
  assertSafeRedirectUrl,
  buildPublicDonationUrl,
  isSafeHttpUrl,
  resolveBffPaymentEndpoint,
} from "./utils/url";

// Utilitários
export {
  getEnv,
  hasBrowserSecretExposure,
  isBrowserRuntime,
  isSecretEnvKey,
  isServerRuntime,
  warnBrowserSecretExposure,
} from "./utils/env";

// Configuração centralizada
export {
  CONFIG,
  getClientId,
  getClientSecret,
  hasValidCredentials,
} from "./config";

// Tipos
export * from "./types";
