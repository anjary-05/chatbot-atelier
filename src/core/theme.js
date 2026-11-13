// Accent du template.
//
// L'hôte peut imposer sa palette (`ctx.theme`) : elle prime sur la variable
// `primary_color`, qui reste le repli. L'accent ne touche qu'aux éléments
// interactifs (boutons, curseur, pastille active) : la typographie et les
// encoches, elles, restent la signature du template.
export function accentOf(ctx, params) {
  const theme = ctx?.theme ?? {};
  const fromTheme = theme.primary || theme.accent;
  if (typeof fromTheme === "string" && fromTheme.trim() !== "") return fromTheme.trim();
  return params.color("primary_color", "#111111");
}

const INK = "#111111";
const WHITE = "#ffffff";

/** Canal sRGB (0–255) vers luminance relative WCAG. */
const channel = (value) => {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = (r, g, b) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

const INK_LUMINANCE = luminance(0x11, 0x11, 0x11);
const WHITE_LUMINANCE = 1;

/**
 * Luminance relative WCAG de la couleur, ou `null` si elle n'est pas parsable.
 * En navigateur, le canvas normalise toute couleur CSS valide (nommée, hsl,
 * oklch…) en `#rrggbb` / `rgba(...)` ; sinon on se rabat sur un parse direct
 * (hex et rgb()), qui couvre les couleurs produites par les hôtes.
 */
function relativeLuminance(color) {
  let normalized = String(color ?? "").trim().toLowerCase();
  if (typeof document !== "undefined") {
    try {
      const probe = document.createElement("canvas").getContext?.("2d");
      if (probe) {
        probe.fillStyle = "#010203";
        probe.fillStyle = normalized;
        const value = probe.fillStyle;
        if (value !== "#010203") normalized = value;
      }
    } catch {
      /* canvas absent (happy-dom) : le parse direct suffit pour hex/rgb */
    }
  }

  const hex = /^#([0-9a-f]{3,8})$/.exec(normalized);
  if (hex !== null) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    if (h.length !== 6 && h.length !== 8) return null;
    return luminance(
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    );
  }

  const parts = normalized.match(/-?[\d.]+%?/g);
  if (parts !== null && parts.length >= 3) {
    const toChannel = (token) => {
      const value = parseFloat(token);
      return token.endsWith("%") ? (value / 100) * 255 : value;
    };
    const [r, g, b] = parts.slice(0, 3).map(toChannel);
    if ([r, g, b].some((value) => !Number.isFinite(value) || value < 0 || value > 255)) return null;
    return luminance(r, g, b);
  }
  return null;
}

/**
 * Couleur lisible posée SUR l'accent (texte, libellés, icônes).
 * L'hôte peut imposer un accent clair (ex. `#ffffff`) : le template ne code
 * donc plus de blanc en dur sur les fonds accent — il choisit entre l'encre
 * et le blanc selon le meilleur contraste WCAG.
 */
export function accentContrastOf(accent) {
  const lum = relativeLuminance(accent);
  if (lum === null) return WHITE;
  const against = (other) => (Math.max(lum, other) + 0.05) / (Math.min(lum, other) + 0.05);
  const inkRatio = against(INK_LUMINANCE);
  const whiteRatio = against(WHITE_LUMINANCE);
  return inkRatio >= whiteRatio ? INK : WHITE;
}
