import axios from "axios";
import { CONFIG } from "../config";
import { OAuthTokenResponse } from "../types";

export type RequestFn<T> = (token: string) => Promise<T>;

export type ApiClientConfig = {
  clientId: string;
  clientSecret: string;
  scope?: string;
  tokenUrl?: string;
  baseUrl?: string;
};

export type ApiClient = {
  requestWithAuth: <T>(requestFn: RequestFn<T>) => Promise<T>;
  get: <T>(path: string) => Promise<T>;
  post: <T>(path: string, data?: unknown) => Promise<T>;
  put: <T>(path: string, data?: unknown) => Promise<T>;
  patch: <T>(path: string, data?: unknown) => Promise<T>;
  delete: <T>(path: string) => Promise<T>;
  getAccessToken: (forceRefresh?: boolean) => Promise<string>;
};

/**
 * Desempacota o envelope `{ data: T }` da LivePix API v2.
 * Se a resposta possuir a propriedade `data`, retorna `response.data.data`.
 * Caso contrário, retorna `response.data` como fallback.
 */
export const unwrapResponse = <T>(response: { data: unknown }): T => {
  const body = response?.data;
  if (body !== null && typeof body === "object" && "data" in body) {
    return (body as { data: T }).data;
  }
  return body as T;
};

/**
 * Cria um cliente de API funcional com gerenciamento de autenticação OAuth2 e suporte a LivePix v2
 */
export const createApiClient = (config: ApiClientConfig): ApiClient => {
  const {
    clientId,
    clientSecret,
    scope = CONFIG.auth.scope(),
    tokenUrl = CONFIG.auth.tokenUrl(),
    baseUrl = CONFIG.api.baseUrl(),
  } = config;

  // Estado interno (encapsulado no closure)
  let accessToken: string | null = null;
  let tokenExpiresAt: Date | null = null;

  /**
   * Obtém um token de acesso válido via application/x-www-form-urlencoded
   * Se forceRefresh for true, ignora o cache interno e busca um novo token
   */
  const getAccessToken = async (forceRefresh = false): Promise<string> => {
    // Verifica se o token atual é válido no cache
    if (!forceRefresh && accessToken && tokenExpiresAt && new Date() < tokenExpiresAt) {
      return accessToken;
    }

    const params = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });

    if (scope) {
      params.append("scope", scope);
    }

    const response = await axios.post<OAuthTokenResponse>(tokenUrl, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const body = response.data;
    const payload =
      body !== null && typeof body === "object" && "data" in body
        ? (body as { data: OAuthTokenResponse }).data
        : body;

    if (!payload?.access_token) {
      throw new Error("Resposta do endpoint OAuth não contém access_token válido.");
    }

    const token = String(payload.access_token);
    accessToken = token;

    // Assume que expires_in é em segundos com margem de segurança de 60 segundos
    const expiresIn = Number(payload.expires_in) || 3600;
    tokenExpiresAt = new Date(Date.now() + Math.max(expiresIn - 60, 10) * 1000);

    return token;
  };

  /**
   * Executa uma requisição autenticada com retry transparente em HTTP 401
   */
  const requestWithAuth = async <T>(requestFn: RequestFn<T>): Promise<T> => {
    const token = await getAccessToken();
    try {
      return await requestFn(token);
    } catch (error: unknown) {
      const is401 =
        error !== null &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 401;

      if (is401) {
        // Token expirado ou rejeitado: renova forçadamente e repete uma única vez
        const freshToken = await getAccessToken(true);
        return await requestFn(freshToken);
      }
      throw error;
    }
  };

  /**
   * Constrói a URL completa para um path
   */
  const buildUrl = (path: string): string => {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  /**
   * Requisição GET autenticada com desempacotamento de envelope { data: T }
   */
  const get = async <T>(path: string): Promise<T> => {
    return requestWithAuth(async (token) => {
      const url = buildUrl(path);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return unwrapResponse<T>(response);
    });
  };

  /**
   * Requisição POST autenticada com desempacotamento de envelope { data: T }
   */
  const post = async <T>(path: string, data?: unknown): Promise<T> => {
    return requestWithAuth(async (token) => {
      const url = buildUrl(path);
      const response = await axios.post(url, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return unwrapResponse<T>(response);
    });
  };

  /**
   * Requisição PUT autenticada com desempacotamento de envelope { data: T }
   */
  const put = async <T>(path: string, data?: unknown): Promise<T> => {
    return requestWithAuth(async (token) => {
      const url = buildUrl(path);
      const response = await axios.put(url, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return unwrapResponse<T>(response);
    });
  };

  /**
   * Requisição PATCH autenticada com desempacotamento de envelope { data: T }
   */
  const patch = async <T>(path: string, data?: unknown): Promise<T> => {
    return requestWithAuth(async (token) => {
      const url = buildUrl(path);
      const response = await axios.patch(url, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return unwrapResponse<T>(response);
    });
  };

  /**
   * Requisição DELETE autenticada com desempacotamento de envelope { data: T }
   */
  const deleteRequest = async <T>(path: string): Promise<T> => {
    return requestWithAuth(async (token) => {
      const url = buildUrl(path);
      const response = await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return unwrapResponse<T>(response);
    });
  };

  return {
    requestWithAuth,
    get,
    post,
    put,
    patch,
    delete: deleteRequest,
    getAccessToken,
  };
};

export default createApiClient;
