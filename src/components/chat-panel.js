// Panneau de discussion : en-tête, écran d'accueil, messages, détails,
// suggestions et composeur.
//
// La structure est construite une seule fois : les rediffusions de l'hôte
// repatchent le contenu sans détacher le fil de discussion — le défilement et
// la position de lecture du visiteur restent donc intacts.
import { Component } from "../core/component.js";
import { el } from "../core/dom.js";
import { usageOf } from "../core/surface.js";
import { Avatar } from "./avatar.js";
import { Composer } from "./composer.js";
import { CardFooter } from "./footer.js";
import { DetailsPanel } from "./details-panel.js";
import { MessageList } from "./message-list.js";
import { Suggestions } from "./suggestions.js";
import { Welcome } from "./welcome.js";

export class ChatPanel extends Component {
  /**
   * @param {object} ctx
   * @param {object} store
   * @param {{ header?: boolean, footer?: boolean }} options
   */
  constructor(ctx, store, options = {}) {
    super(ctx, store);
    this.showHeader = options.header !== false;
    this.showFooter = options.footer !== false;
    this.welcome = new Welcome(ctx, store);
    this.details = new DetailsPanel(ctx, store);
    this.suggestions = new Suggestions(ctx, store);
    this.suggestions.setEnabled(!usageOf(ctx).identity);
    this.messages = new MessageList(ctx, store);
    this.composer = new Composer(ctx, store);
    this.cardFooter = new CardFooter(ctx, store);

    this.head = el("header", { class: "chat-head" });
    this.pill = null;
    this.toggle = null;

    this.el = el("article", { class: "atelier-card atelier-card--chat" }, [
      this.showHeader ? this.head : null,
      this.messages.el,
      this.details.el,
      this.suggestions.el,
      this.composer.el,
      this.showFooter ? this.cardFooter.el : null,
    ]);

    this.#renderHead();
    this.#render();
    this.#setupDynamicLayout();
  }

  patch() {
    this.welcome.update(this.ctx);
    this.details.update(this.ctx);
    this.suggestions.setEnabled(!usageOf(this.ctx).identity);
    this.messages.update(this.ctx);
    this.composer.update(this.ctx);
    this.cardFooter.update(this.ctx);
    this.#render();
  }

  afterMount() {
    this.messages?.afterMount?.();
  }

  /** En-tête : construit une fois, repatché ensuite (statut, dépliage). */
  #renderHead() {
    if (!this.showHeader) return;
    const params = this.params;
    const botName = params.text("bot_name", "Assistant");
    const botRole = params.text("bot_role", "");

    const avatar = new Avatar(this.ctx, this.store, {
      url: params.text("bot_avatar_image", ""),
      label: botName,
      size: 36,
      tone: "bot",
    });

    this.pill = el("span", { class: "pill pill-phase", text: params.text("phase_label", "CONVERSATION") });

    this.toggle = el("button", {
      type: "button",
      class: "chat-more",
      "aria-expanded": "false",
      "aria-label": params.text("details_label", "Détails de l'assistant"),
      text: "[+]",
    });
    this.toggle.addEventListener("click", () => {
      this.store.detailsOpen = this.store.detailsOpen !== true;
      this.details.update(this.ctx);
      this.#render();
    });

    this.head.replaceChildren(
      avatar.el,
      el(
        "div",
        { class: "chat-id" },
        el("strong", { text: botName }),
        botRole === "" ? null : el("span", { class: "chat-role", text: botRole }),
      ),
      this.pill,
      this.toggle,
    );
  }

  #render() {
    const params = this.params;
    const botName = params.text("bot_name", "Assistant");
    const finished = this.ctx.state?.status === "finalisee";
    const typing = this.ctx.state?.typing === true;
    const open = this.store.detailsOpen === true;

    if (this.pill !== null) this.pill.classList.toggle("is-done", finished);
    if (this.toggle !== null) {
      this.toggle.textContent = open ? "[−]" : "[+]";
      this.toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    // Indicateur de frappe : inséré (et retiré) sans toucher au fil.
    const existing = this.el.querySelector(".atelier-typing");
    if (typing) {
      const row =
        existing ??
        el(
          "p",
          { class: "atelier-typing", "aria-live": "polite" },
          el("span", { class: "typing-dots", "aria-hidden": "true" }),
          el("span", { class: "typing-text" }),
        );
      const label = row.querySelector(".typing-text");
      if (label !== null) {
        label.textContent = `${botName} ${params.text("typing_text", "est en train d’écrire…")}`;
      }
      if (existing === null) this.details.el.before(row);
    } else if (existing !== null) {
      existing.remove();
    }

    this.#placeWelcome();
    this.#remeasure();
  }

  /**
   * Mise en page dynamique « ChatGPT » : la zone de messages occupe tout l'espace
   * restant (en-tête + détails + suggestions + composeur + pied), recalculée à
   * chaque redimensionnement du conteneur et à chaque patch.
   */
  #setupDynamicLayout() {
    const card = this.el;
    const stream = this.messages.el;
    const log = stream.querySelector(".atelier-log") ?? stream;
    const isCompact = () => card.clientWidth < 640;

    const applyCompact = () => {
      const compact = isCompact();
      if (this.showHeader) {
        this.head.hidden = compact;
      }
      if (this.details?.el) {
        this.details.el.hidden = compact || !this.store.detailsOpen;
      }
      if (this.suggestions?.el) {
        const hasMessages = Array.isArray(this.ctx.state?.messages) && this.ctx.state.messages.length > 0;
        this.suggestions.el.hidden = hasMessages; // ChatGPT : suggestions masquées dès le 1er message
      }
      if (this.showFooter && this.cardFooter?.el) {
        this.cardFooter.el.hidden = compact;
      }
    };

    const floatSuggestions = () => {
      const suggestions = this.suggestions?.el;
      if (suggestions === null || suggestions === undefined) return;
      // Réinitialiser le positionnement flottant.
      suggestions.style.position = "";
      suggestions.style.bottom = "";
      suggestions.style.left = "";
      suggestions.style.right = "";
      suggestions.style.zIndex = "";
      suggestions.style.background = "";
      suggestions.style.borderTop = "";
      if (log) log.style.paddingBottom = "";
    };

    const measure = () => {
      applyCompact();
      const cardHeight = card.clientHeight;
      if (cardHeight <= 0) return;
      let chrome = 0;
      if (this.showHeader && this.head.offsetParent !== null && !this.head.hidden) chrome += this.head.offsetHeight;
      const details = this.details?.el;
      if (details !== null && details.offsetParent !== null && !details.hidden) chrome += details.offsetHeight;
      const suggestions = this.suggestions?.el;
      // Suggestions flottantes : ne prennent pas de place dans le flux.
      if (suggestions !== null && suggestions.offsetParent !== null && !suggestions.hidden) {
        // no chrome added — floating
      }
      const composer = this.composer?.el;
      if (composer !== null && composer.offsetParent !== null && !composer.hidden) chrome += composer.offsetHeight;
      if (this.showFooter) {
        const footer = this.cardFooter?.el;
        if (footer !== null && footer.offsetParent !== null && !footer.hidden) chrome += footer.offsetHeight;
      }
      const available = Math.max(120, cardHeight - chrome);
      stream.style.height = `${available}px`;
      stream.style.flex = "none";
      // Re-positionner les suggestions flottantes après le calcul.
      requestAnimationFrame(() => floatSuggestions());
    };

    this._measure = measure;
    if (typeof ResizeObserver !== "undefined") {
      this._ro = new ResizeObserver(() => measure());
      this._ro.observe(card);
    }
    requestAnimationFrame(() => measure());
    window.addEventListener("resize", measure);
  }

  /** Re-mesure la zone de messages après un patch (contenu changé). */
  #remeasure() {
    if (typeof this._measure === "function") {
      requestAnimationFrame(() => this._measure());
    }
  }

  /**
   * L'écran d'accueil vit dans le fil de discussion : il occupe la surface de
   * conversation (centré verticalement) tant qu'aucun message n'a été échangé,
   * puis disparaît pour laisser place à la discussion.
   */
  #placeWelcome() {
    const messages = Array.isArray(this.ctx.state?.messages) ? this.ctx.state.messages : [];
    const empty = messages.length === 0;
    const show = empty || usageOf(this.ctx).identity;

    this.messages.el.classList.toggle("is-empty", empty);
    this.messages.setLeading(show ? this.welcome.el : null);
  }
}
