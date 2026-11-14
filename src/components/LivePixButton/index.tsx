import axios from "axios";
import React, { useEffect, useState } from "react";
import { unwrapResponse } from "../../api/apiClient";
import { CONFIG } from "../../config";
import {
  buildPublicDonationUrl,
  resolveBffPaymentEndpoint,
} from "../../hooks/useLivePix";
import { LivePixButtonProps, PaymentData } from "../../types";
import { warnBrowserSecretExposure } from "../../utils/env";

const LivePixButton: React.FC<LivePixButtonProps> = ({
  label = "Doar",
  amount = 1000, // R$10,00 em centavos
  currency = "BRL",
  redirectUrl,
  onClick,
  disabled = false,
  paymentEndpoint,
  proxyUrl,
  username,
  clientSecret,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasClientSecretProp = Boolean(clientSecret);

  useEffect(() => {
    if (hasClientSecretProp) {
      warnBrowserSecretExposure("LivePixButton");
    }
  }, [hasClientSecretProp]);

  const bffEndpoint = resolveBffPaymentEndpoint(
    paymentEndpoint || CONFIG.client.paymentEndpoint(),
    proxyUrl || CONFIG.client.proxyUrl()
  );

  const effectiveUsername = username || CONFIG.client.username();

  // Se clientSecret foi passado indevidamente sem BFF/username, redirectUrl não deve ser assumido como link público
  const publicUrl = buildPublicDonationUrl(
    effectiveUsername,
    hasClientSecretProp ? undefined : redirectUrl
  );

  const isConfigured = Boolean(bffEndpoint || publicUrl || onClick);

  const handleClick = async () => {
    if (onClick) {
      onClick();
      return;
    }

    if (hasClientSecretProp && !bffEndpoint && !effectiveUsername) {
      warnBrowserSecretExposure("LivePixButton");
      setError(
        "Segurança: clientSecret não é permitido no navegador. Configure paymentEndpoint, proxyUrl, username ou redirectUrl."
      );
      return;
    }

    if (!isConfigured) {
      setError(
        "Configuração de doação ausente. Forneça paymentEndpoint, proxyUrl, username ou redirectUrl."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (bffEndpoint) {
        const targetRedirectUrl =
          redirectUrl || CONFIG.payment.defaultRedirectUrl();

        const response = await axios.post(bffEndpoint, {
          amount,
          currency,
          redirectUrl: targetRedirectUrl,
        });

        const payment = unwrapResponse<PaymentData>(response);

        if (payment?.redirectUrl) {
          window.location.href = payment.redirectUrl;
        } else {
          throw new Error("URL de redirecionamento não retornada pelo servidor");
        }
        return;
      }

      if (publicUrl) {
        window.location.href = publicUrl;
        return;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao processar pagamento";
      setError(errorMessage);
      console.error("LivePixButton: Erro ao processar pagamento", err);
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle = {
    backgroundColor: "#007bff",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading || !isConfigured ? 0.7 : 1,
  };

  const errorStyle = {
    color: "red",
    margin: "8px 0",
    fontSize: "14px",
  };

  const infoStyle = {
    color: "#ff8c00",
    margin: "8px 0",
    fontSize: "13px",
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        style={buttonStyle}
        onClick={handleClick}
        disabled={disabled || loading}
        title={
          !isConfigured
            ? "Faltando configuração de endpoint BFF ou link público"
            : undefined
        }
      >
        {loading ? "Processando..." : label}
      </button>

      {!isConfigured && !error && (
        <div style={infoStyle}>
          ⚠️ Credenciais da API não configuradas. Configure paymentEndpoint,
          proxyUrl, username ou redirectUrl.
        </div>
      )}

      {error && <div style={errorStyle}>❌ {error}</div>}
    </div>
  );
};

export default LivePixButton;
