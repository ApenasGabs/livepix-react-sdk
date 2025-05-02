import React, { useState } from "react";
import { createLivePix } from "../../api/livePix";
import { LivePixButtonProps } from "../../types";

const LivePixButton: React.FC<LivePixButtonProps> = ({
  label = "Doar",
  amount = 1000, // R$10,00 em centavos
  currency = "BRL",
  redirectUrl = window.location.href,
  onClick,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (onClick) {
      onClick();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sdk = createLivePix(
        process.env.LIVEPIX_CLIENT_ID || "",
        process.env.LIVEPIX_CLIENT_SECRET || ""
      );

      const payment = await sdk.payments.createPayment(
        amount,
        currency,
        redirectUrl
      );

      if (payment.redirectUrl) {
        window.location.href = payment.redirectUrl;
      }
    } catch (err) {
      setError("Erro ao processar pagamento");
      console.error(err);
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
    opacity: disabled || loading ? 0.7 : 1,
  };

  return (
    <div>
      <button
        style={buttonStyle}
        onClick={handleClick}
        disabled={disabled || loading}
      >
        {loading ? "Processando..." : label}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default LivePixButton;
