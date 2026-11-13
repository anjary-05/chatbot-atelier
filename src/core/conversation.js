// Adaptation générique d'un message conversationnel vers l'interface.
//
// Le cœur du contrat hôte (`onirtech.template-host.v1`) transmet des messages
// typés — texte brut, blocs multimodaux, résultats d'outil — et le template ne
// « devine » jamais la forme de la donnée : il lit, adapte et rend.
//
//   • `messageText`        → le texte conversationnel (bloc `text` prioritaire) ;
//   • `messageImages`      → les images (multimodal) ;
//   • `messageToolResult`  → le résultat d'outil (génératif) ;
//   • `conversationPieces` → les pièces ordonnées, prêtes à être rendues.
//
// Tout message devient ainsi une interface conversationnelle : texte brut,
// contenu multimodale (texte + image) ou contenu génératif (résultat d'outil).

export const BLOCK_TEXT = "text";
export const BLOCK_IMAGE = "image";
export const BLOCK_TOOL = "tool_search_result";

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

/** Texte d'un message : le bloc `text` l'emporte, sinon le contenu brut. */
export function messageText(message, fallback = "") {
  const content = String(message?.content ?? "").trim();
  if (content !== "") return content;
  const blocks = Array.isArray(message?.blocks) ? message.blocks : [];
  for (const block of blocks) {
    if (
      isRecord(block) &&
      block.type === BLOCK_TEXT &&
      typeof block.text === "string" &&
      block.text.trim() !== ""
    ) {
      return block.text;
    }
  }
  return String(fallback ?? "");
}

/** Images d'un message : blocs `image` puis médias `photo`. */
export function messageImages(message) {
  const images = [];
  const blocks = Array.isArray(message?.blocks) ? message.blocks : [];
  for (const block of blocks) {
    if (isRecord(block) && block.type === BLOCK_IMAGE && typeof block.url === "string") {
      images.push({ url: block.url, alt: block.alt ?? "" });
    }
  }
  const medias = Array.isArray(message?.medias) ? message.medias : [];
  for (const media of medias) {
    if (media?.type === "photo") images.push({ url: media.url, alt: media.libelle ?? "" });
  }
  return images;
}

/** Résultat d'outil (génératif) d'un message : `tool_search_result`. */
export function messageToolResult(message) {
  const blocks = Array.isArray(message?.blocks) ? message.blocks : [];
  for (const block of blocks) {
    if (isRecord(block) && block.type === BLOCK_TOOL) return block;
  }
  return null;
}

/**
 * Adaptation générique d'un message conversationnel en pièces rendables :
 * texte, images (multimodal), outil (génératif) — dans l'ordre d'affichage.
 */
export function conversationPieces(message) {
  const pieces = [];
  const text = messageText(message);
  if (text !== "") pieces.push({ type: "text", text });
  for (const image of messageImages(message)) pieces.push({ type: "image", url: image.url, alt: image.alt });
  const tool = messageToolResult(message);
  if (tool !== null) pieces.push({ type: "tool", tool });
  return pieces;
}
