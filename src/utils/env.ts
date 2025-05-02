export const getEnv = (key: string, defaultValue: string = ""): string => {
  // Para Vite
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta.env) {
    // @ts-ignore
    return (import.meta.env as any)[key] || defaultValue;
  }

  // Para Node.js/processo
  if (typeof process !== "undefined" && process.env) {
    return process.env[key] || defaultValue;
  }

  return defaultValue;
};
