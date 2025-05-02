import { GetPaymentData, PaymentData } from "../../types";
import { ApiClient } from "../apiClient";

export type PaymentAPI = {
  createPayment: (
    amount: number,
    currency: string,
    redirectUrl: string
  ) => Promise<PaymentData>;
  getPayments: () => Promise<GetPaymentData[]>;
  getPayment: (id: string) => Promise<GetPaymentData>;
};

export const createPaymentApi = (apiClient: ApiClient): PaymentAPI => {
  return {
    createPayment: (amount: number, currency: string, redirectUrl: string) =>
      apiClient.post<PaymentData>("/v2/payments", {
        amount,
        currency,
        redirectUrl,
      }),

    getPayments: () => apiClient.get<GetPaymentData[]>("/v2/payments"),

    getPayment: (id: string) =>
      apiClient.get<GetPaymentData>(`/v2/payments/${id}`),
  };
};

export default createPaymentApi;
