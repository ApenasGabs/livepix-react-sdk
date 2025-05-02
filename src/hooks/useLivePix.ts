import { useEffect, useState } from "react";
import { createLivePix, LivePixSDK } from "../api/livePix";
import { CONFIG } from "../config";
import { UseLivePixConfig } from "../types";

const useLivePix = (config?: Partial<UseLivePixConfig>) => {
  const [livePix, setLivePix] = useState<LivePixSDK | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      // Usar as credenciais fornecidas como config ou obter da configuração centralizada
      const clientId = config?.clientId || CONFIG.auth.clientId();
      const clientSecret = config?.clientSecret || CONFIG.auth.clientSecret();

      if (!clientId || !clientSecret) {
        throw new Error(
          "Credenciais da API não configuradas. Forneça clientId e clientSecret."
        );
      }

      const sdk = createLivePix(clientId, clientSecret);
      setLivePix(sdk);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [config?.clientId, config?.clientSecret]);

  return { livePix, loading, error };
};

export default useLivePix;
