// Fabrique DOM minimale — le SDK expose `h()`, mais il ne couvre ni le SVG ni
// les écouteurs « on* » avec une syntaxe stable. On garde donc un jeu
// d'aides minimal, cohérent avec le style « Spin Product » (balises nues).
const SVG_NS = "http://www.w3.org/2000/svg";

/** Normalise une liste d'enfants (Node, tableau, texte, null). */
export function children(value) {
  const list = Array.isArray(value) ? value : [value];
  const out = [];
  for (const item of list) {
    if (item === null || item === undefined || item === false) continue;
    if (Array.isArray(item)) {
      out.push(...children(item));
      continue;
    }
    if (item instanceof Node) {
      out.push(item);
      continue;
    }
    out.push(document.createTextNode(String(item)));
  }
  return out;
}

/** Applique des attributs/propriétés sur un élément. */
export function apply(node, props = {}) {
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === "class") node.className = String(value);
    else if (key === "text") node.textContent = String(value);
    else if (key === "style" && typeof value === "object") Object.assign(node.style, value);
    else if (key === "value") node.value = value;
    else if (key === "checked") node.checked = Boolean(value);
    else if (key === "disabled") node.disabled = Boolean(value);
    else if (key === "hidden") node.hidden = Boolean(value);
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else node.setAttribute(key, String(value));
  }
  return node;
}

/** Crée un élément HTML. Les enfants sont variadiques (nœud, tableau, texte). */
export function el(tag, props = {}, ...kids) {
  const node = document.createElement(tag);
  apply(node, props);
  node.append(...children(kids));
  return node;
}

/** Crée un élément SVG (namespaced). */
export function svg(tag, props = {}, ...kids) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === "text") node.textContent = String(value);
    else node.setAttribute(key, String(value));
  }
  node.append(...children(kids));
  return node;
}

/** Remplace le contenu d'un nœud. */
export function fill(node, kids) {
  node.replaceChildren(...children(kids));
  return node;
}
