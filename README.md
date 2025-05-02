# LivePix React SDK

[![License: MIT + Commons Clause](https://img.shields.io/badge/license-MIT--Commons%20Clause-blue.svg)](./LICENSE)
[![Issues](https://img.shields.io/github/issues/ApenasGabs/livepix-react-sdk)](https://github.com/ApenasGabs/livepix-react-sdk/issues)
[![Stars](https://img.shields.io/github/stars/ApenasGabs/livepix-react-sdk?style=social)](https://github.com/ApenasGabs/livepix-react-sdk/stargazers)
[![Forks](https://img.shields.io/github/forks/ApenasGabs/livepix-react-sdk?style=social)](https://github.com/ApenasGabs/livepix-react-sdk/network/members)
[![Contributors](https://img.shields.io/github/contributors/ApenasGabs/livepix-react-sdk)](https://github.com/ApenasGabs/livepix-react-sdk/graphs/contributors)
[![LivePix - Apoie este projeto](https://img.shields.io/badge/💖%20Apoie-via%20LivePix-ff69b4?style=flat-square)](https://livepix.gg/apenasgabs)

## Introdução

O LivePix React SDK é uma biblioteca que facilita a interação com a API LivePix, permitindo que desenvolvedores integrem funcionalidades de forma simples e eficiente em suas aplicações React. Este SDK inclui componentes React, hooks personalizados e utilitários para gerenciar autenticação e requisições à API.

## Instalação

Para instalar o SDK, utilize o npm ou yarn:

```bash
npm install livepix-react-sdk
```

ou

```bash
yarn add livepix-react-sdk
```

## Configuração

### Configurando credenciais

Existem várias maneiras de configurar as credenciais da API:

#### 1. Variáveis de ambiente (Recomendado)

Para aplicações Vite, crie um arquivo `.env.local` na raiz do seu projeto:

```
VITE_LIVEPIX_CLIENT_ID=seu_client_id_aqui
VITE_LIVEPIX_CLIENT_SECRET=seu_client_secret_aqui
```

Para aplicações Create React App:

```
REACT_APP_LIVEPIX_CLIENT_ID=seu_client_id_aqui
REACT_APP_LIVEPIX_CLIENT_SECRET=seu_client_secret_aqui
```

#### 2. Fornecendo credenciais diretamente aos componentes

```jsx
<LivePixButton 
  clientId="seu_client_id_aqui"
  clientSecret="seu_client_secret_aqui"
  label="Doar R$ 10,00" 
  amount={1000}
/>
```

#### 3. Fornecendo credenciais ao hook

```jsx
const { livePix } = useLivePix({
  clientId: "seu_client_id_aqui",
  clientSecret: "seu_client_secret_aqui"
});
```

## Uso

### Importando o SDK

Para utilizar o SDK em sua aplicação, você pode importar os componentes e hooks diretamente:

```typescript
import { LivePixButton, useLivePix } from 'livepix-react-sdk';
```

### Exemplo de Componente

Aqui está um exemplo de como utilizar o componente `LivePixButton` em sua aplicação:

```jsx
import React from 'react';
import { LivePixButton } from 'livepix-react-sdk';

const App = () => {
    return (
        <div>
            <h1>Exemplo de Integração com LivePix</h1>
            <LivePixButton 
              amount={1000} // R$ 10,00 (em centavos)
              label="Doar R$ 10,00"
              redirectUrl="https://seusite.com/obrigado"
            />
        </div>
    );
};

export default App;
```

### Hooks Personalizados

O SDK também fornece hooks personalizados para facilitar a interação com a API. Por exemplo, você pode usar o hook `useLivePix` para acessar todas as funcionalidades do SDK.

```jsx
import { useLivePix } from 'livepix-react-sdk';

const MyComponent = () => {
    const { livePix, loading, error } = useLivePix({
      clientId: "seu_client_id", 
      clientSecret: "seu_client_secret"
    });

    const handleGetAccount = async () => {
      if (livePix) {
        const account = await livePix.account.getAccount();
        console.log(account);
      }
    };

    if (loading) return <div>Carregando...</div>;
    if (error) return <div>Erro: {error.message}</div>;
    
    return (
      <div>
        <button onClick={handleGetAccount}>
          Ver dados da conta
        </button>
      </div>
    );
};
```

## Troubleshooting

### Erros comuns

1. **"Credenciais da API não configuradas"**
   - Verifique se você configurou corretamente as variáveis de ambiente ou forneceu as credenciais diretamente aos componentes.

2. **Erro de módulos externalizados (stream, util)**
   - Se estiver usando Vite, adicione os polyfills necessários conforme a documentação.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests no repositório.

## Licença

Este projeto está licenciado sob a [Licença MIT com Commons Clause](https://commonsclause.com/). A Commons Clause adiciona restrições ao uso comercial do software. Para mais detalhes, consulte o arquivo [LICENSE](./LICENSE).

### Nota para Contribuidores

Contribuidores devem estar cientes de que a Commons Clause restringe o uso comercial do software, mesmo que ele seja baseado na Licença MIT. Certifique-se de entender essas implicações antes de contribuir.
