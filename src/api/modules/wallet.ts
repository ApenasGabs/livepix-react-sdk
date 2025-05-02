import { TransactionData, WalletBalanceData } from "../../types";
import { ApiClient } from "../apiClient";

export type WalletAPI = {
  getWalletBalance: () => Promise<WalletBalanceData[]>;
  getWalletTransactions: (currency: string) => Promise<TransactionData[]>;
  getWalletReceivables: (currency: string) => Promise<TransactionData[]>;
};

export const createWalletApi = (apiClient: ApiClient): WalletAPI => {
  return {
    getWalletBalance: () => apiClient.get<WalletBalanceData[]>("/v2/wallet"),

    getWalletTransactions: (currency: string) =>
      apiClient.get<TransactionData[]>(`/v2/wallet/${currency}/transactions`),

    getWalletReceivables: (currency: string) =>
      apiClient.get<TransactionData[]>(`/v2/wallet/${currency}/receivables`),
  };
};

export default createWalletApi;
