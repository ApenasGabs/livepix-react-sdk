import { ApiClientConfig, createApiClient } from "./apiClient";
import { createAccountApi } from "./modules/account";
import { createCurrenciesApi } from "./modules/currencies";
import { createPaymentApi } from "./modules/payments";
import { createWalletApi } from "./modules/wallet";
import { createWebhookApi } from "./modules/webhooks";

export type LivePixSDK = {
  account: ReturnType<typeof createAccountApi>;
  payments: ReturnType<typeof createPaymentApi>;
  wallet: ReturnType<typeof createWalletApi>;
  webhooks: ReturnType<typeof createWebhookApi>;
  currencies: ReturnType<typeof createCurrenciesApi>;
};

export const createLivePix = (
  clientId: string,
  clientSecret: string
): LivePixSDK => {
  const config: ApiClientConfig = {
    clientId,
    clientSecret,
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

export default createLivePix;
