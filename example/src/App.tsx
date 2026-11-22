import { getEnv, LivePixButton, useLivePix } from "livepix-react-sdk";
import { useEffect, useState } from "react";
import "./App.css";

type BffStatus = "checking" | "configured" | "unconfigured" | "unavailable";

const DEFAULT_USERNAME = getEnv("VITE_LIVEPIX_USERNAME", "apenasgabs");
const DEFAULT_PAYMENT_ENDPOINT = getEnv(
  "VITE_LIVEPIX_PAYMENT_ENDPOINT",
  "/bff/payments"
);

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Consulta o BFF de desenvolvimento (plugin do vite.config.js) sem nunca tocar no segredo. */
const useBffStatus = (paymentEndpoint: string): BffStatus => {
  const [status, setStatus] = useState<BffStatus>("checking");

  useEffect(() => {
    if (!paymentEndpoint.startsWith("/bff/")) {
      // Endpoint próprio (produção): assumimos que está configurado no servidor.
      setStatus("configured");
      return;
    }
    let cancelled = false;
    fetch("/bff/health")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((body) => {
        if (!cancelled) {
          setStatus(body?.data?.configured ? "configured" : "unconfigured");
        }
      })
      .catch(() => !cancelled && setStatus("unavailable"));
    return () => {
      cancelled = true;
    };
  }, [paymentEndpoint]);

  return status;
};

const BFF_STATUS_LABEL: Record<BffStatus, string> = {
  checking: "Verificando BFF…",
  configured: "BFF pronto (credenciais apenas no servidor)",
  unconfigured:
    "BFF sem credenciais: defina LIVEPIX_CLIENT_ID e LIVEPIX_CLIENT_SECRET em example/.env.local",
  unavailable:
    "BFF indisponível neste deploy (rode `yarn dev` localmente ou aponte para o seu backend)",
};

const SERVER_SNIPPET = `// server.ts (Node.js / Express / Next.js API Route)
import { createLivePix } from "livepix-react-sdk";

// Lê LIVEPIX_CLIENT_ID / LIVEPIX_CLIENT_SECRET de process.env
const livePix = createLivePix();

app.post("/api/livepix/payments", async (req, res) => {
  const { amount, currency = "BRL", redirectUrl } = req.body;
  const payment = await livePix.payments.createPayment(amount, currency, redirectUrl);
  res.json({ data: payment }); // envelope { data } desempacotado pelo hook
});

// Módulos v2 disponíveis apenas no servidor:
await livePix.subscriptions.getSubscriptions();
await livePix.subscriptionPlans.getSubscriptionPlans();
await livePix.rewards.getRewards();
await livePix.controls.skipAlert();`;

function App() {
  const [amount, setAmount] = useState(1000);
  const [username, setUsername] = useState(DEFAULT_USERNAME);
  const [hookResult, setHookResult] = useState<string | null>(null);
  const [hookBusy, setHookBusy] = useState(false);

  const paymentEndpoint = DEFAULT_PAYMENT_ENDPOINT;
  const bffStatus = useBffStatus(paymentEndpoint);
  const bffReady = bffStatus === "configured";
  const redirectUrl =
    typeof window !== "undefined" ? `${window.location.origin}/obrigado` : undefined;

  // Hook em modo BFF quando disponível; senão cai para o link público do criador.
  const { livePix, createPayment, getPublicUrl, loading, error } = useLivePix(
    bffReady ? { paymentEndpoint, redirectUrl } : { username }
  );

  const handleHookPayment = async () => {
    setHookBusy(true);
    setHookResult(null);
    try {
      const payment = await createPayment(amount, "BRL", redirectUrl);
      setHookResult(`URL de checkout: ${payment.redirectUrl}`);
    } catch (err) {
      setHookResult(
        `Erro: ${err instanceof Error ? err.message : "Erro desconhecido"}`
      );
    } finally {
      setHookBusy(false);
    }
  };

  return (
    <main className="App">
      <header className="app-header">
        <h1>LivePix React SDK — Demo v2</h1>
        <p className="subtitle">
          Arquitetura segura: o <code>clientSecret</code> vive apenas no
          servidor. O navegador usa o link público do criador ou um endpoint
          BFF próprio.
        </p>
      </header>

      <section className="section" aria-labelledby="amount-title">
        <h2 id="amount-title">Valor da doação</h2>
        <div className="input-group">
          <label htmlFor="amount">Valor (R$)</label>
          <input
            id="amount"
            type="number"
            inputMode="numeric"
            value={amount / 100}
            onChange={(e) =>
              setAmount(Math.max(1, Math.round(Number(e.target.value) || 1)) * 100)
            }
            min="1"
            step="1"
          />
        </div>
      </section>

      <div className="grid">
        <section className="section card-mode" aria-labelledby="public-title">
          <span className="badge badge-public">Modo público</span>
          <h2 id="public-title">Link público do criador</h2>
          <p>
            Sem backend e sem credenciais: redireciona para{" "}
            <code>livepix.gg/{username || "…"}</code>.
          </p>
          <div className="input-group">
            <label htmlFor="username">Username LivePix</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              placeholder="ex: apenasgabs"
              autoComplete="off"
            />
          </div>
          <LivePixButton
            username={username}
            amount={amount}
            label={`Doar ${formatBRL(amount)}`}
            disabled={!username}
          />
        </section>

        <section className="section card-mode" aria-labelledby="bff-title">
          <span className="badge badge-bff">Modo BFF</span>
          <h2 id="bff-title">Pagamento via backend próprio</h2>
          <p>
            O botão faz <code>POST {paymentEndpoint}</code>; o servidor
            autentica via OAuth2 (<code>client_credentials</code>) e chama{" "}
            <code>/v2/payments</code>.
          </p>
          <p
            className={`status status-${bffStatus}`}
            role="status"
            aria-live="polite"
          >
            {BFF_STATUS_LABEL[bffStatus]}
          </p>
          <LivePixButton
            paymentEndpoint={paymentEndpoint}
            amount={amount}
            redirectUrl={redirectUrl}
            label={`Doar ${formatBRL(amount)} via BFF`}
            disabled={!bffReady}
          />
        </section>
      </div>

      <section className="section" aria-labelledby="hook-title">
        <h2 id="hook-title">
          Hook <code>useLivePix</code>
        </h2>
        {loading ? (
          <p>Carregando…</p>
        ) : error ? (
          <p className="error" role="alert">
            Erro: {error.message}
          </p>
        ) : (
          <>
            <p>
              Modo ativo: <strong>{livePix?.mode === "bff" ? "BFF" : "Público"}</strong>
              {getPublicUrl() && (
                <>
                  {" "}
                  · Link público:{" "}
                  <a href={getPublicUrl() ?? undefined} target="_blank" rel="noreferrer">
                    {getPublicUrl()}
                  </a>
                </>
              )}
            </p>
            <button
              type="button"
              className="primary-btn"
              onClick={handleHookPayment}
              disabled={hookBusy}
            >
              {hookBusy ? "Gerando…" : "Gerar checkout sem redirecionar"}
            </button>
            {hookResult && (
              <p className="hook-result" role="status">
                {hookResult}
              </p>
            )}
          </>
        )}
      </section>

      <section className="section" aria-labelledby="server-title">
        <h2 id="server-title">Lado servidor (Node.js / BFF)</h2>
        <p>
          Use <code>createLivePix</code> somente no backend. Ele obtém o token
          em <code>https://oauth.livepix.gg/oauth2/token</code> e desempacota o
          envelope <code>{"{ data }"}</code> da API v2.
        </p>
        <pre>
          <code>{SERVER_SNIPPET}</code>
        </pre>
      </section>
    </main>
  );
}

export default App;
