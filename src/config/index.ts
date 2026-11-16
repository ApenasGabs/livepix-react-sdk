import {
  getEnv,
  hasBrowserSecretExposure,
  isBrowserRuntime,
  warnBrowserSecretExposure,
} from "../utils/env";

/**
 * Configuração centralizada do SDK LivePix (Arquitetura Dual Server/Client)
 * - Server-Side (Node.js / BFF): suporta `LIVEPIX_CLIENT_ID` e `LIVEPIX_CLIENT_SECRET`
 * - Client-Side (React / Browser): opera via BFF (`paymentEndpoint` / `proxyUrl`) ou link público (`username` / `redirectUrl`)
 *   sem nunca exigir ou expor `clientSecret`.
 */
export const CONFIG = {
  // API e Autenticação (Server-Side OAuth2)
  auth: {
    clientId: () => getClientId(),
    clientSecret: () => getClientSecret(),
    tokenUrl: () => {
      const customUrl =
        getEnv("VITE_LIVEPIX_TOKEN_URL") || getEnv("LIVEPIX_TOKEN_URL");
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
        getEnv(
          "LIVEPIX_SCOPE",
          "payments:read payments:write offline account:read currencies:read rewards:read rewards:write messages:read messages:write subscriptions:read subscriptions:write subscription-plans:read subscription-plans:write wallet:read webhooks controls"
        )
      ),
  },

  // URLs de serviço
  api: {
    baseUrl: () => {
      // Em ambiente de desenvolvimento local, usar o proxy configurado no Vite
      if (isLocalDevelopment()) {
        return "/api";
      }
      return getEnv(
        "VITE_LIVEPIX_API_URL",
        getEnv("LIVEPIX_API_URL", "https://api.livepix.gg")
      );
    },
  },

  // Configurações seguras para Client-Side (React / Browser)
  client: {
    paymentEndpoint: () =>
      getEnv(
        "VITE_LIVEPIX_PAYMENT_ENDPOINT",
        getEnv("REACT_APP_LIVEPIX_PAYMENT_ENDPOINT", "")
      ),
    proxyUrl: () =>
      getEnv(
        "VITE_LIVEPIX_PROXY_URL",
        getEnv("REACT_APP_LIVEPIX_PROXY_URL", "")
      ),
    username: () =>
      getEnv(
        "VITE_LIVEPIX_USERNAME",
        getEnv("REACT_APP_LIVEPIX_USERNAME", "")
      ),
  },

  // Configurações de pagamento padrão
  payment: {
    defaultCurrency: () =>
      getEnv(
        "VITE_LIVEPIX_DEFAULT_CURRENCY",
        getEnv("LIVEPIX_DEFAULT_CURRENCY", "BRL")
      ),
    defaultRedirectUrl: () => {
      const browserHref =
        typeof window !== "undefined" && window.location
          ? window.location.href
          : "";
      return getEnv(
        "VITE_LIVEPIX_DEFAULT_REDIRECT_URL",
        getEnv("LIVEPIX_DEFAULT_REDIRECT_URL", browserHref)
      );
    },
  },
};

/**
 * Verifica se o ambiente atual é de desenvolvimento local (localhost)
 */
const isLocalDevelopment = (): boolean => {
  if (
    typeof process !== "undefined" &&
    (process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined)
  ) {
    return false;
  }
  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  }
  return false;
};

/**
 * Obtém o client ID da LivePix considerando diferentes variáveis de ambiente.
 * No servidor (Node.js), prioriza `LIVEPIX_CLIENT_ID`.
 * No navegador, nunca faz fallback para `LIVEPIX_CLIENT_ID`.
 */
export const getClientId = (): string => {
  if (!isBrowserRuntime()) {
    return (
      getEnv("LIVEPIX_CLIENT_ID") ||
      getEnv("VITE_LIVEPIX_CLIENT_ID") ||
      getEnv("REACT_APP_LIVEPIX_CLIENT_ID", "")
    );
  }
  return (
    getEnv("VITE_LIVEPIX_CLIENT_ID") ||
    getEnv("REACT_APP_LIVEPIX_CLIENT_ID", "")
  );
};

/**
 * Obtém o client secret da LivePix exclusivamente em runtime Server-Side (Node.js).
 * Em ambiente de navegador (`isBrowserRuntime()`), retorna sempre `""` e emite alerta
 * caso alguma variável secreta esteja exposta no runtime do navegador.
 */
export const getClientSecret = (): string => {
  if (isBrowserRuntime()) {
    if (hasBrowserSecretExposure()) {
      warnBrowserSecretExposure("getClientSecret");
    }
    return "";
  }
  return getEnv("LIVEPIX_CLIENT_SECRET", "");
};

/**
 * Verifica se o SDK tem credenciais/configuração válidas para o runtime atual:
 * - No servidor (Node.js): exige `clientId` e `clientSecret` válidos.
 * - No navegador (React): verifica se há `paymentEndpoint`, `proxyUrl` ou `username` configurados.
 */
export const hasValidCredentials = (): boolean => {
  if (isBrowserRuntime()) {
    return Boolean(
      CONFIG.client.paymentEndpoint() ||
        CONFIG.client.proxyUrl() ||
        CONFIG.client.username()
    );
  }

  const clientId = getClientId();
  const clientSecret = getClientSecret();

  return Boolean(
    clientId &&
      clientSecret &&
      clientId !== "seu_client_id_aqui" &&
      clientSecret !== "seu_client_secret_aqui"
  );
};

export default CONFIG;
