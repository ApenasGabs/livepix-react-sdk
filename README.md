# LivePix React SDK

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

## Uso

### Importando o SDK

Para utilizar o SDK em sua aplicação, você pode importar os componentes e hooks diretamente:

```typescript
import { LivePixButton, useLivePix } from 'livepix-react-sdk';
```

### Exemplo de Componente

Aqui está um exemplo de como utilizar o componente `LivePixButton` em sua aplicação:

```typescript
import React from 'react';
import { LivePixButton } from 'livepix-react-sdk';

const App = () => {
    return (
        <div>
            <h1>Exemplo de Integração com LivePix</h1>
            <LivePixButton />
        </div>
    );
};

export default App;
```

### Hooks Personalizados

O SDK também fornece hooks personalizados para facilitar a interação com a API. Por exemplo, você pode usar o hook `useLivePix` para gerenciar a lógica de autenticação e requisições.

```typescript
import { useLivePix } from 'livepix-react-sdk';

const MyComponent = () => {
    const { data, error } = useLivePix();

    if (error) return <div>Erro ao carregar dados</div>;
    return <div>{data}</div>;
};
```

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests no repositório.

## Licença
