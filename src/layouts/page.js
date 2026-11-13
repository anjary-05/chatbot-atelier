// Gabarit « page » : une seule colonne centrée, pensée comme une présentation
// de conversation.
//
// L'en-tête (marque, navigation, compteur, statut) encadre la surface de
// discussion ; le reste de la page est le chatbot.
import { Component } from "../core/component.js";
import { el } from "../core/dom.js";
import { accentContrastOf, accentOf } from "../core/theme.js";
import { BrandHeader } from "../components/header.js";
import { ChatPanel } from "../components/chat-panel.js";

export class PageLayout extends Component {
  constructor(ctx, store) {
    super(ctx, store);
    this.header = new BrandHeader(ctx, store);
    this.chat = new ChatPanel(ctx, store);

    const stage = el("main", { class: "atelier-stage" }, this.chat.el);

    this.el = el("div", { class: "atelier atelier--page" }, [
      this.header.el,
      stage,
    ]);
    const accent = accentOf(ctx, this.params);
    this.el.style.setProperty("--accent", accent);
    this.el.style.setProperty("--on-accent", accentContrastOf(accent));
  }

  patch() {
    const accent = accentOf(this.ctx, this.params);
    this.el.style.setProperty("--accent", accent);
    this.el.style.setProperty("--on-accent", accentContrastOf(accent));
    this.header.update(this.ctx);
    this.chat.update(this.ctx);
  }

  afterMount() {
    this.chat.afterMount();
  }
}
