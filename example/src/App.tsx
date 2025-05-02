import React, { useState } from 'react';
import { LivePixButton, useLivePix } from 'livepix-react-sdk';
import './App.css';

function App() {
  const [amount, setAmount] = useState(1000);
  
  // Exemplo usando o hook
  const { livePix, loading, error } = useLivePix({
    clientId: import.meta.env.VITE_LIVEPIX_CLIENT_ID || 'seu-client-id',
    clientSecret: import.meta.env.VITE_LIVEPIX_CLIENT_SECRET || 'seu-client-secret'
  });
  
  const handleGetAccount = async () => {
    if (!livePix) return;
    
    try {
      const account = await livePix.account.getAccount();
      console.log('Dados da conta:', account);
    } catch (err) {
      console.error('Erro ao buscar conta:', err);
    }
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>LivePix React SDK - Demo</h1>
        
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
      </header>
    </div>
  );
}

export default App;
