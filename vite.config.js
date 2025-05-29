import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0",
    port: "3001",
    // proxy: {
    //   "^/api": {
    //     target: "http://47.120.6.86:5000/",
    //     // rewrite: (path) => path.replace(new RegExp("^" + "/dev-api"), ""),
    //   },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
