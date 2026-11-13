// Contraste de l'accent : l'hôte peut imposer une couleur claire (ex. blanc) ;
// le template choisit alors un texte foncé au lieu d'un blanc illisible.
import { expect, it } from "vitest";
import { createMockContext, mountTemplate } from "@onirtech/template-sdk/testing";
import { accentContrastOf } from "../src/core/theme.js";
import "../src/index.js";
import "../src/widget.js";
import { store } from "../src/core/store.js";

it("garde le blanc sur un accent foncé", () => {
  expect(accentContrastOf("#111111")).toBe("#ffffff");
  expect(accentContrastOf("#023777")).toBe("#ffffff");
  expect(accentContrastOf("#777777")).toBe("#ffffff");
});

it("bascule sur l'encre sur un accent clair", () => {
  expect(accentContrastOf("#ffffff")).toBe("#111111");
  expect(accentContrastOf("#f5f5f5")).toBe("#111111");
  expect(accentContrastOf("#ffffff80")).toBe("#111111");
  expect(accentContrastOf("rgb(255, 255, 255)")).toBe("#111111");
});

it("retombe sur blanc si la couleur n'est pas parsable", () => {
  expect(accentContrastOf("pas-une-couleur")).toBe("#ffffff");
  expect(accentContrastOf("")).toBe("#ffffff");
});

it("pose --on-accent en surface page quand l'hôte impose un accent blanc", () => {
  store.reset();
  const ctx = createMockContext({
    capabilities: ["messages", "media", "theme"],
    theme: { primary: "#ffffff" },
    state: {
      phase: "chat",
      status: "en_cours",
      typing: false,
      messages: [{ id: "1", role: "user", content: "ZZ", medias: [], at: "2026-01-01T00:00:00Z" }],
    },
  });
  const { el } = mountTemplate("onirtech-template-chatbot-atelier", ctx);
  const root = el.shadowRoot.querySelector(".atelier");
  expect(root.style.getPropertyValue("--accent")).toBe("#ffffff");
  expect(root.style.getPropertyValue("--on-accent")).toBe("#111111");
});

it("pose --on-accent en surface widget quand l'hôte impose un accent blanc", () => {
  store.reset();
  const ctx = createMockContext({
    surface: "widget",
    capabilities: ["messages", "media", "theme"],
    theme: { primary: "#ffffff" },
    state: {
      phase: "chat",
      status: "en_cours",
      typing: false,
      messages: [{ id: "1", role: "user", content: "ZZ", medias: [], at: "2026-01-01T00:00:00Z" }],
    },
  });
  const { el } = mountTemplate("onirtech-widget-chatbot-atelier", ctx);
  const root = el.shadowRoot.querySelector(".atelier");
  expect(root.style.getPropertyValue("--on-accent")).toBe("#111111");
});
