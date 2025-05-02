import { CONFIG } from "../config";
import { ApiClientConfig, createApiClient } from "./apiClient";
import { createAccountApi } from "./modules/account";
import { createCurrenciesApi } from "./modules/currencies";
import { createPaymentApi } from "./modules/payments";
import { createWalletApi } from "./modules/wallet";
import { createWebhookApi } from "./modules/webhooks";

export type LivePixSDKOptions = {
  clientId?: string;
  clientSecret?: string;
  scope?: string;
  tokenUrl?: string;
  baseUrl?: string;
};

export type LivePixSDK = {
  account: ReturnType<typeof createAccountApi>;
  payments: ReturnType<typeof createPaymentApi>;
  wallet: ReturnType<typeof createWalletApi>;
  webhooks: ReturnType<typeof createWebhookApi>;
  currencies: ReturnType<typeof createCurrenciesApi>;
};

/**
 * Cria uma instância do SDK LivePix
 * @param clientId - ID do cliente LivePix (opcional se definido nas configurações)
 * @param clientSecret - Segredo do cliente LivePix (opcional se definido nas configurações)
 * @param options - Opções adicionais de configuração
 * @returns Instância do SDK LivePix
 */
export const createLivePix = (
  clientIdParam?: string,
  clientSecretParam?: string,
  options: LivePixSDKOptions = {}
): LivePixSDK => {
  // Usar as credenciais fornecidas ou obter da configuração centralizada
  const clientId = clientIdParam || options.clientId || CONFIG.auth.clientId();
  const clientSecret =
    clientSecretParam || options.clientSecret || CONFIG.auth.clientSecret();

  // Validar credenciais
  if (!clientId || !clientSecret) {
    throw new Error(
      "Credenciais da API não configuradas. Forneça clientId e clientSecret."
    );
  }

  const config: ApiClientConfig = {
    clientId,
    clientSecret,
    scope: options.scope || CONFIG.auth.scope(),
    tokenUrl: options.tokenUrl || CONFIG.auth.tokenUrl(),
    baseUrl: options.baseUrl || CONFIG.api.baseUrl(),
  };

  const apiClient = createApiClient(config);

  return {
    account: createAccountApi(apiClient),
    payments: createPaymentApi(apiClient),
    wallet: createWalletApi(apiClient),
    webhooks: createWebhookApi(apiClient),
    currencies: createCurrenciesApi(apiClient),
  };
};

/**
 * Inicializa o SDK com configurações padrão do ambiente
 * Útil quando as credenciais já estão definidas nas variáveis de ambiente
 */
export const initDefaultLivePix = (): LivePixSDK => {
  return createLivePix();
};

export default createLivePix;
