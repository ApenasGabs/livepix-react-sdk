/**
 * Verifica se uma URL utiliza exclusivamente protocolo seguro HTTP(S).
 */
export const isSafeHttpUrl = (rawUrl?: string): boolean => {
  if (!rawUrl || !rawUrl.trim()) {
    return false;
  }
  try {
    const parsed = new URL(rawUrl.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Valida e normaliza uma URL de redirecionamento, permitindo apenas `http:` e `https:`.
 * Previne redirecionamentos inseguros como `javascript:` ou `data:`.
 */
export const assertSafeRedirectUrl = (rawUrl: string): string => {
  const trimmed = rawUrl.trim();
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("URL de redirecionamento inválida");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `Protocolo de URL de redirecionamento não permitido: ${parsed.protocol}`
    );
  }
  return trimmed;
};

/**
 * Resolve o endpoint BFF de criação de pagamentos a partir de `paymentEndpoint` ou `proxyUrl`.
 */
export const resolveBffPaymentEndpoint = (
  paymentEndpoint?: string,
  proxyUrl?: string
): string => {
  if (paymentEndpoint && paymentEndpoint.trim()) {
    return paymentEndpoint.trim();
  }
  if (proxyUrl && proxyUrl.trim()) {
    const cleanProxy = proxyUrl.trim().replace(/\/+$/, "");
    return cleanProxy.endsWith("/payments")
      ? cleanProxy
      : `${cleanProxy}/payments`;
  }
  return "";
};

/**
 * Constrói a URL pública de doação a partir do `username` do criador ou `redirectUrl` pré-gerada segura (http/https).
 */
export const buildPublicDonationUrl = (
  username?: string,
  redirectUrl?: string
): string => {
  if (username && username.trim()) {
    const cleanUsername = username.trim().replace(/^@+/, "");
    if (cleanUsername) {
      return `https://livepix.gg/${encodeURIComponent(cleanUsername)}`;
    }
  }
  if (redirectUrl && isSafeHttpUrl(redirectUrl)) {
    return redirectUrl.trim();
  }
  return "";
};
