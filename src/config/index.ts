import { getEnv } from "../utils/env";

/**
 * Configuração centralizada do SDK LivePix
 * Esse objeto contém todas as configurações necessárias para o funcionamento do SDK
 * independentemente do ambiente ou prefixo das variáveis de ambiente.
 */
export const CONFIG = {
  // API e Autenticação
  auth: {
    clientId: () => getClientId(),
    clientSecret: () => getClientSecret(),
    tokenUrl: () => {
      const customUrl = getEnv("VITE_LIVEPIX_TOKEN_URL");
      if (customUrl) {
        return customUrl;
      }
      // Em ambiente de desenvolvimento local, usar o proxy configurado no Vite
      if (isLocalDevelopment()) {
        return "/oauth2/token";
      }
      return "https://oauth.livepix.gg/oauth2/token";
    },
    scope: () =>
      getEnv(
        "VITE_LIVEPIX_SCOPE",
        "payments:read payments:write offline account:read currencies:read rewards:read rewards:write messages:read messages:write subscriptions:read subscriptions:write subscription-plans:read subscription-plans:write wallet:read webhooks controls"
      ),
  },

  // URLs de serviço
  api: {
    baseUrl: () => {
      // Em ambiente de desenvolvimento local, usar o proxy configurado no Vite
      if (isLocalDevelopment()) {
        return "/api";
      }
      return getEnv("VITE_LIVEPIX_API_URL", "https://api.livepix.gg");
    },
  },

  // Configurações de pagamento padrão
  payment: {
    defaultCurrency: () => getEnv("VITE_LIVEPIX_DEFAULT_CURRENCY", "BRL"),
    defaultRedirectUrl: () =>
      getEnv("VITE_LIVEPIX_DEFAULT_REDIRECT_URL", window.location.href),
  },
};

/**
 * Verifica se o ambiente atual é de desenvolvimento local (localhost)
 */
function isLocalDevelopment(): boolean {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
    return false;
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  }
  return false;
}

/**
 * Obtém o client ID da LivePix considerando diferentes variáveis de ambiente.
 * Ordem de prioridade:
 * 1. VITE_LIVEPIX_CLIENT_ID
 * 2. REACT_APP_LIVEPIX_CLIENT_ID
 * 3. LIVEPIX_CLIENT_ID
 */
export function getClientId(): string {
  return (
    getEnv("VITE_LIVEPIX_CLIENT_ID") ||
    getEnv("REACT_APP_LIVEPIX_CLIENT_ID") ||
    getEnv("LIVEPIX_CLIENT_ID", "")
  );
}

/**
 * Obtém o client secret da LivePix considerando diferentes variáveis de ambiente.
 * Ordem de prioridade:
 * 1. VITE_LIVEPIX_CLIENT_SECRET
 * 2. REACT_APP_LIVEPIX_CLIENT_SECRET
 * 3. LIVEPIX_CLIENT_SECRET
 */
export function getClientSecret(): string {
  return (
    getEnv("VITE_LIVEPIX_CLIENT_SECRET") ||
    getEnv("REACT_APP_LIVEPIX_CLIENT_SECRET") ||
    getEnv("LIVEPIX_CLIENT_SECRET", "")
  );
}

/**
 * Verifica se o SDK tem credenciais válidas para acessar a API
 */
export function hasValidCredentials(): boolean {
  const clientId = getClientId();
  const clientSecret = getClientSecret();

  return Boolean(
    clientId &&
      clientSecret &&
      clientId !== "seu_client_id_aqui" &&
      clientSecret !== "seu_client_secret_aqui"
  );
}

export default CONFIG;
