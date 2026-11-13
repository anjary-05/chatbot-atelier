// Avatar du visiteur : toujours une icône représentative, jamais d'initiales.
import { expect, it } from "vitest";
import { createMockContext, mountTemplate } from "@onirtech/template-sdk/testing";
import "../src/index.js";
import "../src/widget.js";
import { store } from "../src/core/store.js";

const chatState = () => ({
  phase: "chat",
  status: "en_cours",
  typing: false,
  messages: [{ id: "u1", role: "user", content: "Bonjour", medias: [], at: "2026-01-01T00:00:00Z" }],
});

it("retombe sur « profile » quand user_icon est inconnue", () => {
  store.reset();
  const ctx = createMockContext({
    capabilities: ["messages", "media", "theme"],
    params: { user_icon: "bidule-inconnue" },
    theme: {},
    state: chatState(),
  });
  const { el } = mountTemplate("onirtech-template-chatbot-atelier", ctx);
  const avatar = el.shadowRoot.querySelector(".atelier-msg--user .atelier-avatar");
  expect(avatar?.getAttribute("data-icon")).toBe("profile");
  expect(avatar?.querySelector("svg")).toBeTruthy();
});

it("retombe sur « profile » quand user_icon est vide", () => {
  store.reset();
  const ctx = createMockContext({
    capabilities: ["messages", "media", "theme"],
    params: { user_icon: "" },
    theme: {},
    state: chatState(),
  });
  const { el } = mountTemplate("onirtech-template-chatbot-atelier", ctx);
  const avatar = el.shadowRoot.querySelector(".atelier-msg--user .atelier-avatar");
  expect(avatar?.getAttribute("data-icon")).toBe("profile");
});

it("conserve l'icône choisie quand elle est valide", () => {
  store.reset();
  const ctx = createMockContext({
    capabilities: ["messages", "media", "theme"],
    params: { user_icon: "guest" },
    theme: {},
    state: chatState(),
  });
  const { el } = mountTemplate("onirtech-template-chatbot-atelier", ctx);
  const avatar = el.shadowRoot.querySelector(".atelier-msg--user .atelier-avatar");
  expect(avatar?.getAttribute("data-icon")).toBe("guest");
});
