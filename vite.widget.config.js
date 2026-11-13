// Bundle « widget » : dist/widget.js.
//
// Même contrat de build que le bundle page (ESM unique, SDK embarqué, cible
// ES2022, assets inlinés), mais un fichier distinct et aucun manifeste généré
// (le manifeste est produit par le build page puis complété par
// `tools/sync-manifest.mjs`, qui renseigne l'intégrité SRI du bundle widget).
import { defineConfig } from "vite";

export default defineConfig({
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    target: "es2022",
    cssCodeSplit: false,
    assetsInlineLimit: 1048576,
    minify: true,
    emptyOutDir: false,
    outDir: "dist",
    lib: {
      entry: "src/widget.js",
      formats: ["es"],
      fileName: () => "widget.js",
    },
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
});
