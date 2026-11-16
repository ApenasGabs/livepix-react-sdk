import React, { useState } from "react";
import useLivePix from "../../hooks/useLivePix";
import { LivePixButtonProps } from "../../types";
import { assertSafeRedirectUrl } from "../../utils/url";

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
  clientId,
  clientSecret,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { livePix, createPayment, error: sdkError } = useLivePix({
    paymentEndpoint,
    proxyUrl,
    username,
    redirectUrl,
    clientId,
    clientSecret,
  });

  const isConfigured = Boolean(livePix || onClick);

  const handleClick = async () => {
    if (onClick) {
      onClick();
      return;
    }

    if (!isConfigured) {
      setError(
        sdkError?.message ||
          "Configuração de doação ausente. Forneça paymentEndpoint, proxyUrl, username ou redirectUrl."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payment = await createPayment(amount, currency, redirectUrl);
      const safeRedirectUrl = assertSafeRedirectUrl(payment.redirectUrl);
      window.location.href = safeRedirectUrl;
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
