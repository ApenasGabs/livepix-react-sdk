import { TransactionData, WalletBalanceData } from "../../types";
import { ApiClient } from "../apiClient";

export type WalletAPI = {
  getWalletBalance: () => Promise<WalletBalanceData>;
  getWalletTransactions: (currency: string) => Promise<TransactionData[]>;
};

export const createWalletApi = (apiClient: ApiClient): WalletAPI => {
  return {
    getWalletBalance: () => apiClient.get<WalletBalanceData>("/wallet/balance"),

    getWalletTransactions: (currency: string) =>
      apiClient.get<TransactionData[]>(
        `/wallet/transactions?currency=${currency}`
      ),
  };
};

export default createWalletApi;
