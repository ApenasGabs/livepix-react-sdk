import {
  CreateSubscriptionData,
  CreateSubscriptionInput,
  GetSubscriptionsParams,
  GetSubscriptionTransactionsParams,
  SubscriptionData,
  SubscriptionTransactionData,
} from "../../types";
import { buildQueryPath } from "../../utils/url";
import { ApiClient } from "../apiClient";

export {
  createSubscriptionPlansApi,
  type SubscriptionPlansAPI,
} from "./subscriptionPlans";

export type SubscriptionsAPI = {
  getSubscriptions: (
    params?: GetSubscriptionsParams
  ) => Promise<SubscriptionData[]>;
  createSubscription: (
    input: CreateSubscriptionInput
  ) => Promise<CreateSubscriptionData>;
  getSubscription: (subscriptionId: string) => Promise<SubscriptionData>;
  getSubscriptionTransactions: (
    subscriptionId: string,
    params?: GetSubscriptionTransactionsParams
  ) => Promise<SubscriptionTransactionData[]>;
};

/**
 * Cria o módulo funcional para os endpoints `/v2/subscriptions` da LivePix API v2.
 */
export const createSubscriptionsApi = (
  apiClient: ApiClient
): SubscriptionsAPI => {
  return {
    getSubscriptions: (params?: GetSubscriptionsParams) =>
      apiClient.get<SubscriptionData[]>(
        buildQueryPath("/v2/subscriptions", params)
      ),

    createSubscription: (input: CreateSubscriptionInput) =>
      apiClient.post<CreateSubscriptionData>("/v2/subscriptions", input),

    getSubscription: (subscriptionId: string) =>
      apiClient.get<SubscriptionData>(
        `/v2/subscriptions/${encodeURIComponent(subscriptionId)}`
      ),

    getSubscriptionTransactions: (
      subscriptionId: string,
      params?: GetSubscriptionTransactionsParams
    ) =>
      apiClient.get<SubscriptionTransactionData[]>(
        buildQueryPath(
          `/v2/subscriptions/${encodeURIComponent(subscriptionId)}/transactions`,
          params
        )
      ),
  };
};

export default createSubscriptionsApi;
