import { getEnv } from "livepix-react-sdk";
import React from "react";

const EnvDebug: React.FC = () => {
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
          ? clientId.substring(0, 4) +
            "..." +
            clientId.substring(clientId.length - 4)
          : "❌ Não definido"}
      </p>
      <p>
        Client Secret:{" "}
        {clientSecret
          ? clientSecret.substring(0, 4) +
            "..." +
            clientSecret.substring(clientSecret.length - 4)
          : "❌ Não definido"}
      </p>
      <p>
        <small>
          Nota: As credenciais são mostradas parcialmente por motivos de
          segurança. Se você não vê os valores, adicione-os ao arquivo
          .env.local
        </small>
      </p>
    </div>
  );
};

export default EnvDebug;
