// Gabarit « widget » : launcher 64×64 et panneau de discussion.
//
// ADR-0040 : le launcher et le panneau restent sous la responsabilité du
// template. L'ouverture et la fermeture sont demandées à l'hôte via les
// actions `openWidget` / `closeWidget`, qui pilotent le dimensionnement de
// l'iframe côté site client.
import { Component } from "../core/component.js";
import { el } from "../core/dom.js";
import { WIDGET_OPEN_SIZE } from "../core/constants.js";
import { accentContrastOf, accentOf } from "../core/theme.js";
import { Avatar } from "../components/avatar.js";
import { ChatPanel } from "../components/chat-panel.js";

export class WidgetLayout extends Component {
  constructor(ctx, store) {
    super(ctx, store);
    this.chat = new ChatPanel(ctx, store, { header: false, footer: false });
    this.el = el("div", { class: "atelier atelier--widget" });
    const accent = accentOf(ctx, this.params);
    this.el.style.setProperty("--accent", accent);
    this.el.style.setProperty("--on-accent", accentContrastOf(accent));
    this.#render();
  }

  patch() {
    const accent = accentOf(this.ctx, this.params);
    this.el.style.setProperty("--accent", accent);
    this.el.style.setProperty("--on-accent", accentContrastOf(accent));
    this.chat.update(this.ctx);
    this.#render();
  }

  afterMount() {
    this.chat.afterMount();
  }

  #render() {
    if (!this.store.widgetOpen) {
      this.el.replaceChildren(this.#launcher());
      return;
    }
    this.el.replaceChildren(this.#panel());
  }

  /** Bouton d'ouverture (64×64) avec pastille « non lu ». */
  #launcher() {
    const params = this.params;
    const botName = params.text("bot_name", "Assistant");
    const avatar = new Avatar(this.ctx, this.store, {
      url: params.text("bot_avatar_image", ""),
      label: botName,
      size: 30,
      tone: "bot",
    });
    const button = el(
      "button",
      {
        type: "button",
        class: "widget-launcher",
        "aria-label": params.text("launcher_label", "Ouvrir la discussion"),
        "aria-haspopup": "dialog",
        "aria-expanded": "false",
      },
      avatar.el,
      el("span", { class: "widget-online", "aria-hidden": "true" }),
    );
    button.addEventListener("click", () => this.#open());
    return button;
  }

  /** Panneau de discussion (420×680). */
  #panel() {
    const params = this.params;
    const botName = params.text("bot_name", "Assistant");
    const finished = this.ctx.state?.status === "finalisee";
    const status = finished
      ? params.text("status_done", "Conversation terminée")
      : params.text("status_active", "En ligne");
    const avatar = new Avatar(this.ctx, this.store, {
      url: params.text("bot_avatar_image", ""),
      label: botName,
      size: 26,
      tone: "bot",
    });

    const close = el("button", {
      type: "button",
      class: "widget-close",
      "aria-label": params.text("close_label", "Fermer"),
      text: "✕",
    });
    close.addEventListener("click", () => this.#close());

    const head = el(
      "header",
      { class: "widget-head" },
      avatar.el,
      el(
        "div",
        { class: "widget-id" },
        el("strong", { text: botName }),
        el("span", { class: "widget-status", text: status }),
      ),
      close,
    );

    return el("section", { class: "widget-panel", role: "dialog", "aria-label": botName }, [
      head,
      this.chat.el,
    ]);
  }

  #open() {
    this.store.widgetOpen = true;
    this.ctx.actions?.openWidget?.({ ...WIDGET_OPEN_SIZE });
    this.#render();
  }

  #close() {
    this.store.widgetOpen = false;
    this.ctx.actions?.closeWidget?.();
    this.#render();
  }
}
