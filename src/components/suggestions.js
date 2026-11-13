// Barre de suggestions : les entrées de départ de la conversation.
//
// Priorité au menu de secours fourni par l'hôte (capacité `fallback`) ; à
// défaut, les variables `suggestion_items`. Les trois premières suggestions
// sont présentées dans le sélecteur à curseur noir du style « Spin Product »,
// les suivantes en pastilles.
import { hasCapability } from "@onirtech/template-sdk";
import { Component } from "../core/component.js";
import { el, fill } from "../core/dom.js";

const MAX_IN_SELECTOR = 3;

export class Suggestions extends Component {
  constructor(ctx, store) {
    super(ctx, store);
    this.enabled = true;
    this.el = el("section", { class: "chat-suggestions", hidden: "true" });
    this.#render();
  }

  patch() {
    this.#render();
  }

  /** Active ou masque la barre (masquée tant que l'identité n'est pas faite). */
  setEnabled(enabled) {
    this.enabled = enabled === true;
    this.#render();
  }

  /** Suggestions disponibles : menu de secours de l'hôte ou variables. */
  #items() {
    const fallback =
      hasCapability(this.ctx, "fallback") && this.ctx.state?.fallback != null
        ? this.ctx.state.fallback
        : null;
    if (fallback !== null && Array.isArray(fallback.questions) && fallback.questions.length > 0) {
      return {
        source: "fallback",
        items: fallback.questions.map((question) => ({
          id: question.id,
          label: question.label,
        })),
      };
    }
    return {
      source: "params",
      items: this.params.pairs("suggestion_items", []).map((pair, index) => ({
        id: `param-${index}`,
        label: pair.label,
        question: pair.value === "" ? pair.label : pair.value,
      })),
    };
  }

  /** Déclenche l'action associée à une suggestion. */
  #choose(item, suggestions) {
    this.store.selectedSuggestion = item.id;
    if (suggestions.source === "fallback") {
      this.ctx.actions?.selectFallback?.(item.id);
    } else if (item.question !== undefined) {
      this.ctx.actions?.sendMessage?.(item.question);
    }
    this.#render();
  }

  #render() {
    const messages = Array.isArray(this.ctx.state?.messages) ? this.ctx.state.messages : [];
    const suggestions = this.#items();
    const items = suggestions.items;
    // Comme ChatGPT : les suggestions disparaissent dès que la conversation commence.
    if (items.length === 0 || this.enabled === false || messages.length > 0) {
      this.el.hidden = true;
      fill(this.el, []);
      return;
    }
    this.el.hidden = false;

    const params = this.params;
    const kicker = params.text("action_kicker", "OPTIONS");
    const title = params.text("action_title", "Suggestions");
    const note = params.text("action_note", "");

    const inSelector = items.slice(0, MAX_IN_SELECTOR);
    const extra = items.slice(MAX_IN_SELECTOR);
    const columns = Math.max(1, inSelector.length);
    const selectedIndex = inSelector.findIndex((item) => item.id === this.store.selectedSuggestion);

    const highlight = el("span", { class: "seg-hl", "aria-hidden": "true" });
    if (selectedIndex >= 0) {
      highlight.style.left = `${(selectedIndex * 100) / columns}%`;
      highlight.style.width = `${100 / columns}%`;
    }

    const selector = el(
      "div",
      { class: "seg", role: "group", "aria-label": title, style: { "--seg-cols": String(columns) } },
      ...inSelector.map((item, index) => {
        const isSelected = item.id === this.store.selectedSuggestion;
        const button = el("button", {
          type: "button",
          class: `seg-item${isSelected ? " is-selected" : ""}`,
          text: item.label,
          "aria-pressed": isSelected ? "true" : "false",
        });
        button.addEventListener("click", () => this.#choose(item, suggestions));
        return button;
      }),
      highlight,
    );

    const extraList =
      extra.length === 0
        ? null
        : el(
            "ul",
            { class: "suggestions" },
            ...extra.map((item) => {
              const button = el("button", {
                type: "button",
                class: "pill pill-suggestion",
                text: item.label,
              });
              button.addEventListener("click", () => this.#choose(item, suggestions));
              return el("li", {}, button);
            }),
          );

    fill(this.el, [
      el(
        "div",
        { class: "suggestions-head" },
        el("span", { class: "card-kicker", text: kicker }),
        el("span", { class: "suggestions-title", text: title }),
      ),
      selector,
      extraList,
      note === "" ? null : el("p", { class: "card-note", text: note }),
    ]);
  }
}
