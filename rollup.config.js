import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/livepix-react-sdk.cjs.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/livepix-react-sdk.esm.js",
      format: "esm",
      sourcemap: true,
    },
    {
      file: "dist/livepix-react-sdk.umd.js",
      format: "umd",
      name: "LivePixReactSDK",
      sourcemap: true,
      globals: {
        react: "React",
        "react-dom": "ReactDOM",
      },
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
    }),
    json(),
    terser(),
  ],
  external: ["react", "react-dom"],
};
