import { useState } from "react";
// Trocar a importação externa pelo nosso SDK funcional interno
import { createLivePix } from "../../api/livePix";

const DonationButton = () => {
  const [amount, setAmount] = useState(1000); // Valor padrão R$10,00 em centavos
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDonation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Usar nosso SDK funcional
      const livePix = createLivePix(
        process.env.LIVEPIX_CLIENT_ID || "",
        process.env.LIVEPIX_CLIENT_SECRET || ""
      );

      const payment = await livePix.payments.createPayment(
        amount,
        "BRL",
        window.location.href
      );

      // Redirecionar para o URL de pagamento
      if (payment.redirectUrl) {
        window.location.href = payment.redirectUrl;
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
