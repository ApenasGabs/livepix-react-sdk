import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente com base no modo
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "livepix-react-sdk": path.resolve(__dirname, "../src"),
      },
    },
    // Configuração de proxy para contornar problemas de CORS durante o desenvolvimento
    server: {
      proxy: {
        "/oauth": {
          target: "https://auth.livepix.gg",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/oauth/, ""),
        },
        "/api": {
          target: "https://api.livepix.gg",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    define: {
      ...Object.keys(env)
        .filter((key) => key.startsWith("VITE_"))
        .reduce((vars, key) => {
          vars[`import.meta.env.${key}`] = JSON.stringify(env[key]);
          return vars;
        }, {}),
    },
  };
});
