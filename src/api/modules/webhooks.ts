import { WebhookData } from "../../types";
import { ApiClient } from "../apiClient";

export type WebhookAPI = {
  getWebhooks: () => Promise<WebhookData[]>;
  createWebhook: (url: string) => Promise<WebhookData>;
  deleteWebhook: (id: string) => Promise<void>;
};

export const createWebhookApi = (apiClient: ApiClient): WebhookAPI => {
  return {
    getWebhooks: () => apiClient.get<WebhookData[]>("/v2/webhooks"),

    createWebhook: (url: string) =>
      apiClient.post<WebhookData>("/v2/webhooks", { url }),

    deleteWebhook: (id: string) => apiClient.delete<void>(`/v2/webhooks/${id}`),
  };
};

export default createWebhookApi;
