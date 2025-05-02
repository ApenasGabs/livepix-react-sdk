import React, { useState } from "react";

interface TokenConfigFormProps {
  initialClientId?: string;
  initialClientSecret?: string;
  onSave: (clientId: string, clientSecret: string) => void;
}

const TokenConfigForm: React.FC<TokenConfigFormProps> = ({
  initialClientId = "",
  initialClientSecret = "",
  onSave,
}) => {
  const [clientId, setClientId] = useState(initialClientId);
  const [clientSecret, setClientSecret] = useState(initialClientSecret);
  const [showSecret, setShowSecret] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId || !clientSecret) {
      setSaveStatus("error");
      return;
    }

    try {
      onSave(clientId, clientSecret);
      setSaveStatus("success");

      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    } catch (error) {
      setSaveStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="token-config-form">
      <div className="form-group">
        <label htmlFor="clientId">Client ID:</label>
        <input
          id="clientId"
          type="text"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder="Insira seu LivePix Client ID"
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label htmlFor="clientSecret">Client Secret:</label>
        <div className="secret-input-group">
          <input
            id="clientSecret"
            type={showSecret ? "text" : "password"}
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder="Insira seu LivePix Client Secret"
            className="form-control"
          />
          <button
            type="button"
            className="toggle-visibility-btn"
            onClick={() => setShowSecret(!showSecret)}
          >
            {showSecret ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="save-btn">
          Aplicar Credenciais
        </button>

        {saveStatus === "success" && (
          <span className="status-message success">
            ✅ Credenciais aplicadas com sucesso!
          </span>
        )}

        {saveStatus === "error" && (
          <span className="status-message error">
            ❌ Erro ao aplicar credenciais.
          </span>
        )}
      </div>

      <div className="form-info">
        <small>
          Suas credenciais são salvas apenas na memória do navegador e não são
          enviadas para nenhum servidor.
          <br />
          Elas serão perdidas ao atualizar a página.
        </small>
      </div>
    </form>
  );
};

export default TokenConfigForm;
