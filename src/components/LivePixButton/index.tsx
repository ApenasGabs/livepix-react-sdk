import React, { useState } from "react";
import { createLivePix } from "../../api/livePix";
import { LivePixButtonProps } from "../../types";
import { getEnv } from "../../utils/env";

const LivePixButton: React.FC<LivePixButtonProps> = ({
  label = "Doar",
  amount = 1000, // R$10,00 em centavos
  currency = "BRL",
  redirectUrl = window.location.href,
  onClick,
  disabled = false,
  clientId = getEnv("VITE_LIVEPIX_CLIENT_ID"),
  clientSecret = getEnv("VITE_LIVEPIX_CLIENT_SECRET"),
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const credentialsAvailable = Boolean(
    clientId &&
      clientSecret &&
      clientId !== "seu-client-id" &&
      clientSecret !== "seu-client-secret"
  );

  const handleClick = async () => {
    if (onClick) {
      onClick();
      return;
    }

    if (!credentialsAvailable) {
      setError(
        "Credenciais da API não configuradas. Forneça clientId e clientSecret."
      );
      console.error("LivePixButton: Credenciais não configuradas", {
        clientIdAvailable: Boolean(clientId),
        clientSecretAvailable: Boolean(clientSecret),
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sdk = createLivePix(clientId as string, clientSecret as string);

      const payment = await sdk.payments.createPayment(
        amount,
        currency,
        redirectUrl
      );

      if (payment.redirectUrl) {
        window.location.href = payment.redirectUrl;
      } else {
        throw new Error("URL de redirecionamento não retornada pelo servidor");
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
    opacity: disabled || loading || !credentialsAvailable ? 0.7 : 1,
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
          !credentialsAvailable
            ? "Faltando configuração de credenciais da API"
            : undefined
        }
      >
        {loading ? "Processando..." : label}
      </button>

      {!credentialsAvailable && !error && (
        <div style={infoStyle}>
          ⚠️ Credenciais da API não configuradas. O botão não funcionará.
        </div>
      )}

      {error && <div style={errorStyle}>❌ {error}</div>}
    </div>
  );
};

export default LivePixButton;
