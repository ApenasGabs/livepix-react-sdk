// SDK funcional
export { createApiClient } from "./api/apiClient";
export { createLivePix, initDefaultLivePix } from "./api/livePix";
export { createAccountApi } from "./api/modules/account";
export { createCurrenciesApi } from "./api/modules/currencies";
export { createPaymentApi } from "./api/modules/payments";
export { createWalletApi } from "./api/modules/wallet";
export { createWebhookApi } from "./api/modules/webhooks";

// Componentes
export { default as LivePixButton } from "./components/LivePixButton";

// Hooks e helpers de cliente
export {
  buildPublicDonationUrl,
  default as useLivePix,
  resolveBffPaymentEndpoint,
} from "./hooks/useLivePix";

// Utilitários
export {
  getEnv,
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
