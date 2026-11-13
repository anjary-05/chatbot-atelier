// Écran d'accueil : présentation de l'assistant, ou formulaire d'identité.
//
// • Phase identité → le formulaire de démarrage (nom, email, consentement).
// • Discussion vide → la carte de présentation du bot (nom, fonction, accueil).
//
// L'écran disparaît dès que la conversation commence : la discussion occupe
// alors toute la surface.
import { Component } from "../core/component.js";
import { el, fill } from "../core/dom.js";
import { usageOf } from "../core/surface.js";
import { IdentityCard } from "./identity-card.js";

export class Welcome extends Component {
  constructor(ctx, store) {
    super(ctx, store);
    this.identity = new IdentityCard(ctx, store);
    this.el = el("section", { class: "chat-welcome" });
    this.#render();
  }

  patch() {
    this.identity.update(this.ctx);
    this.#render();
  }

  #render() {
    const params = this.params;

    if (usageOf(this.ctx).identity) {
      fill(this.el, [
        el("span", { class: "card-kicker", text: params.text("identity_kicker", "● (IDENTITÉ)") }),
        el("h2", { class: "welcome-title", text: params.text("identity_title", "Commençons") }),
        el("p", {
          class: "welcome-text",
          text: params.text("identity_text", "Deux informations suffisent pour ouvrir la discussion."),
        }),
        this.identity.el,
      ]);
      return;
    }

    fill(this.el, [
      el("span", { class: "card-kicker", text: params.text("info_kicker", "● (À PROPOS)") }),
      el("h2", { class: "welcome-title", text: params.text("bot_name", "Assistant") }),
      el("span", { class: "welcome-role", text: params.text("bot_role", "") }),
      el("p", { class: "welcome-text", text: params.text("welcome_message", "") }),
    ]);
  }
}
