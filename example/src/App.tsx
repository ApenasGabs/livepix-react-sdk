import { LivePixButton, useLivePix } from "livepix-react-sdk";
import { useEffect, useState } from "react";
import { getEnv } from "../../src/utils/env";
import "./App.css";

function App() {
  const [amount, setAmount] = useState(1000);
  const [configWarning, setConfigWarning] = useState<string | null>(null);

  useEffect(() => {
    const clientId = getEnv("VITE_LIVEPIX_CLIENT_ID");
    const clientSecret = getEnv("VITE_LIVEPIX_CLIENT_SECRET");

    if (
      !clientId ||
      clientId === "seu-client-id" ||
      !clientSecret ||
      clientSecret === "seu-client-secret"
    ) {
      setConfigWarning(
        "⚠️ As credenciais da API não foram configuradas. Crie um arquivo .env.local com VITE_LIVEPIX_CLIENT_ID e VITE_LIVEPIX_CLIENT_SECRET."
      );
    } else {
      setConfigWarning(null);
    }
  }, []);

  // Exemplo usando o hook
  const { livePix, loading, error } = useLivePix({
    clientId: getEnv("VITE_LIVEPIX_CLIENT_ID", "seu-client-id"),
    clientSecret: getEnv("VITE_LIVEPIX_CLIENT_SECRET", "seu-client-secret"),
  });

  const handleGetAccount = async () => {
    if (!livePix) return;

    try {
      const account = await livePix.account.getAccount();
      console.log("Dados da conta:", account);
    } catch (err) {
      console.error("Erro ao buscar conta:", err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>LivePix React SDK - Demo</h1>

        {configWarning && <div className="warning-banner">{configWarning}</div>}

        <div className="section">
          <h2>LivePixButton Component</h2>
          <div className="input-group">
            <label>Valor (R$):</label>
            <input
              type="number"
              value={amount / 100}
              onChange={(e) => setAmount(Number(e.target.value) * 100)}
              min="1"
              step="1"
            />
          </div>

          <LivePixButton
            amount={amount}
            label={`Doar R$ ${(amount / 100).toFixed(2)}`}
            redirectUrl="https://example.com/success"
          />
        </div>

        <div className="section">
          <h2>useLivePix Hook Example</h2>
          {loading ? (
            <p>Carregando...</p>
          ) : error ? (
            <p className="error">Erro: {error.message}</p>
          ) : (
            <>
              <p>SDK carregado com sucesso!</p>
              <button onClick={handleGetAccount}>
                Buscar informações da conta
              </button>
            </>
          )}
        </div>

        <div className="section">
          <h2>Como configurar credenciais</h2>
          <pre>
            {`
# Crie um arquivo .env.local na raiz do projeto com:
VITE_LIVEPIX_CLIENT_ID=seu_client_id_aqui
VITE_LIVEPIX_CLIENT_SECRET=seu_client_secret_aqui
            `}
          </pre>
        </div>
      </header>
    </div>
  );
}

export default App;
