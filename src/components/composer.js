// Composeur de message (champ + envoi + fin de conversation + mémorisation).
//
// Le brouillon est conservé dans le store : une rediffusion de l'hôte ne doit
// jamais effacer ce que le visiteur est en train d'écrire.
import { Component } from "../core/component.js";
import { el } from "../core/dom.js";
import { usageOf } from "../core/surface.js";

export class Composer extends Component {
  constructor(ctx, store) {
    super(ctx, store);
    this.input = el("input", {
      class: "composer-input",
      type: "text",
      autocomplete: "off",
      spellcheck: "false",
    });
    this.sendButton = el("button", { type: "submit", class: "btn btn-black btn-send" });
    this.finishButton = el("button", { type: "button", class: "btn btn-ghost btn-finish" });
    this.saveButton = el("button", { type: "button", class: "btn btn-save" });
    this.hint = el("p", { class: "composer-hint" });

    this.input.addEventListener("input", () => {
      this.store.draft = this.input.value;
    });
    this.input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        this.#send();
      }
    });

    this.el = el(
      "form",
      { class: "atelier-composer", novalidate: "true" },
      el("div", { class: "composer-row" }, this.input, this.sendButton, this.finishButton),
      el("div", { class: "composer-foot" }, this.saveButton, this.hint),
    );
    this.el.addEventListener("submit", (event) => {
      event.preventDefault();
      this.#send();
    });

    this.#render();
  }

  patch() {
    this.#render();
  }

  #render() {
    const params = this.params;
    const placeholder = params.text("input_placeholder", "Écrivez votre message…");
    const sendLabel = params.text("send_label", "ENVOYER");
    const finishLabel = params.text("finish_label", "TERMINER");
    const saveLabel = params.text("toggle_label", "SAVER");
    const savedLabel = params.text("toggle_saved_label", "SAVED");
    const hint = params.text("composer_hint", "Entrée pour envoyer");
    const finished = this.ctx.state?.status === "finalisee";
    const typing = this.ctx.state?.typing === true;
    const identity = usageOf(this.ctx).identity;

    // Phase identité : pas de champ d'envoi — le visiteur remplit le formulaire
    // d'accueil, puis le fil s'ouvre avec le composer.
    this.el.hidden = identity;

    if (this.input.placeholder !== placeholder) this.input.placeholder = placeholder;
    if (this.input.value !== this.store.draft) this.input.value = this.store.draft;
    this.input.setAttribute("aria-label", placeholder);
    this.input.disabled = finished;

    this.sendButton.textContent = sendLabel;
    this.sendButton.disabled = finished || typing;
    this.finishButton.textContent = finishLabel;
    this.finishButton.disabled = finished;

    this.saveButton.textContent = this.store.saved ? savedLabel : saveLabel;
    this.saveButton.classList.toggle("is-saved", this.store.saved === true);
    this.saveButton.disabled = finished;

    this.hint.textContent = finished ? params.text("status_done", "Conversation terminée") : hint;

    this.finishButton.onclick = () => {
      if (finished) return;
      this.ctx.actions?.finish?.();
    };
    this.saveButton.onclick = () => {
      this.store.saved = !this.store.saved;
      this.#render();
    };
  }

  /** Envoi du brouillon (trim, non vide, conversation ouverte). */
  #send() {
    const value = this.store.draft.trim();
    if (value === "") return;
    if (this.ctx.state?.status === "finalisee") return;
    if (this.ctx.state?.typing === true) return;
    this.ctx.actions?.sendMessage?.(value);
    this.store.draft = "";
    this.input.value = "";
  }
}
