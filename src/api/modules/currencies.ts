import { CurrencyData } from "../../types";
import { ApiClient } from "../apiClient";

export type CurrenciesAPI = {
  getCurrencies: () => Promise<CurrencyData[]>;
};

export const createCurrenciesApi = (apiClient: ApiClient): CurrenciesAPI => {
  return {
    getCurrencies: () => apiClient.get<CurrencyData[]>("/currencies"),
  };
};

export default createCurrenciesApi;
