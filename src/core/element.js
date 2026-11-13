// Enregistrement de l'élément personnalisé du template.
//
// Le contrat public est celui du SDK (`onirtechContext` en propriété, Shadow
// DOM ouvert, nom d'élément = `ui.element` du manifeste). On réimplémente
// l'enregistrement plutôt que d'utiliser `defineTemplate()` du SDK parce que
// le SDK reconstruit tout le DOM à chaque rediffusion du contexte : ici, les
// composants restent vivants et se repatchent (focus du composeur, défilement
// et animations survivent aux allers-retours de l'hôte).
import { el } from "./dom.js";

/**
 * @param {string} name       nom du Custom Element (= `ui.element`)
 * @param {Function} factory  (ctx, store) → composant racine
 * @param {object} options    { css, shadowDom }
 */
export function defineTemplateElement(name, factory, options = {}) {
  const existing = customElements.get(name);
  if (existing !== undefined) return existing;

  const shadowMode = options.shadowDom ?? "open";

  class AtelierTemplate extends HTMLElement {
    #ctx = null;
    #root;
    #style;
    #tree = null;

    constructor() {
      super();
      this.#root = shadowMode === "none" ? this : this.attachShadow({ mode: shadowMode });
      this.#style = el("style", { text: options.css ?? "" });
    }

    set onirtechContext(ctx) {
      this.#ctx = ctx;
      this.#sync();
    }

    get onirtechContext() {
      return this.#ctx;
    }

    connectedCallback() {
      this.#sync();
    }

    disconnectedCallback() {
      this.#tree?.destroy?.();
    }

    #sync() {
      if (this.#ctx === null) return;
      try {
        if (this.#tree === null) {
          this.#tree = factory(this.#ctx);
          this.#root.replaceChildren(this.#style, this.#tree.el);
        } else {
          this.#tree.update(this.#ctx);
        }
        // Les composants qui mesurent le DOM (traits de liaison, défilement)
        // ne peuvent loker qu'une fois insérés et mis en page.
        requestAnimationFrame(() => this.#tree?.afterMount?.());
      } catch (error) {
        console.error("[@onirtech/chatbot-atelier]", error);
        const fallback = el("div", { class: "atelier-error", text: "Une erreur est survenue." });
        this.#root.replaceChildren(this.#style, fallback);
      }
    }
  }

  customElements.define(name, AtelierTemplate);
  return AtelierTemplate;
}
