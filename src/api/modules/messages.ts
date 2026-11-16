import {
  CreateMessageData,
  CreateMessageInput,
  GetMessagesParams,
  MessageData,
} from "../../types";
import { buildQueryPath } from "../../utils/url";
import { ApiClient } from "../apiClient";

export type MessagesAPI = {
  getMessages: (params?: GetMessagesParams) => Promise<MessageData[]>;
  createMessage: (input: CreateMessageInput) => Promise<CreateMessageData>;
  getMessage: (messageId: string) => Promise<MessageData>;
};

/**
 * Cria o módulo funcional para os endpoints `/v2/messages` da LivePix API v2.
 */
export const createMessagesApi = (apiClient: ApiClient): MessagesAPI => {
  return {
    getMessages: (params?: GetMessagesParams) =>
      apiClient.get<MessageData[]>(buildQueryPath("/v2/messages", params)),

    createMessage: (input: CreateMessageInput) =>
      apiClient.post<CreateMessageData>("/v2/messages", input),

    getMessage: (messageId: string) =>
      apiClient.get<MessageData>(
        `/v2/messages/${encodeURIComponent(messageId)}`
      ),
  };
};

export default createMessagesApi;
