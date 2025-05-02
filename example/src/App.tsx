import { getEnv, LivePixButton, useLivePix } from "livepix-react-sdk";
import { useEffect, useState } from "react";
import "./App.css";
import TokenConfigForm from "./components/TokenConfigForm";

// Componente de diagnóstico para variáveis de ambiente
const EnvDebug = () => {
  const clientId = getEnv("VITE_LIVEPIX_CLIENT_ID", "");
  const clientSecret = getEnv("VITE_LIVEPIX_CLIENT_SECRET", "");

  return (
    <div
      style={{
        padding: "16px",
        margin: "16px 0",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
      }}
    >
      <h3>Depuração de Variáveis de Ambiente</h3>
      <p>
        Client ID:{" "}
        {clientId
          ? `${clientId.substring(0, 4)}...${clientId.substring(
              clientId.length - 4
            )}`
          : "❌ Não definido"}
      </p>
      <p>
        Client Secret:{" "}
        {clientSecret
          ? `${clientSecret.substring(0, 4)}...${clientSecret.substring(
              clientSecret.length - 4
            )}`
          : "❌ Não definido"}
      </p>
      <p>
        <small>
          Nota: As credenciais são mostradas parcialmente por motivos de
          segurança. Se você não vê os valores, verifique o arquivo .env.local
        </small>
      </p>
    </div>
  );
};

function App() {
  const [amount, setAmount] = useState(1000);
  const [configWarning, setConfigWarning] = useState<string | null>(null);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [customClientId, setCustomClientId] = useState("");
  const [customClientSecret, setCustomClientSecret] = useState("");

  // Estado para rastrear se estamos usando credenciais personalizadas
  const [usingCustomCredentials, setUsingCustomCredentials] = useState(false);

  // Obtém credenciais do .env.local ou usa as personalizadas
  const getCredentials = () => {
    if (usingCustomCredentials) {
      return {
        clientId: customClientId,
        clientSecret: customClientSecret,
      };
    }

    return {
      clientId: getEnv("VITE_LIVEPIX_CLIENT_ID", ""),
      clientSecret: getEnv("VITE_LIVEPIX_CLIENT_SECRET", ""),
    };
  };

  // Handler para salvar credenciais personalizadas
  const handleSaveCredentials = (clientId: string, clientSecret: string) => {
    setCustomClientId(clientId);
    setCustomClientSecret(clientSecret);
    setUsingCustomCredentials(true);

    // Reinicializa o SDK com as novas credenciais
    setReloadSDK((prev) => !prev); // Alterna o valor para forçar reinicialização
  };

  // Estado para forçar o recarregamento do SDK quando as credenciais mudam
  const [reloadSDK, setReloadSDK] = useState(false);

  useEffect(() => {
    const { clientId, clientSecret } = getCredentials();

    const hasValidConfig =
      clientId &&
      clientSecret &&
      clientId !== "seu_client_id_aqui" &&
      clientSecret !== "seu_client_secret_aqui";

    if (!hasValidConfig) {
      setConfigWarning(
        "⚠️ As credenciais da API não foram configuradas. Use o formulário abaixo para testar com suas próprias credenciais."
      );
    } else {
      setConfigWarning(null);
    }
  }, [customClientId, customClientSecret, usingCustomCredentials]);

  // Exemplo usando o hook
  const { livePix, loading, error } = useLivePix({
    clientId: getCredentials().clientId || "seu_client_id_aqui",
    clientSecret: getCredentials().clientSecret || "seu_client_secret_aqui",
  });

  const handleGetAccount = async () => {
    if (!livePix) return;

    try {
      const account = await livePix.account.getAccount();
      console.log("Dados da conta:", account);
      alert(
        `Conta carregada com sucesso!\nNome: ${account.displayName}\nUsuário: ${account.username}`
      );
    } catch (err) {
      console.error("Erro ao buscar conta:", err);
      alert(
        `Erro ao buscar conta: ${
          err instanceof Error ? err.message : "Erro desconhecido"
        }`
      );
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>LivePix React SDK - Demo</h1>

        {configWarning && <div className="warning-banner">{configWarning}</div>}

        <div className="section">
          <div className="config-section-header">
            <h2>Configurar Credenciais</h2>
            <button
              className="toggle-config-btn"
              onClick={() => setShowConfigForm(!showConfigForm)}
            >
              {showConfigForm ? "Ocultar Formulário" : "Mostrar Formulário"}
            </button>
          </div>

          {showConfigForm && (
            <TokenConfigForm
              initialClientId={getCredentials().clientId}
              initialClientSecret={getCredentials().clientSecret}
              onSave={handleSaveCredentials}
            />
          )}

          {usingCustomCredentials && (
            <div className="custom-credentials-info">
              ✅ Usando credenciais personalizadas
            </div>
          )}

          {/* Componente de diagnóstico de variáveis de ambiente */}
          <EnvDebug />
        </div>

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
            clientId={getCredentials().clientId}
            clientSecret={getCredentials().clientSecret}
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
          <p>Você pode configurar suas credenciais de duas formas:</p>
          <ol style={{ textAlign: "left" }}>
            <li>
              <strong>Temporariamente:</strong> Use o formulário acima para
              testar o SDK rapidamente (as credenciais serão perdidas ao
              recarregar a página).
            </li>
            <li>
              <strong>Permanentemente:</strong> Crie um arquivo .env.local na
              pasta example com:
            </li>
          </ol>
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
