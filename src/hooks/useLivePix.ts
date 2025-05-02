import { useEffect, useState } from "react";
import { createLivePix, LivePixSDK } from "../api/livePix";
import { UseLivePixConfig } from "../types";

const useLivePix = ({ clientId, clientSecret }: UseLivePixConfig) => {
  const [livePix, setLivePix] = useState<LivePixSDK | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const sdk = createLivePix(clientId, clientSecret);
      setLivePix(sdk);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [clientId, clientSecret]);

  return { livePix, loading, error };
};

export default useLivePix;
