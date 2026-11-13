// Accordéon « [+] / [−] » (rows du style « Spin Product »).
//
// Une seule ligne est ouverte à la fois ; l'état vit dans le store pour
// survivre aux rediffusions de contexte.
import { Component } from "../core/component.js";
import { el } from "../core/dom.js";

export class Accordion extends Component {
  /**
   * @param {object} ctx
   * @param {object} store
   * @param {{ rows?: Array<{ label: string, value: string }>, openKey?: string }} options
   */
  constructor(ctx, store, options = {}) {
    super(ctx, store);
    this.rows = options.rows ?? [];
    this.openKey = options.openKey ?? "row";
    // La première ligne s'ouvre par défaut (une seule à la fois).
    if (this.rows.length > 0 && this.store.openRow === null) {
      this.store.openRow = `${this.openKey}-0`;
    }
    this.el = el("div", { class: "atelier-accordion" });
    this.#render();
  }

  patch() {
    this.#render();
  }

  #render() {
    this.el.replaceChildren();
    this.rows.forEach((row, index) => {
      const key = `${this.openKey}-${index}`;
      const isOpen = this.store.openRow === key;
      // Le repli est porté par la grille (0fr → 1fr) ; le texte vit dans une
      // couche interne qui conserve son espacement quand la ligne est fermée.
      const body = el(
        "div",
        { class: "acc-body" },
        el("div", { class: "acc-inner" }, el("p", { text: row.value })),
      );
      body.style.gridTemplateRows = isOpen ? "1fr" : "0fr";

      const header = el(
        "button",
        {
          type: "button",
          class: "acc-header",
          "aria-expanded": isOpen ? "true" : "false",
        },
        el("span", { class: "acc-label", text: row.label }),
        el("span", { class: "acc-mark", text: isOpen ? "[−]" : "[+]" }),
      );
      header.addEventListener("click", () => {
        this.store.openRow = isOpen ? null : key;
        this.#render();
      });

      this.el.appendChild(el("div", { class: "acc-row" }, header, body));
    });
  }
}
