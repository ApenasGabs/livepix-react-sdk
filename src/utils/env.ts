type ImportMetaEnvHolder = {
  env?: Record<string, string | undefined>;
};

type GlobalWithImport = typeof globalThis & {
  import?: {
    meta?: ImportMetaEnvHolder;
  };
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

export const getEnv = (key: string, defaultValue: string = ""): string => {
  // Para Vite / ESM
  const metaEnv = getImportMetaEnv();
  if (metaEnv) {
    // Teste direto para casos específicos do Vite
    if (key.startsWith("VITE_") && metaEnv[key]) {
      return metaEnv[key] ?? defaultValue;
    }

    // Caso especial para lidar com conversões de nomes de variáveis
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

    // Fallback geral para o Vite
    if (metaEnv[key]) {
      return metaEnv[key] ?? defaultValue;
    }
  }

  // Para Node.js/processo
  if (typeof process !== "undefined" && process.env) {
    // Tenta pegar a variável diretamente
    if (process.env[key]) {
      return process.env[key] || defaultValue;
    }

    // Tenta conversões similares às acima para o Node
    if (key.startsWith("VITE_")) {
      const reactAppKey = key.replace("VITE_", "REACT_APP_");
      if (process.env[reactAppKey]) {
        return process.env[reactAppKey] || defaultValue;
      }
    }

    if (key.startsWith("REACT_APP_")) {
      const viteKey = key.replace("REACT_APP_", "VITE_");
      if (process.env[viteKey]) {
        return process.env[viteKey] || defaultValue;
      }
    }
  }

  return defaultValue;
};
