// Rendu markdown léger des réponses conversationnelles.
//
// Les hôtes livrent les réponses de l'IA en texte brut (souvent du markdown) :
// ce module le convertit en interface conversationnelle — structurée, lisible,
// sans dépendance.
//
//   • Zéro HTML injecté : tout sort par `createElement` + `textContent` ; la
//     donnée modèle n'est jamais interprétée comme du HTML.
//   • Seuls les liens http(s)/https externes et mailto sont cliquables
//     (relatifs ou `javascript:` ignorés, rendus en simple texte).
//   • Pris en charge : paragraphes, titres #…, listes (•, 1.) avec un niveau
//     d'imbrication, blocs de code ```lang (bouton « Copier »), code en ligne,
//     gras/italique/barré, liens, images ![alt](url), tableaux, citations, HR.
import { el } from "./dom.js";

const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

/** URL sûre pour un lien ou une image ; `null` sinon. */
function safeUrl(raw) {
  const value = String(raw ?? "").trim();
  try {
    const url = new URL(value);
    return SAFE_PROTOCOLS.has(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

/** Fins de phrase à extraire d'une URL nue (ex. « …example.com. » → point final). */
const TRAILING = /[.,;:!?)\]]+$/;

/** Coupe une URL nue des ponctuations finales (ex. « voir https://x.fr. »). */
function splitTrailing(raw) {
  const match = TRAILING.exec(raw);
  if (match === null) return { url: raw, trail: "" };
  return { url: raw.slice(0, raw.length - match[0].length), trail: match[0] };
}

const INLINE =
  /(!\[[^\]]*\]\([^)\s]+\)|\[[^\]]*\]\([^)\s]+\)|~~[^~\n]+~~|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`\n]+`|https?:\/\/[^\s<>()[\]]+|mailto:[^\s<>()[\]]+)/g;

/** Rend le contenu inline (gras, italique, code, liens, images) dans `parent`. */
export function renderInline(parent, text) {
  const tokens = String(text ?? "").split(INLINE);
  for (const raw of tokens) {
    if (raw === "") continue;
    let match = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(raw);
    if (match !== null) {
      const url = safeUrl(match[2]);
      if (url !== null) {
        parent.appendChild(el("img", { class: "msg-inline-photo", src: url, alt: match[1], loading: "lazy" }));
      } else {
        parent.appendChild(document.createTextNode(raw));
      }
      continue;
    }
    match = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(raw);
    if (match !== null) {
      const url = safeUrl(match[2]);
      if (url === null) {
        parent.appendChild(document.createTextNode(match[1]));
        continue;
      }
      parent.appendChild(
        el("a", { class: "msg-link", href: url, target: "_blank", rel: "noopener noreferrer", text: match[1] }),
      );
      continue;
    }
    match = /^~~([^~\n]+)~~$/.exec(raw);
    if (match !== null) {
      parent.appendChild(el("del", {}, ...inlineSpan(match[1])));
      continue;
    }
    match = /^\*\*([^*\n]+)\*\*$/.exec(raw) || /^__([^_\n]+)__$/.exec(raw);
    if (match !== null) {
      parent.appendChild(el("strong", {}, ...inlineSpan(match[1])));
      continue;
    }
    match = /^\*([^*\n]+)\*$/.exec(raw) || /^_([^_\n]+)_$/.exec(raw);
    if (match !== null) {
      parent.appendChild(el("em", {}, ...inlineSpan(match[1])));
      continue;
    }
    match = /^`([^`\n]+)`$/.exec(raw);
    if (match !== null) {
      parent.appendChild(el("code", { class: "msg-inline-code", text: match[1] }));
      continue;
    }
    if (/^(https?:\/\/|mailto:)/.test(raw)) {
      const { url, trail } = splitTrailing(raw);
      const safe = safeUrl(url);
      if (safe !== null) {
        parent.appendChild(
          el("a", { class: "msg-link", href: safe, target: "_blank", rel: "noopener noreferrer", text: url }),
        );
      } else {
        parent.appendChild(document.createTextNode(url));
      }
      if (trail !== "") parent.appendChild(document.createTextNode(trail));
      continue;
    }
    parent.appendChild(document.createTextNode(raw));
  }
}

/** Enfants inline d'un texte (pour les titres, cellules de table, etc.). */
const inlineSpan = (text) => {
  const span = document.createElement("span");
  renderInline(span, text);
  return [...span.childNodes];
};

/** Bloc de code avec en-tête (langage + bouton « Copier »). */
function codeBlock(lang, code) {
  const body = String(code ?? "").replace(/\n+$/, "");
  const status = el("span", { class: "msg-copy-status", hidden: "true" });
  const copy = el("button", { type: "button", class: "msg-copy", text: "Copier" });
  copy.addEventListener("click", () => {
    const done = (ok) => {
      status.textContent = ok ? "Copié" : "Échec";
      status.hidden = false;
      setTimeout(() => {
        status.hidden = true;
      }, 1600);
    };
    try {
      const write = typeof navigator !== "undefined" ? navigator.clipboard?.writeText?.(body) : undefined;
      if (write === undefined) {
        done(false);
        return;
      }
      write.then(() => done(true), () => done(false));
    } catch {
      done(false);
    }
  });
  return el(
    "div",
    { class: "msg-code-block" },
    el(
      "div",
      { class: "msg-code-head" },
      el("span", { class: "msg-code-lang", text: lang || "code" }),
      el("span", { class: "msg-code-actions" }, copy, status),
    ),
    el("pre", { class: "msg-code-body" }, el("code", { text: body })),
  );
}

const LIST_ITEM = /^(\s*)([-*+]|(\d+)[.)])\s+(.*)$/;

/** Table markdown (en-tête + séparateur + lignes), sinon null. */
function parseTableAt(lines, start) {
  if (!lines[start].includes("|")) return null;
  const separator = lines[start + 1];
  if (separator === undefined) return null;
  if (!/^\s*\|?[\s:|-]+\|?\s*$/.test(separator) || !separator.includes("-") || !separator.includes("|")) {
    return null;
  }
  const parseRow = (raw) =>
    raw
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());
  const head = parseRow(lines[start]);
  let i = start + 2;
  const body = [];
  while (i < lines.length && lines[i].trim() !== "" && lines[i].includes("|")) {
    body.push(parseRow(lines[i]));
    i += 1;
  }
  const table = el("table", { class: "msg-table" });
  const headRow = el("tr");
  for (const cell of head) {
    const th = el("th", { scope: "col" });
    renderInline(th, cell);
    headRow.appendChild(th);
  }
  table.appendChild(el("thead", {}, headRow));
  const tbody = el("tbody");
  for (const row of body) {
    const cells = [...row.slice(0, head.length)];
    while (cells.length < head.length) cells.push("");
    const tr = el("tr");
    for (const cell of cells) {
      const td = el("td");
      renderInline(td, cell);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  return { node: el("div", { class: "msg-table-wrap" }, table), next: i };
}

/** Liste markdown (un niveau d'imbrication par deux espaces). */
function parseListAt(lines, start) {
  const items = [];
  let i = start;
  while (i < lines.length) {
    const match = LIST_ITEM.exec(lines[i]);
    if (match === null) break;
    items.push({
      level: Math.min(1, Math.floor(match[1].length / 2)),
      ordered: /\d/.test(match[2]),
      text: match[4],
    });
    i += 1;
  }
  const rootOrdered = items[0]?.ordered === true;
  const root = el(rootOrdered ? "ol" : "ul", { class: "msg-list" });
  let lineItem = null;
  let nested = null;
  for (const item of items) {
    if (item.level === 0) {
      lineItem = el("li", {}, ...inlineSpan(item.text));
      root.appendChild(lineItem);
      nested = null;
      continue;
    }
    if (lineItem === null) {
      lineItem = el("li", {});
      root.appendChild(lineItem);
    }
    if (nested === null) {
      nested = el(item.ordered ? "ol" : "ul", { class: "msg-list msg-list--nested" });
      lineItem.appendChild(nested);
    }
    nested.appendChild(el("li", {}, ...inlineSpan(item.text)));
  }
  return { node: root, next: i };
}

const HEADING = /^(#{1,6})\s+(.*)$/;
const HR = /^(-{3,}|\*{3,}|_{3,})$/;
const FENCE_LINE = /^\s*```/;

/** Détecte le début d'une table sur les lignes (en-tête + séparateur). */
function tableStartAt(lines, index) {
  const line = lines[index];
  if (line === undefined || !line.includes("|")) return false;
  const separator = lines[index + 1];
  if (separator === undefined) return false;
  return /^\s*\|?[\s:|-]+\|?\s*$/.test(separator) && separator.includes("-") && separator.includes("|");
}

/** Rendu d'un segment de texte (sans blocs de code, déjà extraits). */
function renderTextSegment(container, text) {
  const lines = String(text).split("\n");
  let i = 0;
  const special = (line) =>
    HEADING.test(line.trim()) ||
    LIST_ITEM.test(line) ||
    /^\s*>/.test(line) ||
    HR.test(line.trim()) ||
    FENCE_LINE.test(line);

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === "") {
      i += 1;
      continue;
    }

    const table = parseTableAt(lines, i);
    if (table !== null) {
      container.appendChild(table.node);
      i = table.next;
      continue;
    }

    const heading = HEADING.exec(trimmed);
    if (heading !== null) {
      const level = Math.min(heading[1].length, 4);
      container.appendChild(
        el(`h${level + 2}`, { class: `msg-h msg-h${heading[1].length}` }, ...inlineSpan(heading[2].trim())),
      );
      i += 1;
      continue;
    }

    if (HR.test(trimmed)) {
      container.appendChild(el("hr", { class: "msg-hr" }));
      i += 1;
      continue;
    }

    if (LIST_ITEM.test(line)) {
      const list = parseListAt(lines, i);
      container.appendChild(list.node);
      i = list.next;
      continue;
    }

    if (/^\s*>/.test(line)) {
      const buffer = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        buffer.push(lines[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      const quote = el("blockquote", { class: "msg-quote" });
      renderTextSegment(quote, buffer.join("\n"));
      container.appendChild(quote);
      continue;
    }

    // Paragraphe : lignes contiguës non spéciales, sauts simples → <br>.
    const buffer = [];
    while (i < lines.length) {
      const current = lines[i];
      if (current.trim() === "") break;
      if (tableStartAt(lines, i)) break;
      if (special(current)) break;
      buffer.push(current);
      i += 1;
    }
    if (buffer.length === 0) {
      i += 1;
      continue;
    }
    const paragraph = el("p", { class: "msg-p" });
    buffer.forEach((item, index) => {
      if (index > 0) paragraph.appendChild(el("br"));
      renderInline(paragraph, item);
    });
    container.appendChild(paragraph);
  }
}

const FENCE = /```([A-Za-z0-9_+-]*)[^\n]*\n([\s\S]*?)```/g;

/**
 * Remplace le contenu de `container` par le markdown rendu de `source`.
 * Sécurisé par construction : aucun HTML du modèle n'est injecté.
 */
export function renderMarkdown(container, source) {
  container.replaceChildren();
  const text = String(source ?? "");
  const segments = [];
  let last = 0;
  FENCE.lastIndex = 0;
  let match = FENCE.exec(text);
  while (match !== null) {
    if (match.index > last) segments.push({ type: "text", content: text.slice(last, match.index) });
    segments.push({ type: "code", lang: match[1], content: match[2] });
    last = match.index + match[0].length;
    match = FENCE.exec(text);
  }
  if (last < text.length) {
    const rest = text.slice(last);
    const fenceAt = rest.indexOf("```");
    if (fenceAt === -1) {
      segments.push({ type: "text", content: rest });
    } else {
      if (fenceAt > 0) segments.push({ type: "text", content: rest.slice(0, fenceAt) });
      const after = rest.slice(fenceAt + 3);
      const newline = after.indexOf("\n");
      const lang = (newline === -1 ? after : after.slice(0, newline)).trim();
      segments.push({ type: "code", lang, content: newline === -1 ? "" : after.slice(newline + 1) });
    }
  }

  for (const segment of segments) {
    if (segment.type === "code") {
      container.appendChild(codeBlock(segment.lang, segment.content));
      continue;
    }
    renderTextSegment(container, segment.content);
  }
}
