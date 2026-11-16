import React, { useState } from "react";
import { CONFIG } from "../../config";
import useLivePix from "../../hooks/useLivePix";
import { LivePixClientConfig } from "../../types";
import { assertSafeRedirectUrl } from "../../utils/url";

export type DonationButtonProps = Partial<LivePixClientConfig>;

const DonationButton: React.FC<DonationButtonProps> = (props) => {
  const [amount, setAmount] = useState(1000); // Valor padrão R$10,00 em centavos
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createPayment } = useLivePix(props);

  const handleDonation = async () => {
    setLoading(true);
    setError(null);

    try {
      const payment = await createPayment(
        amount,
        CONFIG.payment.defaultCurrency(),
        props.redirectUrl || CONFIG.payment.defaultRedirectUrl()
      );

      // Redirecionar para o URL de pagamento após validar protocolo HTTP(S)
      if (payment.redirectUrl) {
        window.location.href = assertSafeRedirectUrl(payment.redirectUrl);
      }
    } catch (err) {
      setError("Falha ao processar doação. Por favor, tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donation-widget">
      <h3>Apoie o Criador</h3>
      <input
        type="number"
        value={amount / 100} // Mostra em reais em vez de centavos
        min="1"
        step="1"
        onChange={(e) => setAmount(Number(e.target.value) * 100)} // Converte para centavos
        disabled={loading}
      />
      <button onClick={handleDonation} disabled={loading}>
        {loading ? "Processando..." : "Doar com Pix"}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default DonationButton;
