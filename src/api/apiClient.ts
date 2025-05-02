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
  post: <T>(path: string, data: any) => Promise<T>;
  delete: <T>(path: string) => Promise<T>;
};

/**
 * Cria um cliente de API funcional com gerenciamento de autenticação
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
   * Obtém um token de acesso válido
   */
  const getAccessToken = async (): Promise<string> => {
    // Verifica se o token atual é válido
    if (accessToken && tokenExpiresAt && new Date() < tokenExpiresAt) {
      return accessToken;
    }

    const response = await axios.post<OAuthTokenResponse>(tokenUrl, {
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope,
    });

    accessToken = response.data.access_token;
    // Assume que expires_in é em segundos
    tokenExpiresAt = new Date(Date.now() + response.data.expires_in * 1000);

    return accessToken;
  };

  /**
   * Executa uma requisição autenticada
   */
  const requestWithAuth = async <T>(requestFn: RequestFn<T>): Promise<T> => {
    const token = await getAccessToken();
    return requestFn(token);
  };

  /**
   * Constrói a URL completa para um path
   */
  const buildUrl = (path: string): string => {
    // Remover barras duplicadas se o baseUrl já tiver uma barra no final
    // e o path começar com uma barra
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  /**
   * Requisição GET autenticada
   */
  const get = async <T>(path: string): Promise<T> => {
    return requestWithAuth(async (token) => {
      const url = buildUrl(path);
      const response = await axios.get<T>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    });
  };

  /**
   * Requisição POST autenticada
   */
  const post = async <T>(path: string, data: any): Promise<T> => {
    return requestWithAuth(async (token) => {
      const url = buildUrl(path);
      const response = await axios.post<T>(url, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    });
  };

  /**
   * Requisição DELETE autenticada
   */
  const deleteRequest = async <T>(path: string): Promise<T> => {
    return requestWithAuth(async (token) => {
      const url = buildUrl(path);
      const response = await axios.delete<T>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    });
  };

  return {
    requestWithAuth,
    get,
    post,
    delete: deleteRequest,
  };
};

export default createApiClient;
