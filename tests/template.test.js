import { expect, it } from "vitest";
import { createMockContext, mountTemplate } from "@onirtech/template-sdk/testing";
import manifest from "../onirtech.template.json";
import "../src/index.js";
import "../src/widget.js";
import { store } from "../src/core/store.js";

const PAGE = manifest.ui.element;
const WIDGET = manifest.ui.widget.element;

/**
 * Jeu de sentinelles : chaque paramètre reçoit une valeur unique et
 * reconnaissable. Le test de couverture vérifie que CHAQUE variable du
 * manifeste pilote réellement l'affichage — c'est la garantie que le template
 * est entièrement paramétré (aucun texte figé dans le code).
 */
const PIPE_KEYS = new Set(["nav_items", "name_field", "email_field"]);
const LINE_KEYS = new Set(["info_title"]);
const PAIR_KEYS = new Set(["info_rows"]);

// Les suggestions affichent leur libellé ; la question n'est envoyée qu'au clic
// (elle n'apparaît donc jamais dans le rendu).
const SUGGESTION_QUESTIONS = {
  ZZ_SUG_A: "ZZ_SUG_A_QUESTION",
  ZZ_SUG_B: "ZZ_SUG_B_QUESTION",
};

const SENTINELS = {
  brand_name: "ZZ_BRAND",
  brand_crumbs: "ZZ_CRUMB",
  nav_items: ["ZZ_NAV_1", "ZZ_NAV_2"],
  counter_label: "ZZ_COUNTER",
  status_active: "ZZ_STATUS_ACTIVE",
  status_done: "ZZ_STATUS_DONE",
  bot_name: "ZZ_BOT",
  bot_role: "ZZ_ROLE",
  bot_avatar_image: "https://example.com/bot.png",
  user_label: "ZZ_USER",
  user_icon: "guest",
  welcome_message: "ZZ_WELCOME",
  input_placeholder: "ZZ_PLACEHOLDER",
  send_label: "ZZ_SEND",
  finish_label: "ZZ_FINISH",
  typing_text: "ZZ_TYPING",
  phase_label: "ZZ_PHASE",
  composer_hint: "ZZ_HINT",
  info_kicker: "ZZ_INFO_KICKER",
  info_title: ["ZZ_INFO_1", "ZZ_INFO_2"],
  info_metric: "ZZ_METRIC",
  info_tag: "ZZ_TAG",
  info_rows: [
    ["ZZ_ROW_A", "ZZ_ROW_A_TEXT"],
    ["ZZ_ROW_B", "ZZ_ROW_B_TEXT"],
  ],
  action_kicker: "ZZ_ACTION_KICKER",
  action_title: "ZZ_ACTION_TITLE",
  suggestion_items: ["ZZ_SUG_A", "ZZ_SUG_B"],
  toggle_label: "ZZ_TOGGLE",
  toggle_saved_label: "ZZ_TOGGLE_SAVED",
  action_note: "ZZ_ACTION_NOTE",
  identity_kicker: "ZZ_ID_KICKER",
  identity_title: "ZZ_ID_TITLE",
  identity_text: "ZZ_ID_TEXT",
  name_field: ["ZZ_NAME_LABEL", "ZZ_NAME_PH"],
  email_field: ["ZZ_EMAIL_LABEL", "ZZ_EMAIL_PH"],
  consent_label: "ZZ_CONSENT",
  start_label: "ZZ_START",
  footer_left: "ZZ_FOOT_LEFT",
  footer_right: "ZZ_FOOT_RIGHT",
  details_label: "ZZ_DETAILS",
  primary_color: "#123456",
};

/** Valeur de paramètre conforme à la convention de lecture du template. */
function sentinelValue(key) {
  const value = SENTINELS[key];
  if (key === "suggestion_items") {
    return value.map((label) => `${label}|${SUGGESTION_QUESTIONS[label]}`).join("\n");
  }
  if (!Array.isArray(value)) return value;
  if (PIPE_KEYS.has(key)) return value.join(" | ");
  if (LINE_KEYS.has(key)) return value.join("\n");
  if (PAIR_KEYS.has(key)) return value.map((pair) => pair.join("|")).join("\n");
  return value[0];
}

const sentinelParams = Object.fromEntries(
  Object.keys(SENTINELS).map((key) => [key, sentinelValue(key)]),
);

const context = (overrides = {}) =>
  createMockContext({
    capabilities: manifest.capabilities,
    params: sentinelParams,
    theme: {},
    ...overrides,
  });

const chatState = (overrides = {}) => ({
  phase: "chat",
  status: "en_cours",
  typing: false,
  messages: [
    { id: "1", role: "assistant", content: "ZZ_REPLY", medias: [], at: "2026-01-01T00:00:00Z" },
    { id: "2", role: "user", content: "ZZ_QUESTION", medias: [], at: "2026-01-01T00:00:01Z" },
  ],
  ...overrides,
});

/** Texte + attributs rendus par un contexte. */
function rendered(ctx, prepare) {
  const { el } = mountTemplate(PAGE, ctx);
  const root = el.shadowRoot;
  prepare?.(root);
  const attributes = [...root.querySelectorAll("[src], [alt], [placeholder], [style], [aria-label], [data-icon]")]
    .map(
      (node) =>
        `${node.getAttribute("src") ?? ""} ${node.getAttribute("alt") ?? ""} ${node.getAttribute("placeholder") ?? ""} ${node.getAttribute("aria-label") ?? ""} ${node.getAttribute("data-icon") ?? ""} ${node.getAttribute("style") ?? ""}`,
    )
    .join(" ");
  return `${root.textContent || ""} ${attributes}`;
}

it("pilote chaque variable déclarée, quelle que soit la phase", () => {
  store.reset();
  const renderedStates = [
    rendered(context()),
    rendered(context({ state: chatState() })),
    // Aucun texte de consentement fourni par l'hôte : le template retombe sur
    // sa variable `consent_label`.
    rendered(context({ consent: null })),
    rendered(context({ state: chatState({ typing: true, messages: [] }) })),
    rendered(context({ state: chatState({ status: "finalisee", messages: [] }) })),
    // Panneau de détails déployé : les variables d'information apparaissent.
    rendered(context({ state: chatState() }), (root) =>
      root.querySelector(".chat-more")?.dispatchEvent(new Event("click")),
    ),
    // Interrupteur « sauvegarder » activé : le libellé alternative s'affiche.
    rendered(context({ state: chatState() }), (root) =>
      root.querySelector(".btn-save")?.dispatchEvent(new Event("click")),
    ),
  ].join(" \n ");

  for (const [key, value] of Object.entries(SENTINELS)) {
    const parts = (Array.isArray(value) ? value : [value]).flat();
    for (const part of parts) {
      const found = renderedStates.includes(part);
      expect(found, `la variable ${key} (${part}) doit piloter l'affichage`).toBe(true);
    }
  }
});

it("déclare autant de variables que le manifeste et respecte le plafond", () => {
  expect(Object.keys(SENTINELS).sort()).toEqual(manifest.params.map((p) => p.key).sort());
  expect(manifest.params.length).toBeLessThanOrEqual(40);
});

it("envoie le message saisi à l'hôte", () => {
  store.reset();
  const sent = [];
  const base = context({ state: chatState() });
  const ctx = { ...base, actions: { ...base.actions, sendMessage: (text) => sent.push(text) } };
  const { el } = mountTemplate(PAGE, ctx);
  const input = el.shadowRoot.querySelector(".composer-input");

  input.value = "  Bonjour  ";
  input.dispatchEvent(new Event("input"));
  input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

  expect(sent).toEqual(["Bonjour"]);
  expect(store.draft).toBe("");
});

it("soumet l'identité à l'hôte", () => {
  store.reset();
  const submitted = [];
  const base = context();
  const ctx = {
    ...base,
    actions: { ...base.actions, submitIdentity: (data) => submitted.push(data) },
  };
  const { el } = mountTemplate(PAGE, ctx);
  const root = el.shadowRoot;

  root.querySelector("input[name=nom]").value = "Ada";
  root.querySelector("input[name=email]").value = "ada@example.com";
  root.querySelector(".identity-form").dispatchEvent(new Event("submit"));

  expect(submitted).toEqual([{ nom: "Ada", email: "ada@example.com", consentement: false }]);
});

it("bascule de l'identité vers la discussion quand l'hôte change de phase", () => {
  store.reset();
  const { el } = mountTemplate(PAGE, context());
  expect(el.shadowRoot.querySelector(".identity-form")).toBeTruthy();

  el.onirtechContext = context({ state: chatState() });
  expect(el.shadowRoot.querySelector(".identity-form")).toBeFalsy();
  expect(el.shadowRoot.querySelector(".atelier-card--chat")).toBeTruthy();
  expect(el.shadowRoot.querySelector(".atelier-msg--assistant")).toBeTruthy();
});

it("conserve le brouillon saisi quand l'hôte rediffuse le contexte", () => {
  store.reset();
  const { el } = mountTemplate(PAGE, context({ state: chatState() }));
  const input = el.shadowRoot.querySelector(".composer-input");

  input.value = "en cours de frappe";
  input.dispatchEvent(new Event("input"));

  el.onirtechContext = context({ state: chatState({ typing: true }) });
  expect(el.shadowRoot.querySelector(".composer-input").value).toBe("en cours de frappe");
});

it("utilise le menu de secours de l'hôte quand il existe", () => {
  store.reset();
  const selected = [];
  const base = context({
    state: chatState({
      messages: [],
      fallback: {
        intro: "Intro",
        questions: [{ id: "q1", label: "ZZ_HOST_QUESTION" }],
        showCollectionForm: false,
      },
    }),
  });
  const ctx = {
    ...base,
    actions: { ...base.actions, selectFallback: (id) => selected.push(id) },
  };
  const { el } = mountTemplate(PAGE, ctx);
  const root = el.shadowRoot;

  expect(root.textContent).toContain("ZZ_HOST_QUESTION");
  expect(root.textContent).not.toContain("ZZ_SUG_A");

  root.querySelector(".seg-item").dispatchEvent(new Event("click"));
  expect(selected).toEqual(["q1"]);
});

it("ouvre et ferme le panneau du widget via les actions de l'hôte", () => {
  store.reset();
  const calls = [];
  const base = context({ surface: "widget", state: chatState({ messages: [] }) });
  const ctx = {
    ...base,
    actions: {
      ...base.actions,
      openWidget: (size) => calls.push(["open", size]),
      closeWidget: () => calls.push(["close"]),
    },
  };
  const { el } = mountTemplate(WIDGET, ctx);
  const root = el.shadowRoot;

  root.querySelector(".widget-launcher").dispatchEvent(new Event("click"));
  expect(calls[0][0]).toBe("open");
  expect(calls[0][1]).toMatchObject({ width: 420, height: 680 });
  expect(root.querySelector(".widget-panel")).toBeTruthy();

  root.querySelector(".widget-close").dispatchEvent(new Event("click"));
  expect(calls[1]).toEqual(["close"]);
  expect(root.querySelector(".widget-launcher")).toBeTruthy();
});

it("ne rend jamais le formulaire d'identité en surface widget", () => {
  store.reset();
  const base = context({ surface: "widget" });
  const { el } = mountTemplate(WIDGET, base);
  const root = el.shadowRoot;

  expect(root.querySelector("input[name=nom]")).toBeFalsy();
  expect(root.querySelector(".identity-form")).toBeFalsy();
});
