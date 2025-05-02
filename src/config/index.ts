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
      // Em ambiente de desenvolvimento local, usar o proxy configurado no Vite
      if (isLocalDevelopment()) {
        return "/oauth/token";
      }
      return getEnv(
        "VITE_LIVEPIX_TOKEN_URL",
        "https://auth.livepix.gg/oauth/token"
      );
    },
    scope: () => getEnv("VITE_LIVEPIX_SCOPE", "default_scope"),
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
