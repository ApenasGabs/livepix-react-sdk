import createControlsApi, { ControlsAPI } from "./controls";

/**
 * Alias de compatibilidade para o módulo de controles de alertas (`/v2/controls`).
 */
export type AlertsAPI = ControlsAPI;

/**
 * Alias de compatibilidade para `createControlsApi` (`/v2/controls`).
 */
export const createAlertsApi = createControlsApi;

export default createAlertsApi;
