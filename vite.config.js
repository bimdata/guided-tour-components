import { resolve } from "path";
import { defineConfig } from 'vite';
import libCss from 'vite-plugin-libcss';
import vue from '@vitejs/plugin-vue';
import { dependencies } from './package.json'

import replace from "@rollup/plugin-replace";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    libCss(),
    replace({
      "@bimdata/design-system/dist/js/BIMDataComponents": "@bimdata/design-system/dist/js/BIMDataComponents/vue3",
      delimiters: ["", ""],
      preventAssignment: true,
    }),
  ],
  build: {
    outDir: "dist",
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      formats: ["es"],
      fileName: "guided-tour-components"
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [...Object.keys(dependencies)],
    }
  }
})
