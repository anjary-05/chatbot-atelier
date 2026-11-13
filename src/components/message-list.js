// Liste des messages de la discussion.
//
// Deux partis pris, calqués sur le comportement d'un chat moderne :
//   • le fil s'appuie sur le composeur et remonte au fur et à mesure ; le
//     défilement n'est forcé vers le bas que si le visiteur y était déjà ;
//   • un bouton « redescendre » apparaît dès que le visiteur remonte dans
//     l'historique, sans jamais lui voler la position de lecture.
//
// Le contenu conversationnel est adapté par une fonction générique
// (`src/core/conversation.js`) : texte brut, blocs multimodaux (texte + image)
// et blocs génératifs (résultat d'outil) sont tous rendus en bulle.
//
// Les nœuds sont conservés d'une rediffusion à l'autre : seules les
// différences sont appliquées (même identifiant de message), ce qui évite le
// clignotement et préserve le défilement.
import { hasCapability } from "@onirtech/template-sdk";
import { Component } from "../core/component.js";
import { messageImages, messageText, messageToolResult } from "../core/conversation.js";
import { renderMarkdown } from "../core/markdown.js";
import { el } from "../core/dom.js";
import { Avatar } from "./avatar.js";

/**
 * Remplit un nœud `.msg-text` : réponses de l'IA rendues comme une interface
 * conversationnelle (markdown structuré), réponses du visiteur telles quelles.
 */
function fillMessageText(node, message) {
  if (message?.role === "user") {
    node.textContent = messageText(message);
    return;
  }
  renderMarkdown(node, messageText(message));
}

/** Distance (px) à laquelle la conversation est considérée « en bas ». */
const STICK_THRESHOLD = 32;

export class MessageList extends Component {
  constructor(ctx, store) {
    super(ctx, store);
    this.log = el("div", { class: "atelier-log" });
    this.button = el("button", {
      type: "button",
      class: "chat-scroll-down",
      "aria-label": "Descendre dans la conversation",
      text: "↓",
      hidden: "true",
    });
    this.el = el("div", { class: "chat-stream" }, this.log, this.button);
    this.nodes = new Map();
    /** Nœud placé avant le premier message (écran d'accueil). */
    this.leading = null;
    /** Le fil est-il collé au bas ? */
    this.stick = true;
    /** Ignore les événements de défilement pendant une reconstruction. */
    this.muting = false;

    this.log.addEventListener("scroll", () => this.#onScroll());
    this.button.addEventListener("click", () => this.#toBottom(true));
    this.#render();
  }

  /**
   * Place un bloc (écran d'accueil) avant le premier message.
   * Le bloc est inséré dans le conteneur défilant : il défile avec le fil.
   */
  setLeading(node) {
    const previous = this.leading;
    this.leading = node ?? null;
    if (node !== null) {
      if (node.parentNode !== this.log) this.log.prepend(node);
      return;
    }
    if (previous !== null && previous.parentNode === this.log) previous.remove();
  }

  patch() {
    this.#render();
  }

  afterMount() {
    this.#scroll();
  }

  /** Messages affichés (l'accueil est piloté par le composant `Welcome`). */
  #messages() {
    return Array.isArray(this.ctx.state?.messages) ? this.ctx.state.messages : [];
  }

  #render() {
    const messages = this.#messages();
    const seen = new Set();
    let previous = null;

    this.muting = true;
    for (const message of messages) {
      const id = String(message.id ?? previous?.id ?? messages.indexOf(message));
      seen.add(id);
      let node = this.nodes.get(id);
      if (node === undefined) {
        node = this.#create(message, id);
        this.nodes.set(id, node);
      } else {
        this.#update(node, message);
      }
      if (previous === null) {
        if (this.leading !== null) {
          if (this.leading.nextSibling !== node) this.leading.after(node);
        } else if (this.log.firstChild !== node) {
          this.log.prepend(node);
        }
      } else if (previous.nextSibling !== node) {
        previous.after(node);
      }
      previous = node;
    }

    for (const [id, node] of [...this.nodes]) {
      if (!seen.has(id)) {
        node.remove();
        this.nodes.delete(id);
      }
    }

    this.#scroll();
    requestAnimationFrame(() => {
      this.muting = false;
    });
  }

  /** Bulle d'un message (assistant ou visiteur), adaptée à l'interface. */
  #create(message, id) {
    const isUser = message.role === "user";
    const who = isUser
      ? this.params.text("user_label", "Vous")
      : this.params.text("bot_name", "Assistant");
    const avatar = new Avatar(this.ctx, this.store, {
      url: isUser ? "" : this.params.text("bot_avatar_image", ""),
      label: who,
      size: 28,
      tone: isUser ? "user" : "bot",
      icon: this.params.text("user_icon", "profile"),
    });

    // Rempli par `#update` (texte riche markdown pour les réponses de l'IA).
    const content = el("div", { class: isUser ? "msg-text" : "msg-text msg-text--rich" });
    const bubble = el(
      "div",
      { class: "msg-bubble" },
      el("span", { class: "msg-who", text: who }),
      content,
    );

    const node = el(
      "article",
      { class: `atelier-msg atelier-msg--${isUser ? "user" : "assistant"}`, "data-id": id },
      avatar.el,
      bubble,
    );

    this.#update(node, message);
    return node;
  }

  /** Mise à jour d'une bulle existante (texte, médias, outil, sources). */
  #update(node, message) {
    const text = node.querySelector(".msg-text");
    if (text !== null) fillMessageText(text, message);

    let medias = node.querySelector(".msg-medias");
    const images = messageImages(message);
    if (images.length === 0) {
      medias?.remove();
    } else {
      if (medias === null) {
        medias = el("div", { class: "msg-medias" });
        node.querySelector(".msg-bubble")?.appendChild(medias);
      }
      medias.replaceChildren(
        ...images.map((image) =>
          el("img", { class: "msg-photo", src: image.url, alt: image.alt, loading: "lazy" }),
        ),
      );
    }

    const tool = messageToolResult(message);
    let toolBox = node.querySelector(".msg-tool");
    if (tool === null) {
      toolBox?.remove();
    } else {
      if (toolBox === null) {
        toolBox = el("div", { class: "msg-tool" });
        node.querySelector(".msg-bubble")?.appendChild(toolBox);
      }
      toolBox.replaceChildren(
        el("div", { class: "msg-tool-head" }, el("span", { class: "msg-tool-name", text: tool.tool ?? "" })),
        this.#toolBody(tool),
      );
    }

    const chips = node.querySelector(".msg-chips");
    const refs = [];
    if (hasCapability(this.ctx, "knowledge") && Array.isArray(message.knowledge)) {
      for (const knowledge of message.knowledge) {
        refs.push({ label: knowledge.titre ?? knowledge.ref ?? "", tone: "knowledge" });
      }
    }
    if (hasCapability(this.ctx, "userState") && message.userState != null) {
      refs.push({ label: message.userState.label ?? "", tone: "state" });
    }
    if (refs.length === 0) {
      chips?.remove();
    } else {
      const container = chips ?? el("div", { class: "msg-chips" });
      container.replaceChildren(
        ...refs.map((ref) => el("span", { class: `chip chip--${ref.tone}`, text: ref.label })),
      );
      if (chips === null) node.querySelector(".msg-bubble")?.appendChild(container);
    }
  }

  /** Lignes de champs d'un résultat d'outil (génératif). */
  #toolBody(tool) {
    const body = el("div", { class: "msg-tool-body" });
    const items = Array.isArray(tool.items) ? tool.items : [];
    for (const item of items) {
      const fields = Array.isArray(item?.fields) ? item.fields : [];
      const row = el("div", { class: "msg-tool-row" });
      for (const field of fields) {
        row.appendChild(
          el(
            "div",
            { class: "msg-tool-field" },
            el("span", { class: "msg-tool-label", text: field.label ?? field.key ?? "" }),
            el("span", { class: "msg-tool-value", text: String(field.value ?? "") }),
          ),
        );
      }
      body.appendChild(row);
    }
    return body;
  }

  /** Le visiteur a-t-il parcouru l'historique vers le haut ? */
  #onScroll() {
    if (this.muting) return;
    const distance = this.log.scrollHeight - this.log.clientHeight - this.log.scrollTop;
    this.stick = distance <= STICK_THRESHOLD;
    this.store.scrollTop = this.log.scrollTop;
    this.button.hidden = this.stick;
  }

  /** Descend en bas du fil (animation douce si demandé). */
  #toBottom(smooth) {
    this.stick = true;
    this.store.scrollTop = this.log.scrollHeight;
    this.button.hidden = true;
    if (smooth && typeof this.log.scrollTo === "function") {
      const reduced =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      try {
        this.log.scrollTo({ top: this.log.scrollHeight, behavior: reduced ? "auto" : "smooth" });
        return;
      } catch {
        /* repli sur l'affectation directe */
      }
    }
    this.log.scrollTop = this.log.scrollHeight;
  }

  /**
   * Position de défilement : on suit le bas si le visiteur y était, sinon on
   * restaure sa position de lecture.
   */
  #scroll() {
    if (this.stick) {
      this.log.scrollTop = this.log.scrollHeight;
      this.store.scrollTop = this.log.scrollTop;
    } else {
      this.log.scrollTop = this.store.scrollTop;
    }
    this.button.hidden = this.stick;
  }
}
