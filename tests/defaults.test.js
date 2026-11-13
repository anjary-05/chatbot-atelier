import { expect, it } from "vitest";
import { createMockContext, mountTemplate } from "@onirtech/template-sdk/testing";
import manifest from "../onirtech.template.json";
import "../src/index.js";
import "../src/widget.js";
import { store } from "../src/core/store.js";

// Garde-fou : le harness et le dashboard injectent TOUS les paramètres déclarés
// avec leur valeur par défaut. Un rendu qui casse avec ces valeurs (variable
// non définie, média absent…) doit être détecté ici, pas en production.
const PAGE = manifest.ui.element;
const WIDGET = manifest.ui.widget.element;
const defaults = Object.fromEntries(manifest.params.map((item) => [item.key, item.default]));

const base = (overrides = {}) =>
  createMockContext({
    capabilities: manifest.capabilities,
    params: defaults,
    theme: {},
    ...overrides,
  });

it("rend la phase identité avec les paramètres par défaut du manifeste", () => {
  store.reset();
  const { el } = mountTemplate(PAGE, base());
  const root = el.shadowRoot;
  const text = root.textContent || "";

  expect(text).not.toContain("Une erreur est survenue");
  expect(root.querySelector(".chat-welcome")).toBeTruthy();
  expect(root.querySelector("input[name=nom]")).toBeTruthy();
  expect(root.querySelector("input[name=email]")).toBeTruthy();
  expect(text).toContain(defaults.brand_name);
  expect(text).toContain(defaults.start_label);
});

it("rend la phase discussion avec les paramètres par défaut du manifeste", () => {
  store.reset();
  const { el } = mountTemplate(
    PAGE,
    base({
      state: {
        phase: "chat",
        status: "en_cours",
        typing: false,
        messages: [
          { id: "1", role: "assistant", content: "Bonjour !", medias: [], at: "2026-01-01T00:00:00Z" },
        ],
      },
    }),
  );
  const root = el.shadowRoot;
  const text = root.textContent || "";

  expect(text).not.toContain("Une erreur est survenue");
  expect(text).toContain("Bonjour !");
  expect(text).toContain(defaults.bot_name);
  expect(root.querySelector(".atelier-card--chat")).toBeTruthy();
  expect(root.querySelector(".atelier-msg--assistant")).toBeTruthy();
});

it("présente la discussion en colonne unique centrée", () => {
  store.reset();
  const { el } = mountTemplate(PAGE, base());
  const root = el.shadowRoot;

  expect(root.querySelector(".atelier-stage")).toBeTruthy();
  expect(root.querySelector(".atelier-card--chat")).toBeTruthy();
  expect(root.querySelector(".board-col--left")).toBeFalsy();
  expect(root.querySelector(".board-col--right")).toBeFalsy();
  expect(root.querySelector(".chat-welcome")).toBeTruthy();
  expect(root.querySelector(".atelier-composer")).toBeTruthy();
});

it("montre le launcher du widget puis son panneau", () => {
  store.reset();
  const ctx = base({
    surface: "widget",
    state: { phase: "chat", status: "en_cours", typing: false, messages: [] },
  });
  const { el } = mountTemplate(WIDGET, ctx);
  const root = el.shadowRoot;

  expect(root.querySelector(".widget-launcher")).toBeTruthy();
  expect(root.querySelector(".widget-panel")).toBeFalsy();
  expect(root.textContent || "").not.toContain("Une erreur est survenue");
});

it("n'expose aucun secret dans les variables", () => {
  for (const param of manifest.params) {
    const value = String(param.default);
    expect(value).not.toMatch(/token|secret|password|api[_-]?key/i);
  }
});
