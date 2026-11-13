// En-tête de marque : logo, fil d'Ariane, navigation, compteur et statut.
//
// L'en-tête reste volontairement maigre : la page est une présentation de
// conversation, pas une page de site.
import { Component } from "../core/component.js";
import { el } from "../core/dom.js";

export class BrandHeader extends Component {
  constructor(ctx, store) {
    super(ctx, store);
    this.el = el("header", { class: "atelier-head" });
    this.#render();
  }

  patch() {
    this.#render();
  }

  #render() {
    const params = this.params;
    const brand = params.text("brand_name", "ONIRTECH");
    const crumbs = params.text("brand_crumbs", "ACCUEIL > ASSISTANCE");
    const counterLabel = params.text("counter_label", "MSG");
    const nav = params.pipe("nav_items", ["Accueil", "Services", "Contact"]);
    const messages = this.ctx.state?.messages?.length ?? 0;
    const finished = this.ctx.state?.status === "finalisee";
    const status = finished
      ? params.text("status_done", "Conversation terminée")
      : params.text("status_active", "En ligne");

    const brandBlock = el(
      "div",
      { class: "head-brand" },
      el("span", { class: "head-logo", text: brand }),
      crumbs === "" ? null : el("span", { class: "head-crumb", text: crumbs }),
    );

    const navBlock = el(
      "nav",
      { class: "head-nav", "aria-label": "Navigation" },
      ...nav.map((item, index) =>
        el("button", {
          type: "button",
          class: `head-link${index === 0 ? " is-active" : ""}`,
          text: item,
        }),
      ),
    );

    const account = el(
      "div",
      { class: "head-acct" },
      el(
        "span",
        { class: "pill pill-count" },
        `${counterLabel}/`,
        el("b", { text: String(messages) }),
      ),
      el(
        "span",
        { class: `head-status${finished ? " is-done" : ""}` },
        el("span", { class: "status-dot", "aria-hidden": "true" }),
        status,
      ),
    );

    this.el.replaceChildren(brandBlock, navBlock, account);
  }
}
