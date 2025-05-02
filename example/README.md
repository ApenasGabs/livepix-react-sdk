# LivePix React SDK - Demo

Esta é a aplicação de demonstração do LivePix React SDK, que mostra como implementar e usar o SDK em uma aplicação React.

## Rodando localmente

Instale as dependências e inicie o servidor de desenvolvimento:

```bash
# Instale as dependências
yarn install

# Inicie o servidor de desenvolvimento
yarn dev
```

## Configurando as variáveis de ambiente

Crie um arquivo `.env.local` na raiz deste diretório com suas credenciais da API LivePix:

```bash
VITE_LIVEPIX_CLIENT_ID=seu_client_id_aqui
VITE_LIVEPIX_CLIENT_SECRET=seu_client_secret_aqui
```

## Hospedando na Vercel

Esta aplicação está configurada para hospedagem na Vercel. Siga os passos abaixo para fazer o deploy:

1. **Crie uma conta na Vercel** em [vercel.com](https://vercel.com)

2. **Instale a CLI da Vercel** (opcional):

   ```bash
   npm install -g vercel
   ```

3. **Deploy via CLI**:

   ```bash
   # Navegue para o diretório example
   cd example
   
   # Faça login na Vercel, se ainda não estiver logado
   vercel login
   
   # Deploy do projeto
   vercel
   ```

   Ou você pode simplesmente conectar seu repositório GitHub na interface web da Vercel.

4. **Configure as variáveis de ambiente**:

   No dashboard da Vercel, acesse seu projeto e adicione as seguintes variáveis de ambiente:

   - `VITE_LIVEPIX_CLIENT_ID` = seu_client_id_aqui
   - `VITE_LIVEPIX_CLIENT_SECRET` = seu_client_secret_aqui

5. **Redeploy** após configurar as variáveis de ambiente.

## Proxy de API na Vercel

A configuração da Vercel inclui um proxy para a API LivePix para evitar problemas de CORS. As rotas `/api` e `/oauth` são automaticamente redirecionadas para os respectivos endpoints da API LivePix.

O arquivo `vercel.json` já está configurado com:

- Redirecionamento da rota `/oauth/:path*` para `https://auth.livepix.gg/:path*`
- Redirecionamento da rota `/api/:path*` para `https://api.livepix.gg/:path*`
- Cabeçalhos CORS apropriados para as requisições à API

## Testando o SDK na Demo

A página de demonstração permite que os visitantes testem o SDK de duas maneiras:

1. **Temporariamente**: Inserindo suas credenciais da LivePix diretamente no formulário da interface
2. **Variáveis de ambiente**: Configurando as variáveis de ambiente da aplicação

---

Para mais informações sobre o SDK, consulte o [README principal](../README.md).
