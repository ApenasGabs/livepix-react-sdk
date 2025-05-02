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

// Hooks
export { default as useLivePix } from "./hooks/useLivePix";

// Utilitários
export { getEnv } from "./utils/env";

// Configuração centralizada
export {
  CONFIG,
  getClientId,
  getClientSecret,
  hasValidCredentials,
} from "./config";

// Tipos
export * from "./types";
