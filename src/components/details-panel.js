// Panneau de détails de l'assistant (déplié depuis l'en-tête de la discussion).
//
// Titre, mesure, tag et accordéon : tout est paramétré. Le panneau est replié
// par défaut pour garder la conversation lisible ; son état vit dans le store.
import { Component } from "../core/component.js";
import { el, fill } from "../core/dom.js";
import { Accordion } from "./accordion.js";

export class DetailsPanel extends Component {
  constructor(ctx, store) {
    super(ctx, store);
    this.accordion = new Accordion(ctx, store, {
      rows: this.params.pairs("info_rows", [
        { label: "Description", value: "Un assistant disponible, des réponses claires." },
        { label: "Horaires", value: "Du lundi au vendredi, 08:00 — 18:00." },
      ]),
      openKey: "info",
    });
    this.el = el("section", { class: "chat-details", hidden: "true" });
    this.#render();
  }

  patch() {
    this.accordion.update(this.ctx);
    this.#render();
  }

  #render() {
    const params = this.params;
    const open = this.store.detailsOpen === true;
    this.el.hidden = !open;
    if (!open) return;

    const title = params.text("info_title", "Une conversation qui avance");
    const metric = params.text("info_metric", "24/7");
    const tag = params.text("info_tag", "EN LIGNE");

    fill(this.el, [
      el(
        "div",
        { class: "details-head" },
        el("h3", { class: "details-title", text: title }),
        el(
          "div",
          { class: "card-metrics" },
          el("strong", { class: "card-metric", text: metric }),
          el("span", { class: "card-tag", text: tag }),
        ),
      ),
      this.accordion.el,
    ]);
  }
}
