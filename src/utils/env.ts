export const getEnv = (key: string, defaultValue: string = ""): string => {
  // Para Vite
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta.env) {
    // Teste direto para casos específicos do Vite
    // @ts-ignore
    if (key.startsWith("VITE_") && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }

    // Caso especial para lidar com conversões de nomes de variáveis
    if (key.startsWith("VITE_")) {
      const reactAppKey = key.replace("VITE_", "REACT_APP_");
      // @ts-ignore
      if (import.meta.env[reactAppKey]) {
        // @ts-ignore
        return import.meta.env[reactAppKey];
      }
    }

    if (key.startsWith("REACT_APP_")) {
      const viteKey = key.replace("REACT_APP_", "VITE_");
      // @ts-ignore
      if (import.meta.env[viteKey]) {
        // @ts-ignore
        return import.meta.env[viteKey];
      }
    }

    // Fallback geral para o Vite
    // @ts-ignore
    return import.meta.env[key] || defaultValue;
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
        return process.env[reactAppKey];
      }
    }

    if (key.startsWith("REACT_APP_")) {
      const viteKey = key.replace("REACT_APP_", "VITE_");
      if (process.env[viteKey]) {
        return process.env[viteKey];
      }
    }
  }

  return defaultValue;
};
