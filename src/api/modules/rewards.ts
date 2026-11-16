import { RewardData, RewardGrantData } from "../../types";
import { ApiClient } from "../apiClient";

export type RewardsAPI = {
  getRewards: () => Promise<RewardData[]>;
  getRewardGrants: (rewardId: string) => Promise<RewardGrantData[]>;
};

/**
 * Cria o módulo funcional para os endpoints `/v2/rewards` da LivePix API v2.
 */
export const createRewardsApi = (apiClient: ApiClient): RewardsAPI => {
  return {
    getRewards: () => apiClient.get<RewardData[]>("/v2/rewards"),

    getRewardGrants: (rewardId: string) =>
      apiClient.get<RewardGrantData[]>(
        `/v2/rewards/${encodeURIComponent(rewardId)}/grants`
      ),
  };
};

export default createRewardsApi;
