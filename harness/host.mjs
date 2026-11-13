#!/usr/bin/env node
// Hôte de développement — implémente le CÔTÉ HÔTE du contrat `onirtech.template-host.v1`.
//
// Deux modes :
//   ⬢ MOCK (défaut)      : contexte et actions simulés, 100 % hors-ligne.
//   ⬢ LIVE (`?token=⬦`)  : les actions appellent le vrai backend ONIR CMS
//                          (`/api/chat/session`, `/api/chat`, `/api/chat/media`,
//                          `/api/chat/finish`) via un proxy same-origin, donc sans
//                          CORS. Le jeton du lien reste côté serveur du harness.
//
// Usage : node harness/host.mjs [--dir <dossier-du-template>] [--port 4500]
//                              [--api http://localhost:3000]
//
// LIVE  : http://localhost:4500/  (dès qu'un jeton est configuré, voir plus bas)
//         http://localhost:4500/?token=<jeton-du-lien>  (jeton ponctuel)
// MOCK  : http://localhost:4500/?mock=1  (+ ?phase=chat, ?consent=0, ?<param>=⬦)
//
// Le jeton de lien par défaut est lu dans `ONIR_LINK_TOKEN` ou, à défaut, dans
// `.onir-link-token` à la racine du projet (une ligne). Sans jeton, le harness
// reste en mock : il n'invente jamais de connexion.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
// `--dir` est relatif au répertoire courant (projet généré : `--dir .` depuis
// sa racine). Sans option, on sert le template de référence du kit.
const dirArg = opt("--dir", null);
const templateDir = dirArg
  ? resolve(process.cwd(), dirArg)
  : resolve(__dirname, "..", "template");
const port = Number(opt("--port", "4500"));
// Backend ONIR CMS (dashboard local). Surchargeable par --api ou ONIR_API_BASE.
const apiBase = (process.env.ONIR_API_BASE || opt("--api", "http://localhost:3000")).replace(
  /\/$/,
  "",
);
// Jeton de lien par défaut : `ONIR_LINK_TOKEN` ou `.onir-link-token` (racine).
const TOKEN_FILE = join(templateDir, ".onir-link-token");
let defaultToken = (process.env.ONIR_LINK_TOKEN ?? "").trim();
if (defaultToken === "") {
  try {
    defaultToken = (await readFile(TOKEN_FILE, "utf8")).trim();
  } catch {
    defaultToken = "";
  }
}

/**
 * Construit `ctx.params` : défauts du manifeste, puis surcharge par les valeurs
 * de la query string (`?titre=⬦`). Les clés non déclarées sont ignorées et les
 * valeurs sont coercées selon le type du paramètre (ADR-0024 §5.3).
 */
function buildParams(manifest, overrides = {}) {
  const declared = Array.isArray(manifest.params) ? manifest.params : [];
  const params = Object.fromEntries(declared.map((param) => [param.key, param.default]));
  for (const param of declared) {
    const raw = overrides[param.key];
    if (raw === undefined) continue;
    switch (param.type) {
      case "number": {
        const value = Number(raw);
        if (Number.isFinite(value)) params[param.key] = value;
        break;
      }
      case "boolean":
        params[param.key] = raw === "1" || raw === "true";
        break;
      case "select":
        if ((param.options ?? []).some((option) => option.value === raw)) {
          params[param.key] = raw;
        }
        break;
      default:
        params[param.key] = raw;
        break;
    }
  }
  return params;
}

const MIME = {
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".html": "text/html",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

/** Sérialise une valeur pour un <script> inline sans casser la balise. */
const inlineJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

const MOCK_CONTEXT = {
  link: { type: "standard", label: "Campagne (mock)" },
  consent: null,
  messages: [],
};

function hostPage(manifest, opts = {}) {
  const live = typeof opts.token === "string" && opts.token !== "";
  const forcedMock = opts.forceMock === true && !live;
  // Surface widget (ADR-0040) : le template démarre toujours en phase « chat »,
  // sans formulaire d'identité ni politique de confidentialité, et son bundle
  // est celui déclaré dans `ui.widget`.
  const widget = opts.surface === "widget";
  const widgetSpec = widget ? manifest.ui?.widget : undefined;
  const entry = widgetSpec?.entry ?? manifest.ui.entry;
  const elementName = widgetSpec?.element ?? manifest.ui.element;
  const startChat = widget || opts.phase === "chat";
  const consent = widget
    ? null
    : opts.consent === false
      ? null
      : {
          texte: live
            ? "J'accepte le traitement de mes données (texte réel fourni par le lien en production)."
            : "J'accepte la politique de confidentialité",
          lien: "https://example.com/confidentialite",
        };
  const ctx = {
    host: { protocol: "onirtech.template-host.v1", version: 1 },
    surface: widget ? "widget" : "page",
    link: live ? { type: "standard", label: "Lien ONIR CMS" } : MOCK_CONTEXT.link,
    locale: "fr",
    brand: { name: "ONIRTECH (mock)", logoUrl: null },
    theme: { primary: "#111111" },
    consent,
    capabilities: manifest.capabilities,
    params: buildParams(manifest, opts.params),
    state: {
      phase: startChat ? "chat" : "identity",
      status: "en_cours",
      messages: [],
      typing: false,
    },
    resources: {
      media: { photos: [], liens: [] },
      modelForm: null,
    },
  };
  if (!live && startChat) {
    ctx.state.messages = [
      {
        id: "m0",
        role: "assistant",
        content: "Bonjour ! (phase « chat » au chargement — sas sauté)",
        medias: [],
        at: new Date().toISOString(),
      },
    ];
  }
  // Option messages=N : gonfle la discussion (revue du défilement).
  const forcedMessages = Number(opts.messages);
  if (!live && Number.isFinite(forcedMessages) && forcedMessages > 1) {
    ctx.state.messages = Array.from({ length: forcedMessages }, (_, index) => ({
      id: "m" + index,
      role: index % 2 === 0 ? "assistant" : "user",
      content:
        index % 2 === 0
          ? "Message " + (index + 1) + " — réponse de l'assistant, sur plusieurs lignes pour éprouver la hauteur de la bulle et le défilement du fil."
          : "Message " + (index + 1) + " — question du visiteur.",
      medias: [],
      at: new Date().toISOString(),
    }));
  }
  if (!live) {
    ctx.resources = {
      media: {
        photos: [
          { id: "p1", libelle: "Façade de l'entreprise", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='560'%3E%3Crect width='800' height='560' fill='%23023777'/%3E%3Ctext x='40' y='300' fill='white' font-size='46' font-family='sans-serif'%3Ep1%3C/text%3E%3C/svg%3E" },
          { id: "p2", libelle: "Équipe en réunion", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='560'%3E%3Crect width='800' height='560' fill='%23b45309'/%3E%3Ctext x='40' y='300' fill='white' font-size='46' font-family='sans-serif'%3Ep2%3C/text%3E%3C/svg%3E" },
          { id: "p3", libelle: "Salle de production", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='560'%3E%3Crect width='800' height='560' fill='%23065f46'/%3E%3Ctext x='40' y='300' fill='white' font-size='46' font-family='sans-serif'%3Ep3%3C/text%3E%3C/svg%3E" },
        ],
        liens: [{ id: "l1", libelle: "Documentation (mock)", url: "https://example.com/doc" }],
      },
      modelForm: [{ name: "sujet", label: "Sujet", type: "text", required: true }],
    };
    // Menu de secours (capacité `fallback`) : le template n'invente jamais de
    // suggestions — il utilise celles fournies par l'hôte quand elles existent.
    ctx.state.fallback = {
      intro: "Quelques questions pour démarrer.",
      questions: [
        { id: "q1", label: "Obtenir un devis" },
        { id: "q2", label: "Fixer un rendez-vous" },
        { id: "q3", label: "Recevoir la documentation" },
      ],
      showCollectionForm: false,
    };
  }

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Harness — ${manifest.id}</title>
<script type="importmap">
  { "imports": { "@onirtech/template-sdk": "/sdk/index.js" } }
</script>
<style>
  #mock-banner{position:fixed;inset:0 auto auto 0;width:100%;background:${live ? "#0f766e" : "#FCAD28"};color:#fff;
    font:600 13px system-ui;padding:.35rem 1rem;text-align:center;z-index:99999}
  #mock-banner .link{color:#fff;text-decoration:underline}
  #live-error{position:fixed;left:0;right:0;bottom:0;background:#7f1d1d;color:#fff;font:600 13px system-ui;
    padding:.5rem 1rem;z-index:99999;display:none;white-space:pre-wrap}
  #live-status{background:#0f766e;color:#fff;font:500 12px system-ui;padding:.2rem 1rem;text-align:center;
    display:none;z-index:99998}
  body{margin:0;padding-top:2rem;font-family:system-ui;background:#f8fafc}
</style></head><body>
<div id="mock-banner">${
    live
      ? `LIVE — backend ${apiBase} · mode réel (les messages sont persistés) · <span class="link">?mock=1</span> pour revenir au mock`
      : forcedMock
        ? "HARNESS / MOCK forcé (<span class=\"link\">?mock=1</span>) — aucune connexion, actions simulées"
        : "HARNESS / MOCK — aucune connexion (les actions sont simulées) · ajoutez <span class=\"link\">?token=&lt;jeton-du-lien&gt;</span> pour brancher le backend"
  }</div>
<div id="live-error"></div>
<div id="live-status"></div>
<div id="host"></div>
<script type="module">
  const manifest = ${inlineJson(manifest)};
  const ctx = ${inlineJson(ctx)};
  const entry = ${inlineJson(entry)};
  const elementName = ${inlineJson(elementName)};
  const live = ${live ? "true" : "false"};
  const token = ${inlineJson(opts.token ?? null)};
  const loadedAt = Date.now();
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const listeners = new Map();
  const emit = (e, p) => (listeners.get(e) || new Set()).forEach((cb) => cb(p));

  const errBox = document.getElementById("live-error");
  const showError = (message) => {
    if (errBox === null) return;
    errBox.textContent = message;
    errBox.style.display = message === "" ? "none" : "block";
  };

  const toContractMessage = (message) => ({
    id: String(message.id ?? crypto.randomUUID()),
    role: message.role === "user" ? "user" : "assistant",
    content: String(message.content ?? ""),
    medias: Array.isArray(message.medias) ? message.medias : [],
    at: message.createdAt ?? message.at ?? new Date().toISOString(),
  });

  const statusBox = document.getElementById("live-status");
  const modeLabel = (mode) => (mode === "human" ? "opérateur" : mode);
  const setLiveStatus = (text) => {
    if (statusBox === null) return;
    statusBox.textContent = text;
    statusBox.style.display = text === "" ? "none" : "block";
  };

  // Le formulaire d'identité n'est pas horodaté côté template : on refuse les
  // soumissions instantanées (< 1,5 s) comme le fait le vrai portail.
  const waitPlausible = async () => {
    const age = Date.now() - loadedAt;
    if (age < 1500) await new Promise((resolve) => setTimeout(resolve, 1500 - age));
  };

  const postJson = async (path, body) => {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    let json = null;
    try {
      json = await response.json();
    } catch {
      json = null;
    }
    return { ok: response.ok, status: response.status, json };
  };

  let conversationId = null;
  let lastMessageAt = null;
  let interventionMode = "ai";
  let pollTimer = null;

  /** Bandeau de contexte : conversation, mode d'intervention, nombre de messages. */
  const refreshLiveStatus = () => {
    if (conversationId === null) {
      setLiveStatus("");
      return;
    }
    setLiveStatus(
      "conversation " +
        conversationId.slice(0, 8) +
        "… · mode " +
        modeLabel(interventionMode) +
        " · " +
        ctx.state.messages.length +
        " message(s)",
    );
  };

  /**
   * Polling de secours (ADR-0043) : le CMS pousse les réponses opérateur via
   * son canal temps réel, mais l'hôte public doit pouvoir les rattraper.
   */
  const pollMessages = async () => {
    if (conversationId === null) return;
    const query =
      lastMessageAt === null ? "" : "&after=" + encodeURIComponent(lastMessageAt);
    try {
      const response = await fetch(
        "/api/chat/messages?conversationId=" + encodeURIComponent(conversationId) + query,
      );
      if (!response.ok) return;
      const json = await response.json();
      const messages = Array.isArray(json.messages) ? json.messages : [];
      let changed = false;
      for (const message of messages) {
        const mapped = toContractMessage(message);
        if (ctx.state.messages.some((existing) => existing.id === mapped.id)) continue;
        if (mapped.role === "user") {
          // Le message optimiste (envoyé avant la réponse) est remplacé par la
          // version serveur (même contenu, identifiant définitif).
          const optimistic = [...ctx.state.messages]
            .reverse()
            .find((existing) => existing.id.startsWith("u") && existing.content === mapped.content);
          if (optimistic !== undefined) {
            optimistic.id = mapped.id;
            optimistic.at = mapped.at;
            changed = true;
            continue;
          }
        }
        ctx.state.messages.push(mapped);
        changed = true;
      }
      if (typeof json.mode === "string" && json.mode !== interventionMode) {
        interventionMode = json.mode;
        changed = true;
      }
      const newest = ctx.state.messages.reduce(
        (max, message) => (message.at > max ? message.at : max),
        lastMessageAt ?? "",
      );
      if (newest !== lastMessageAt) {
        lastMessageAt = newest;
        changed = true;
      }
      if (changed) {
        render();
        setLiveStatus(
          "conversation " +
            conversationId.slice(0, 8) +
            "⬦ · mode " +
            modeLabel(interventionMode) +
            " · " +
            ctx.state.messages.length +
            " message(s)",
        );
      }
    } catch {
      /* le polling est best-effort */
    }
  };

  const startPolling = () => {
    if (pollTimer !== null) return;
    pollTimer = setInterval(() => void pollMessages(), 2500);
  };

  function mockActions(render) {
    return {
      submitIdentity: (data) => {
        ctx.state.phase = "chat";
        ctx.state.messages = [
          { id: "m1", role: "assistant", content: "Bonjour " + data.nom + " ! Parlez-moi de votre projet.", medias: [], at: new Date().toISOString() },
        ];
        render();
      },
      sendMessage: (content) => {
        ctx.state.messages.push({ id: "u" + Date.now(), role: "user", content, medias: [], at: new Date().toISOString() });
        ctx.state.typing = true;
        render();
        setTimeout(() => {
          ctx.state.typing = false;
          ctx.state.messages.push({ id: "a" + Date.now(), role: "assistant", content: "(mock) Merci, noté : « " + content + " ».", medias: ctx.resources.media.photos.slice(0, 1), at: new Date().toISOString() });
          render();
        }, 600);
      },
      finish: () => { ctx.state.status = "finalisee"; render(); },
      selectFallback: (questionId) => {
        const question = (ctx.state.fallback?.questions ?? []).find((item) => item.id === questionId);
        if (question === undefined) return;
        ctx.state.messages.push({
          id: "u" + Date.now(),
          role: "user",
          content: question.label,
          medias: [],
          at: new Date().toISOString(),
        });
        render();
      },
      openWidget: (size) => { document.body.dataset.widget = "open"; console.info("[harness] openWidget", size); },
      closeWidget: () => { document.body.dataset.widget = "closed"; },
      request: async (cap) => (cap === "media" ? ctx.resources.media : cap === "modelForm" ? ctx.resources.modelForm : ctx.theme),
      openMedia: (url) => window.open(url, "_blank", "noopener"),
      resize: () => {},
    };
  }

  function liveActions(render) {
    const pending = async (promise) => {
      try {
        await promise;
      } catch (error) {
        showError("Erreur réseau : " + error.message);
      }
    };
    return {
      submitIdentity: (data) => pending((async () => {
        showError("");
        await waitPlausible();
        const { ok, json } = await postJson("/api/chat/session", {
          token,
          nom: data.nom,
          email: data.email,
          contacts: data.contacts?.length ? data.contacts : undefined,
          consentement: data.consentement === true,
          surface: "page",
          loadedAt,
        });
        if (!ok || json === null || typeof json.conversationId !== "string") {
          showError("Démarrage impossible : " + (json?.error ?? "réponse invalide"));
          return;
        }
        conversationId = json.conversationId;
        ctx.state.phase = "chat";
        ctx.state.messages = Array.isArray(json.messages) ? json.messages.map(toContractMessage) : [];
        lastMessageAt = ctx.state.messages.reduce(
          (max, message) => (message.at > max ? message.at : max),
          "",
        );
        if (typeof json.mode === "string") interventionMode = json.mode;
        render();
        setLiveStatus(
          "conversation " +
            conversationId.slice(0, 8) +
            "⬦ · mode " +
            modeLabel(interventionMode) +
            " · " +
            ctx.state.messages.length +
            " message(s)",
        );
        startPolling();
      })()),
      sendMessage: (content) => pending((async () => {
        showError("");
        const text = String(content ?? "").trim();
        if (text === "" || conversationId === null) return;
        ctx.state.messages.push({ id: "u" + Date.now(), role: "user", content: text, medias: [], at: new Date().toISOString() });
        ctx.state.typing = true;
        render();
        const { ok, status, json } = await postJson("/api/chat", {
          conversationId,
          content: text,
          attachmentIds: [],
        });
        ctx.state.typing = false;
        if (!ok) {
          showError("Réponse impossible (" + status + ") : " + (json?.error ?? "erreur inconnue"));
          render();
          return;
        }
        const userMessage = json?.userMessage;
        if (userMessage !== undefined) {
          const mapped = toContractMessage(userMessage);
          const lastUser = [...ctx.state.messages].reverse().find((m) => m.role === "user");
          if (lastUser !== undefined && lastUser.id.startsWith("u")) lastUser.id = mapped.id;
        }
        const answer = json?.message ?? null;
        if (answer !== null) {
          const mapped = toContractMessage(answer);
          ctx.state.messages.push(mapped);
          render();
          if (json?.mediaPending === true) {
            const media = await postJson("/api/chat/media", { conversationId, messageId: mapped.id });
            if (media.ok && Array.isArray(media.json?.medias) && media.json.medias.length > 0) {
              mapped.medias = media.json.medias;
              render();
            }
          }
        } else {
          render();
        }
      })()),
      finish: () => pending((async () => {
        if (conversationId === null) return;
        showError("");
        const { ok, json } = await postJson("/api/chat/finish", { conversationId });
        if (!ok) {
          showError("Fin impossible : " + (json?.error ?? "erreur inconnue"));
          return;
        }
        ctx.state.status = "finalisee";
        render();
        const markdown = json?.fiches?.[0]?.markdown ?? json?.markdown ?? "";
        if (typeof markdown === "string" && markdown.trim() !== "") {
          const blob = new Blob([markdown], { type: "text/markdown" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "fiche-prospection.md";
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
        }
      })()),
      request: async (cap) => (cap === "media" ? ctx.resources.media : cap === "modelForm" ? ctx.resources.modelForm : ctx.theme),
      openMedia: (url) => window.open(url, "_blank", "noopener"),
      resize: () => {},
    };
  }

  const on = (event, cb) => { const s = listeners.get(event) || new Set(); s.add(cb); listeners.set(event, s); return () => s.delete(cb); };
  const live_ = () => ({ ...clone(ctx), actions, on });

  await import("/template/" + entry.replace(/^\\.\\//, "") + "?v=" + Date.now());
  const host = document.getElementById("host");
  let element = document.querySelector(elementName);
  const actions = live ? liveActions(render) : mockActions(render);
  function render() {
    if (!element) { element = document.createElement(elementName); host.replaceChildren(element); }
    element.onirtechContext = live_();
    emit("state", ctx.state);
  }
  render();
  // Option open=1 : ouvre le panneau du widget sans clic (capture, revue).
  if (new URLSearchParams(location.search).get("open") === "1") {
    const launcher = element.shadowRoot?.querySelector(".widget-launcher");
    if (launcher !== null && launcher !== undefined) launcher.click();
  }
  // Option width=N : contraint la largeur du template (revue des breakpoints).
  const forcedWidth = Number(new URLSearchParams(location.search).get("width"));
  if (Number.isFinite(forcedWidth) && forcedWidth > 0) {
    host.style.width = forcedWidth + "px";
  }
  // Option scroll=up : remonte le fil pour révéler le bouton « redescendre ».
  if (new URLSearchParams(location.search).get("scroll") === "up") {
    setTimeout(() => {
      const log = element.shadowRoot?.querySelector(".atelier-log");
      if (log) log.scrollTop = 0;
    }, 300);
  }
</script></body></html>`;
}

/** Proxy same-origin vers le dashboard : évite le CORS et garde le jeton côté harness. */
async function proxyApi(req, res) {
  const target = apiBase + req.url;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;
  const headers = { "content-type": req.headers["content-type"] ?? "application/json" };
  if (req.headers["x-forwarded-for"] !== undefined) {
    headers["x-forwarded-for"] = req.headers["x-forwarded-for"];
  }
  try {
    const upstream = await fetch(target, { method: req.method, headers, body });
    const payload = Buffer.from(await upstream.arrayBuffer());
    const out = { "content-type": upstream.headers.get("content-type") ?? "application/json" };
    const retryAfter = upstream.headers.get("retry-after");
    if (retryAfter !== null) out["retry-after"] = retryAfter;
    res.writeHead(upstream.status, out);
    res.end(payload);
  } catch (error) {
    res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "Backend injoignable (" + apiBase + ") : " + error.message }));
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname.startsWith("/api/")) {
      await proxyApi(req, res);
      return;
    }
    if (url.pathname === "/") {
      const manifest = JSON.parse(await readFile(join(templateDir, "onirtech.template.json"), "utf8"));
      // Surcharge des paramètres déclarés via la query string (`?titre=⬦`).
      const params = {};
      for (const param of Array.isArray(manifest.params) ? manifest.params : []) {
        const value = url.searchParams.get(param.key);
        if (value !== null) params[param.key] = value;
      }
      const opts = {
        phase: url.searchParams.get("phase") || "identity",
        surface: url.searchParams.get("surface") === "widget" ? "widget" : "page",
        consent: url.searchParams.get("consent") !== "0",
        params,
        messages: url.searchParams.get("messages") ?? "",
        forceMock: url.searchParams.get("mock") === "1",
        token: "",
      };
      const queryToken = (url.searchParams.get("token") ?? "").trim();
      opts.token = opts.forceMock ? "" : queryToken || defaultToken;
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(hostPage(manifest, opts));
      return;
    }
    // SDK copié dans `node_modules` du projet : le stack vanilla (sans build)
    // importe `@onirtech/template-sdk` via l'import map ci-dessus.
    if (url.pathname === "/sdk/index.js") {
      try {
        const file = join(
          templateDir,
          "node_modules",
          "@onirtech",
          "template-sdk",
          "dist",
          "index.js",
        );
        const data = await readFile(file);
        res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8" });
        res.end(data);
      } catch {
        res
          .writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
          .end("SDK non installé : lancez « npm install » dans le projet.");
      }
      return;
    }
    if (url.pathname.startsWith("/template/")) {
      const rel = normalize(url.pathname.slice("/template/".length));
      if (rel.startsWith("..")) {
        res.writeHead(400).end("bad path");
        return;
      }
      const file = join(templateDir, rel);
      const data = await readFile(file);
      res.writeHead(200, { "Content-Type": MIME[extname(file)] ?? "application/octet-stream" });
      res.end(data);
      return;
    }
    res.writeHead(404).end("not found");
  } catch {
    res.writeHead(500).end("error");
  }
});

server.listen(port, () => {
  console.log(`Harness (hôte de dev) — http://localhost:${port}`);
  console.log(`Template : ${templateDir}`);
  console.log(`Backend  : ${apiBase}`);
  if (defaultToken === "") {
    console.log("Mode     : MOCK par défaut (aucun jeton : /?token=<jeton-du-lien>)");
  } else {
    console.log(
      `Mode     : LIVE par défaut (jeton ${defaultToken.slice(0, 6)}⬦, source ${
        process.env.ONIR_LINK_TOKEN ? "ONIR_LINK_TOKEN" : ".onir-link-token"
      }) · ?mock=1 pour le mock`,
    );
  }
});

