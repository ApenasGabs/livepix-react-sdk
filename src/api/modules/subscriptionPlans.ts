import {
  CreatedSubscriptionPlanData,
  CreateSubscriptionPlanInput,
  GetSubscriptionPlansParams,
  SubscriptionPlanData,
  UpdateSubscriptionPlanInput,
} from "../../types";
import { buildQueryPath } from "../../utils/url";
import { ApiClient } from "../apiClient";

export type SubscriptionPlansAPI = {
  getSubscriptionPlans: (
    params?: GetSubscriptionPlansParams
  ) => Promise<SubscriptionPlanData[]>;
  createSubscriptionPlan: (
    input: CreateSubscriptionPlanInput
  ) => Promise<CreatedSubscriptionPlanData>;
  getSubscriptionPlan: (planId: string) => Promise<SubscriptionPlanData>;
  updateSubscriptionPlan: (
    planId: string,
    input: UpdateSubscriptionPlanInput
  ) => Promise<void>;
  deleteSubscriptionPlan: (planId: string) => Promise<void>;
};

/**
 * Cria o módulo funcional para os endpoints `/v2/subscriptions/plans` da LivePix API v2.
 */
export const createSubscriptionPlansApi = (
  apiClient: ApiClient
): SubscriptionPlansAPI => {
  return {
    getSubscriptionPlans: (params?: GetSubscriptionPlansParams) =>
      apiClient.get<SubscriptionPlanData[]>(
        buildQueryPath("/v2/subscriptions/plans", params)
      ),

    createSubscriptionPlan: (input: CreateSubscriptionPlanInput) =>
      apiClient.post<CreatedSubscriptionPlanData>(
        "/v2/subscriptions/plans",
        input
      ),

    getSubscriptionPlan: (planId: string) =>
      apiClient.get<SubscriptionPlanData>(
        `/v2/subscriptions/plans/${encodeURIComponent(planId)}`
      ),

    updateSubscriptionPlan: (
      planId: string,
      input: UpdateSubscriptionPlanInput
    ) =>
      apiClient.patch<void>(
        `/v2/subscriptions/plans/${encodeURIComponent(planId)}`,
        input
      ),

    deleteSubscriptionPlan: (planId: string) =>
      apiClient.delete<void>(
        `/v2/subscriptions/plans/${encodeURIComponent(planId)}`
      ),
  };
};

export default createSubscriptionPlansApi;
