# LivePix React SDK — Demo v2

Aplicação Vite que demonstra o uso **seguro** do SDK: o `clientSecret` nunca chega ao navegador.

O que a demo mostra:

- **Modo público** — `LivePixButton` com `username`, redirecionando para `livepix.gg/<username>` sem backend.
- **Modo BFF** — `LivePixButton` com `paymentEndpoint="/bff/payments"`; um BFF de desenvolvimento (plugin `livepix-dev-bff` no [`vite.config.js`](./vite.config.js)) autentica via OAuth2 `client_credentials` e chama `POST /v2/payments`.
- **Hook `useLivePix`** — gera o checkout sem redirecionar e mostra o modo ativo.
- **Snippet server-side** — uso de `createLivePix` e dos módulos v2 (subscriptions, plans, rewards, controls).

## Rodando localmente

```bash
# na raiz do repositório
yarn install
cd example
yarn install
cp .env.example .env.local   # edite os valores
yarn dev                     # http://localhost:5173
```

## Variáveis de ambiente (`example/.env.local`)

| Variável | Visibilidade | Uso |
|---|---|---|
| `VITE_LIVEPIX_USERNAME` | Pública (bundle) | Username do criador para o modo público |
| `VITE_LIVEPIX_PAYMENT_ENDPOINT` | Pública (bundle) | Endpoint BFF (padrão `/bff/payments`) |
| `LIVEPIX_CLIENT_ID` | **Privada** (somente Node) | Usada pelo BFF de desenvolvimento |
| `LIVEPIX_CLIENT_SECRET` | **Privada** (somente Node) | Usada pelo BFF de desenvolvimento |

> [!CAUTION]
> Não use `VITE_LIVEPIX_CLIENT_SECRET`. O `vite.config.js` **aborta** o dev server/build se detectar qualquer `VITE_*SECRET*` / `REACT_APP_*SECRET*` preenchida, porque essas variáveis seriam embutidas no bundle.

Sem `LIVEPIX_CLIENT_ID`/`LIVEPIX_CLIENT_SECRET`, o modo BFF fica desabilitado (com aviso na tela) e a demo continua funcionando no modo público.

## Rotas do BFF de desenvolvimento

| Rota | Resposta |
|---|---|
| `GET /bff/health` | `{ data: { configured: boolean } }` |
| `POST /bff/payments` | Body `{ amount, currency?, redirectUrl? }` → repassa para `https://api.livepix.gg/v2/payments` e devolve `{ data: { redirectUrl, reference } }` |

O BFF valida `amount` (inteiro positivo em centavos) e `redirectUrl` (`http(s)` apenas), faz cache do token e renova uma vez em caso de `401`.

## Proxy de desenvolvimento

O `server.proxy` do Vite aponta para os hosts oficiais da LivePix v2 e atende o código que usa as URLs relativas de `CONFIG` em `localhost`:

- `/oauth*` → `https://oauth.livepix.gg` (ex.: `/oauth2/token`)
- `/api/*` → `https://api.livepix.gg/*`

Ele não injeta credenciais: o navegador continua sem acesso ao segredo.

## Deploy (Vercel)

O [`vercel.json`](./vercel.json) publica apenas o SPA estático. O BFF de desenvolvimento **não** existe em produção, então a demo publicada opera no modo público (o card BFF mostra "BFF indisponível"). Para habilitar o modo BFF em produção:

1. Crie uma função serverless própria (ex.: `api/livepix/payments.ts`) usando `createLivePix` — veja o [README principal](../README.md#uso-no-servidor-nodejs--bff).
2. Configure `LIVEPIX_CLIENT_ID` e `LIVEPIX_CLIENT_SECRET` como variáveis **de servidor** no painel da Vercel.
3. Defina `VITE_LIVEPIX_PAYMENT_ENDPOINT=/api/livepix/payments` e faça o redeploy.

> Os antigos rewrites `/oauth` e `/api` com CORS `*` foram removidos: eles só existiam para o navegador chamar a LivePix com o segredo, o que não é mais suportado.

---

Para mais informações sobre o SDK, consulte o [README principal](../README.md).
