import { resolve } from "path";
import { defineConfig } from "vite";
import libCss from "vite-plugin-libcss";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    libCss(),
  ],
  build: {
    outDir: "dist",
    lib: {
      entry: resolve(__dirname, "src/index.js"),
      formats: ["es"],
      fileName: "guided-tour-components",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["vue"],
    },
  },
});
