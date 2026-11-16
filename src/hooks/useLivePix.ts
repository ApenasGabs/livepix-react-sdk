import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { unwrapResponse } from "../api/apiClient";
import { CONFIG } from "../config";
import {
  LivePixClientSDK,
  PaymentData,
  UseLivePixConfig,
  UseLivePixReturn,
} from "../types";
import { warnBrowserSecretExposure } from "../utils/env";
import {
  assertSafeRedirectUrl,
  buildPublicDonationUrl,
  isSafeHttpUrl,
  resolveBffPaymentEndpoint,
} from "../utils/url";

export {
  assertSafeRedirectUrl,
  buildPublicDonationUrl,
  isSafeHttpUrl,
  resolveBffPaymentEndpoint,
};

const useLivePix = (config?: Partial<UseLivePixConfig>): UseLivePixReturn => {
  const [livePix, setLivePix] = useState<LivePixClientSDK | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const hasClientSecretProp = Boolean(config?.clientSecret);

  const bffEndpoint = useMemo(
    () =>
      resolveBffPaymentEndpoint(
        config?.paymentEndpoint || CONFIG.client.paymentEndpoint(),
        config?.proxyUrl || CONFIG.client.proxyUrl()
      ),
    [config?.paymentEndpoint, config?.proxyUrl]
  );

  const effectiveUsername = useMemo(
    () => config?.username || CONFIG.client.username(),
    [config?.username]
  );

  const publicUrl = useMemo(() => {
    // Se clientSecret foi passado por engano, redirectUrl não deve ser tratado como link público direto
    const safeRedirectUrl = hasClientSecretProp ? undefined : config?.redirectUrl;
    return buildPublicDonationUrl(effectiveUsername, safeRedirectUrl);
  }, [effectiveUsername, config?.redirectUrl, hasClientSecretProp]);

  const getPublicUrl = useCallback((): string | null => {
    return publicUrl || null;
  }, [publicUrl]);

  const createPayment = useCallback(
    async (
      amount = 1000,
      currency = CONFIG.payment.defaultCurrency(),
      customRedirectUrl?: string
    ): Promise<PaymentData> => {
      if (bffEndpoint) {
        const targetRedirectUrl =
          customRedirectUrl ||
          config?.redirectUrl ||
          CONFIG.payment.defaultRedirectUrl();

        const response = await axios.post(bffEndpoint, {
          amount,
          currency,
          redirectUrl: targetRedirectUrl,
        });

        const payload = unwrapResponse<PaymentData>(response);
        if (!payload?.redirectUrl) {
          throw new Error("URL de redirecionamento não retornada pelo servidor");
        }
        const safeRedirectUrl = assertSafeRedirectUrl(payload.redirectUrl);
        return {
          ...payload,
          redirectUrl: safeRedirectUrl,
        };
      }

      if (publicUrl) {
        const safePublicUrl = assertSafeRedirectUrl(publicUrl);
        return {
          redirectUrl: safePublicUrl,
          reference: effectiveUsername || "public_redirect",
        };
      }

      throw new Error(
        "Configuração do LivePix ausente no cliente. Forneça paymentEndpoint, proxyUrl, username ou redirectUrl."
      );
    },
    [bffEndpoint, config?.redirectUrl, effectiveUsername, publicUrl]
  );

  useEffect(() => {
    if (hasClientSecretProp) {
      warnBrowserSecretExposure("useLivePix");
    }

    if (!bffEndpoint && !publicUrl) {
      const message = hasClientSecretProp
        ? "Segurança: clientSecret não é permitido no navegador (frontend React). Configure paymentEndpoint, proxyUrl, username ou redirectUrl."
        : "Configuração do LivePix não encontrada. Forneça paymentEndpoint, proxyUrl, username ou redirectUrl.";
      setLivePix(null);
      setError(new Error(message));
      setLoading(false);
      return;
    }

    const clientSdk: LivePixClientSDK = {
      mode: bffEndpoint ? "bff" : "public",
      payments: {
        createPayment,
      },
      getPublicUrl,
    };

    setLivePix(clientSdk);
    setError(null);
    setLoading(false);
  }, [bffEndpoint, createPayment, getPublicUrl, hasClientSecretProp, publicUrl]);

  return {
    livePix,
    createPayment,
    getPublicUrl,
    loading,
    error,
  };
};

export default useLivePix;
