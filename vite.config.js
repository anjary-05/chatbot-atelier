// Bundle « page » : dist/index.js + génération de onirtech.template.json.
//
// La configuration est celle du SDK (bundle ESM unique, SDK embarqué, assets
// inlinés, cible ES2022). Le bundle « widget » est produit par
// `vite.widget.config.js` : deux entrées distinctes, deux éléments distincts.
import { defineTemplateConfig } from "@onirtech/template-sdk/vite";

export default defineTemplateConfig({
  entry: "src/index.js",
  element: "onirtech-template-chatbot-atelier",
  manifest: "src/manifest.js",
});
