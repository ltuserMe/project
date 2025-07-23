import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import viteCompression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";
import { terser } from "@rollup/plugin-terser";
import viteClean from "vite-plugin-clean";
import viteImagemin from "vite-plugin-imagemin";
import checker from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const isProd = mode === "production";

  return {
    plugins: [
      vue(),
      viteClean(), // 打包前清理dist
      isProd && viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: "gzip",
        ext: ".gz",
      }),
      isProd && visualizer({
        open: false,
        filename: "dist/stats.html",
        gzipSize: true,
        brotliSize: true,
      }),
      isProd && viteImagemin({
        gifsicle: { optimizationLevel: 7, interlaced: false },
        optipng: { optimizationLevel: 7 },
        mozjpeg: { quality: 75 },
        pngquant: { quality: [0.7, 0.9], speed: 3 },
        svgo: {
          plugins: [
            { name: "removeViewBox" },
            { name: "removeEmptyAttrs", active: false },
          ],
        },
        webp: { quality: 75 },
      }),
      checker({
        typescript: true,
        vueTsc: true
      }),
    ].filter(Boolean),
    server: {
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: env.VITE_APP_API_URL,
          changeOrigin: true,
          // 自动适配前缀
          rewrite: (path) => path.replace(new RegExp("^" + env.VITE_APP_BASE_API), ""),
        },
      },
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      outDir: "dist",
      assetsDir: "static",
      sourcemap: isProd ? false : true,
      rollupOptions: {
        output: {
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]",
        },
        plugins: [
          isProd && terser({
            format: {
              comments: false,
            },
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          }),
        ].filter(Boolean),
      },
      minify: isProd ? "terser" : false,
      cssCodeSplit: true,
      brotliSize: false,
      emptyOutDir: true,
    },
  };
});
