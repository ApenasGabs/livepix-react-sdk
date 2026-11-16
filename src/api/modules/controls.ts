import { ControlsData, UpdateControlsInput } from "../../types";
import { ApiClient } from "../apiClient";

export type ControlsAPI = {
  getControls: () => Promise<ControlsData>;
  updateControls: (input: UpdateControlsInput) => Promise<void>;
  skipAlert: () => Promise<void>;
  replayAlert: () => Promise<void>;
};

/**
 * Cria o módulo funcional para os endpoints `/v2/controls` (controles de alertas) da LivePix API v2.
 */
export const createControlsApi = (apiClient: ApiClient): ControlsAPI => {
  return {
    getControls: () => apiClient.get<ControlsData>("/v2/controls"),

    updateControls: (input: UpdateControlsInput) =>
      apiClient.patch<void>("/v2/controls", input),

    skipAlert: () => apiClient.post<void>("/v2/controls/skip"),

    replayAlert: () => apiClient.post<void>("/v2/controls/replay"),
  };
};

export default createControlsApi;
