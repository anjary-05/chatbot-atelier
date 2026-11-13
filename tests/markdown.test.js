// Rendu markdown des réponses de l'IA : structuré, lisible, sans HTML injecté.
import { describe, expect, it } from "vitest";
import { renderMarkdown, renderInline } from "../src/core/markdown.js";

/** Rend la source dans un conteneur frais et retourne le nœud. */
function render(source) {
  const container = document.createElement("div");
  renderMarkdown(container, source);
  return container;
}

it("rend gras, italique et code en ligne", () => {
  const out = render("Texte **gras** et *italique* avec `code()`.");
  expect(out.querySelector("strong")?.textContent).toBe("gras");
  expect(out.querySelector("em")?.textContent).toBe("italique");
  expect(out.querySelector(".msg-inline-code")?.textContent).toBe("code()");
});

it("rend les titres et les paragraphes", () => {
  const out = render("## Titre\n\nParagraphe avec\ndeuxième ligne.");
  expect(out.querySelector(".msg-h2")?.textContent).toBe("Titre");
  const paragraph = out.querySelector(".msg-p");
  expect(paragraph?.querySelector("br")).toBeTruthy();
  expect(paragraph?.textContent).toBe("Paragraphe avecdeuxième ligne.");
});

it("rend les listes (non ordonnée et ordonnée)", () => {
  const out = render("- un\n- deux\n\n1. d'abord\n2. ensuite");
  const lists = out.querySelectorAll(".msg-list");
  expect(lists[0]?.tagName).toBe("UL");
  expect(lists[0]?.querySelectorAll("li").length).toBe(2);
  expect(lists[1]?.tagName).toBe("OL");
});

it("rend les blocs de code avec bouton Copier", () => {
  const out = render("```js\nconst x = 1 < 2;\n```");
  expect(out.querySelector(".msg-code-block")).toBeTruthy();
  expect(out.querySelector(".msg-code-lang")?.textContent).toBe("js");
  expect(out.querySelector(".msg-code-body")?.textContent).toBe("const x = 1 < 2;");
  expect(out.querySelector(".msg-copy")).toBeTruthy();
});

it("rend les tableaux markdown", () => {
  const out = render("| Nom | Budget |\n| --- | --- |\n| refonte | 8000 |");
  expect(out.querySelector(".msg-table thead th")?.textContent).toBe("Nom");
  expect(out.querySelector(".msg-table tbody td:nth-child(2)")?.textContent).toBe("8000");
});

it("rend les liens http(s) et ignore les liens javascript", () => {
  const good = render("voir [la doc](https://example.com/doc)");
  const anchor = good.querySelector("a.msg-link");
  expect(anchor?.getAttribute("href")).toBe("https://example.com/doc");
  expect(anchor?.getAttribute("rel")).toBe("noopener noreferrer");

  const bad = render("clic [ici](javascript:alert(1)) fin");
  expect(bad.querySelector("a")).toBeNull();
  expect(bad.textContent).toContain("ici");
});

it("rend les images markdown (multimodal) avec URL sûre", () => {
  const out = render("![photo](https://example.com/a.png)");
  const img = out.querySelector("img.msg-inline-photo");
  expect(img?.getAttribute("src")).toBe("https://example.com/a.png");

  const out2 = render("![x](javascript:alert(1))");
  expect(out2.querySelector("img")).toBeNull();
});

it("n'injecte jamais de HTML du modèle", () => {
  const out = render('<img src=x onerror="alert(1)"> <script>alert(2)</script>');
  expect(out.querySelector("img")).toBeNull();
  expect(out.querySelector("script")).toBeNull();
  expect(out.textContent).toContain('<img src=x onerror="alert(1)">');
});

it("rend les liens nus avec ponctuation décuplée", () => {
  const out = render("voir https://example.com/page. fin");
  const anchor = out.querySelector("a.msg-link");
  expect(anchor?.getAttribute("href")).toBe("https://example.com/page");
  expect(anchor?.textContent).toBe("https://example.com/page");
  expect(out.textContent).toContain("fin");
});

it("rend les citations et les séparateurs", () => {
  const out = render("> citation\n> suite\n\n---");
  expect(out.querySelector(".msg-quote")?.textContent).toContain("citation");
  expect(out.querySelector(".msg-hr")).toBeTruthy();
});

it("rendTexteInline gère les URLs mailto", () => {
  const container = document.createElement("span");
  renderInline(container, "écrivez à mailto:bonjour@example.com");
  expect(container.querySelector("a.msg-link")?.getAttribute("href")).toBe("mailto:bonjour@example.com");
});

describe("fidélité du texte brut", () => {
  it("conserve le texte tel quel dans les paragraphes", () => {
    const out = render("budget : 12 000 € — délai : 6 semaines");
    expect(out.textContent).toBe("budget : 12 000 € — délai : 6 semaines");
  });
});
