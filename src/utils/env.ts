type ImportMetaEnvHolder = {
  env?: Record<string, string | undefined>;
};

type GlobalWithImport = typeof globalThis & {
  import?: {
    meta?: ImportMetaEnvHolder;
  };
  __LIVEPIX_RUNTIME__?: "browser" | "server";
};

const getImportMetaEnv = (): Record<string, string | undefined> | undefined => {
  try {
    return new Function(
      'return typeof import.meta !== "undefined" ? import.meta.env : undefined'
    )();
  } catch {
    return typeof globalThis !== "undefined"
      ? (globalThis as GlobalWithImport)?.import?.meta?.env
      : undefined;
  }
};

/**
 * Verifica se o código está executando em ambiente de navegador (Client-Side).
 * Permite override via `globalThis.__LIVEPIX_RUNTIME__` para testes automatizados.
 */
export const isBrowserRuntime = (): boolean => {
  if (typeof globalThis !== "undefined") {
    const runtimeOverride = (globalThis as GlobalWithImport).__LIVEPIX_RUNTIME__;
    if (runtimeOverride === "server") {
      return false;
    }
    if (runtimeOverride === "browser") {
      return true;
    }
  }
  return typeof window !== "undefined" && typeof window.document !== "undefined";
};

/**
 * Verifica se o código está executando em ambiente Server-Side (Node.js / BFF).
 */
export const isServerRuntime = (): boolean => !isBrowserRuntime();

/**
 * Identifica se uma chave de variável de ambiente representa um segredo sensível (clientSecret).
 */
export const isSecretEnvKey = (key: string): boolean => {
  const normalized = key.toUpperCase();
  return normalized.includes("CLIENT_SECRET") || normalized.endsWith("_SECRET");
};

/**
 * Emite alerta padronizado de segurança quando `clientSecret` é detectado no navegador.
 */
export const warnBrowserSecretExposure = (source: string = "LivePix SDK"): void => {
  console.warn(
    `[LivePix Security Warning] (${source}) Uso de clientSecret detectado no navegador. ` +
      "Nunca exponha LIVEPIX_CLIENT_SECRET ou VITE_LIVEPIX_CLIENT_SECRET no frontend React. " +
      "Isole createLivePix/createApiClient no backend (Node.js / BFF) e use paymentEndpoint, proxyUrl, username ou redirectUrl no cliente."
  );
};

export const getEnv = (key: string, defaultValue: string = ""): string => {
  const inBrowser = isBrowserRuntime();
  const isSecret = isSecretEnvKey(key);
  const metaEnv = getImportMetaEnv();

  // Bloqueio de segurança: nunca ler ou expor clientSecret em ambiente de navegador
  if (isSecret && inBrowser) {
    const hasMetaSecret = Boolean(
      metaEnv &&
        (metaEnv[key] ||
          metaEnv["VITE_LIVEPIX_CLIENT_SECRET"] ||
          metaEnv["REACT_APP_LIVEPIX_CLIENT_SECRET"])
    );
    const hasProcessSecret = Boolean(
      typeof process !== "undefined" &&
        process.env &&
        (process.env[key] ||
          process.env["VITE_LIVEPIX_CLIENT_SECRET"] ||
          process.env["REACT_APP_LIVEPIX_CLIENT_SECRET"])
    );

    if (hasMetaSecret || hasProcessSecret) {
      warnBrowserSecretExposure(key);
    }
    return defaultValue;
  }

  // Em ambiente Server-Side (Node.js), segredos são lidos exclusivamente de process.env
  if (isSecret) {
    if (typeof process !== "undefined" && process.env) {
      if (process.env[key]) {
        return process.env[key] || defaultValue;
      }
      const unprefixedKey = key.replace(/^(VITE_|REACT_APP_)/, "");
      if (process.env[unprefixedKey]) {
        return process.env[unprefixedKey] || defaultValue;
      }
    }
    return defaultValue;
  }

  // Para Vite / ESM (variáveis públicas não-secretas)
  if (metaEnv) {
    if (key.startsWith("VITE_") && metaEnv[key]) {
      return metaEnv[key] ?? defaultValue;
    }

    if (key.startsWith("VITE_")) {
      const reactAppKey = key.replace("VITE_", "REACT_APP_");
      if (metaEnv[reactAppKey]) {
        return metaEnv[reactAppKey] ?? defaultValue;
      }
    }

    if (key.startsWith("REACT_APP_")) {
      const viteKey = key.replace("REACT_APP_", "VITE_");
      if (metaEnv[viteKey]) {
        return metaEnv[viteKey] ?? defaultValue;
      }
    }

    if (metaEnv[key]) {
      return metaEnv[key] ?? defaultValue;
    }
  }

  // Para Node.js / process.env
  if (typeof process !== "undefined" && process.env) {
    if (process.env[key]) {
      return process.env[key] || defaultValue;
    }

    if (key.startsWith("VITE_")) {
      const reactAppKey = key.replace("VITE_", "REACT_APP_");
      if (process.env[reactAppKey]) {
        return process.env[reactAppKey] || defaultValue;
      }
      const serverKey = key.replace(/^VITE_/, "");
      if (process.env[serverKey]) {
        return process.env[serverKey] || defaultValue;
      }
    }

    if (key.startsWith("REACT_APP_")) {
      const viteKey = key.replace("REACT_APP_", "VITE_");
      if (process.env[viteKey]) {
        return process.env[viteKey] || defaultValue;
      }
      const serverKey = key.replace(/^REACT_APP_/, "");
      if (process.env[serverKey]) {
        return process.env[serverKey] || defaultValue;
      }
    }
  }

  return defaultValue;
};
