import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

const LIVEPIX_TOKEN_URL = "https://oauth.livepix.gg/oauth2/token";
const LIVEPIX_API_URL = "https://api.livepix.gg";
const PAYMENT_SCOPE = "payments:write";
const BFF_PREFIX = "/bff";

/**
 * Segurança: qualquer variável `VITE_*` é embutida no bundle do navegador.
 * Abortamos o dev server / build caso alguém tente expor o clientSecret por esse caminho.
 */
const assertNoBrowserSecrets = (env) => {
  const leakedKeys = Object.keys(env).filter(
    (key) =>
      /^(VITE_|REACT_APP_)/.test(key) &&
      /SECRET/i.test(key) &&
      Boolean(env[key])
  );
  if (leakedKeys.length > 0) {
    throw new Error(
      `[livepix-example] Variáveis secretas expostas ao navegador: ${leakedKeys.join(
        ", "
      )}. Use LIVEPIX_CLIENT_SECRET (sem prefixo VITE_) — ela é lida apenas pelo BFF do servidor.`
    );
  }
};

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 10_000) {
        reject(new Error("Payload muito grande"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("JSON inválido"));
      }
    });
    req.on("error", reject);
  });

const sendJson = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
};

/**
 * BFF (Backend-For-Frontend) mínimo de desenvolvimento.
 * Roda no processo Node do Vite: o `clientSecret` nunca chega ao navegador.
 * - GET  /bff/health   -> { data: { configured: boolean } }
 * - POST /bff/payments -> proxy autenticado para POST /v2/payments (envelope { data })
 *
 * Em produção, substitua por uma rota própria (Express, Next.js API Route,
 * Vercel/Cloudflare Function) usando `createLivePix` do SDK no servidor.
 */
const livePixDevBff = (env) => {
  const clientId = env.LIVEPIX_CLIENT_ID || "";
  const clientSecret = env.LIVEPIX_CLIENT_SECRET || "";
  const configured = Boolean(clientId && clientSecret);
  let cachedToken = null;

  const getAccessToken = async (forceRefresh = false) => {
    if (!forceRefresh && cachedToken && cachedToken.expiresAt > Date.now()) {
      return cachedToken.value;
    }
    const response = await fetch(LIVEPIX_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: PAYMENT_SCOPE,
      }),
    });
    if (!response.ok) {
      throw new Error(`Falha ao obter token OAuth2 (${response.status})`);
    }
    const token = await response.json();
    cachedToken = {
      value: token.access_token,
      // margem de 60s para evitar uso de token expirado
      expiresAt: Date.now() + Math.max(Number(token.expires_in || 0) - 60, 0) * 1000,
    };
    return cachedToken.value;
  };

  const createPayment = async (payload, retry = true) => {
    const accessToken = await getAccessToken(!retry);
    const response = await fetch(`${LIVEPIX_API_URL}/v2/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (response.status === 401 && retry) {
      cachedToken = null;
      return createPayment(payload, false);
    }
    const body = await response.json().catch(() => ({}));
    return { status: response.status, body };
  };

  return {
    name: "livepix-dev-bff",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || "";
        const pathname = rawUrl.split("?")[0];
        if (!pathname.startsWith(BFF_PREFIX)) {
          return next();
        }

        if (req.method === "GET" && pathname === `${BFF_PREFIX}/health`) {
          return sendJson(res, 200, { data: { configured } });
        }

        if (req.method === "POST" && pathname === `${BFF_PREFIX}/payments`) {
          if (!configured) {
            return sendJson(res, 503, {
              error:
                "BFF sem credenciais. Defina LIVEPIX_CLIENT_ID e LIVEPIX_CLIENT_SECRET (sem prefixo VITE_) em example/.env.local.",
            });
          }
          try {
            const { amount, currency = "BRL", redirectUrl } = await readJsonBody(req);
            const parsedAmount = Number(amount);
            if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) {
              return sendJson(res, 400, { error: "amount deve ser inteiro positivo (centavos)" });
            }
            if (redirectUrl && !/^https?:\/\//i.test(String(redirectUrl))) {
              return sendJson(res, 400, { error: "redirectUrl deve usar http(s)" });
            }
            const { status, body } = await createPayment({
              amount: parsedAmount,
              currency: String(currency),
              redirectUrl,
            });
            return sendJson(res, status, body);
          } catch (err) {
            server.config.logger.error(`[livepix-dev-bff] ${err.message}`);
            return sendJson(res, 502, { error: "Falha ao criar pagamento na LivePix" });
          }
        }

        return sendJson(res, 404, { error: "Rota BFF não encontrada" });
      });
    },
  };
};

export default defineConfig(({ mode }) => {
  // Carrega TODAS as variáveis (inclusive sem prefixo) apenas no processo Node.
  // O Vite só injeta no bundle do cliente as variáveis com prefixo VITE_.
  const env = loadEnv(mode, process.cwd(), "");
  assertNoBrowserSecrets(env);

  return {
    plugins: [react(), livePixDevBff(env)],
    resolve: {
      alias: {
        "livepix-react-sdk": path.resolve(__dirname, "../src"),
      },
    },
    // Proxy de desenvolvimento para os hosts oficiais da LivePix v2.
    // `/oauth` cobre `/oauth2/token` (CONFIG.auth.tokenUrl em localhost) -> https://oauth.livepix.gg/oauth2/token
    // `/api/*` -> https://api.livepix.gg/* (CONFIG.api.baseUrl em localhost)
    // Uso destinado a código server-side/SSR; o navegador continua sem clientSecret.
    server: {
      proxy: {
        "/oauth": {
          target: "https://oauth.livepix.gg",
          changeOrigin: true,
          secure: true,
        },
        "/api": {
          target: LIVEPIX_API_URL,
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
    },
    build: {
      sourcemap: true,
    },
  };
});
