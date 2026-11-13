// Avatar du bot ou du visiteur.
//
// • Le bot peut recevoir une image téléversée depuis le panneau (paramètre de
//   type `image`) ; à défaut, ses initiales sont affichées.
// • Le visiteur n'a pas d'image : c'est une icône par défaut, choisie par le
//   paramètre `user_icon` (repli « profile » si valeur inconnue).
//
// Repli visuel : initiales sur un disque, si aucune image n'est fournie.
import { Component } from "../core/component.js";
import { el, svg } from "../core/dom.js";

/** Initiales d'un nom (2 maximum). */
function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "?";
}

/**
 * Icônes par défaut du visiteur (24×24, tracé technique).
 * `profile` silhouette générique (visiteur par défaut), `guest` silhouette
 * cerclée, `anonymous` point d'interrogation.
 */
const SILHOUETTE = () =>
  svg("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.5" }, [
    svg("circle", { cx: "12", cy: "8", r: "3.4" }),
    svg("path", { d: "M4.5 20c0-4 3.4-6.2 7.5-6.2s7.5 2.2 7.5 6.2" }),
  ]);

const ICONS = {
  profile: SILHOUETTE,
  person: SILHOUETTE,
  guest: () =>
    svg("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.5" }, [
      svg("circle", { cx: "12", cy: "12", r: "9.2", "stroke-dasharray": "2.6 2.6" }),
      svg("circle", { cx: "12", cy: "9.6", r: "2.6" }),
      svg("path", { d: "M7.2 18.4c0-2.6 2.2-4.1 4.8-4.1s4.8 1.5 4.8 4.1" }),
    ]),
  anonymous: () =>
    svg("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.5" }, [
      svg("circle", { cx: "12", cy: "12", r: "9" }),
      svg("path", { d: "M9.7 9.3a2.5 2.5 0 1 1 3.1 2.4c-.7.3-1 .9-1 1.6v.3" }),
      svg("circle", { cx: "11.8", cy: "16.5", r: "0.85", fill: "currentColor", stroke: "none" }),
    ]),
};

export class Avatar extends Component {
  /**
   * @param {object} ctx
   * @param {object} store
   * @param {{ url?: string, label?: string, size?: number, tone?: "bot" | "user", icon?: string }} options
   */
  constructor(ctx, store, options = {}) {
    super(ctx, store);
    this.url = options.url ?? "";
    this.label = options.label ?? "";
    this.size = options.size ?? 40;
    this.tone = options.tone ?? "bot";
    this.icon = options.icon ?? "profile";
    this.el = el("span", {
      class: `atelier-avatar atelier-avatar--${this.tone}`,
      style: { "--av-size": `${this.size}px` },
    });
    this.#render();
  }

  patch() {
    this.#render();
  }

  #render() {
    const url = String(this.url || "").trim();
    if (url !== "") {
      this.el.classList.remove("atelier-avatar--fallback", "atelier-avatar--icon");
      this.el.textContent = "";
      this.el.appendChild(
        el("img", {
          src: url,
          alt: this.label,
          loading: "lazy",
          decoding: "async",
        }),
      );
      return;
    }

    // Le visiteur a toujours une icône représentative : toute valeur vide ou
    // inconnue du paramètre `user_icon` retombe sur « profile ».
    if (this.tone === "user") {
      const key = Object.hasOwn(ICONS, this.icon) ? this.icon : "profile";
      this.el.classList.remove("atelier-avatar--fallback");
      this.el.classList.add("atelier-avatar--icon");
      this.el.textContent = "";
      this.el.setAttribute("aria-label", this.label);
      this.el.setAttribute("role", "img");
      this.el.setAttribute("data-icon", key);
      this.el.appendChild(ICONS[key]());
      return;
    }

    this.el.classList.remove("atelier-avatar--icon");
    this.el.removeAttribute("data-icon");
    this.el.classList.add("atelier-avatar--fallback");
    this.el.textContent = initials(this.label);
    this.el.setAttribute("aria-label", this.label);
    this.el.setAttribute("role", "img");
  }
}
