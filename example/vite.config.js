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
    build: {
      commonjsOptions: {
        include: [/node_modules/],
      },
      rollupOptions: {
        // Não externalize o React para este build específico
        // external: ["react", "react-dom"],

        // Em vez disso, use o formato de saída correto para o navegador
        output: {
          // Garantir que o formato de módulo seja compatível com o navegador
          format: "es",
          // Adicionar o sufixo .js aos imports gerados
          entryFileNames: "[name].[hash].js",
          chunkFileNames: "[name].[hash].js",
          assetFileNames: "[name].[hash].[ext]",
          // Adiciona corretamente a extensão .js às importações no bundle
          paths: {
            react: "./assets/react.vendor.js",
            "react-dom": "./assets/react-dom.vendor.js",
          },
        },
      },
      // Garantir que o Vite não tenha problemas com dependências
      sourcemap: true,
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
