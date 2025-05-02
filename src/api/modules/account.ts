import { AccountData } from "../../types";
import { ApiClient } from "../apiClient";

export type AccountAPI = {
  getAccount: () => Promise<AccountData>;
};

export const createAccountApi = (apiClient: ApiClient): AccountAPI => {
  return {
    getAccount: () => apiClient.get<AccountData>("/account"),
  };
};

export default createAccountApi;
