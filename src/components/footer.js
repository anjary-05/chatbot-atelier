// Bandeau bas de la carte : mentions et disponibilité.
//
// C'est la seule ligne « institutionnelle » du template : elle ferme la carte
// sans créer une barre de page.
import { Component } from "../core/component.js";
import { el } from "../core/dom.js";

export class CardFooter extends Component {
  constructor(ctx, store) {
    super(ctx, store);
    this.el = el("div", { class: "atelier-card-foot" });
    this.#render();
  }

  patch() {
    this.#render();
  }

  #render() {
    const params = this.params;
    const left = params.text("footer_left", "ONIRTECH / 2026");
    const right = params.text("footer_right", "DISPONIBLE 24/7");
    this.el.replaceChildren(
      el("span", { class: "foot-left", text: left }),
      el("span", { class: "foot-right", text: right }),
    );
  }
}
