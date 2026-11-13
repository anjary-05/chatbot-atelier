// Détection de la surface de diffusion (ADR-0040).
//
// L'hôte renseigne `ctx.surface` : « page » (lien partagé) ou « widget »
// (iframe embarquée sur un site client). Le widget démarre toujours en phase
// « chat », refuse le formulaire d'identité et ne fournit aucune politique de
// confidentialité : le template adapte son rendu sans jamais deviner.

export const Surface = {
  PAGE: "page",
  WIDGET: "widget",
};

/** Surface effective d'un contexte (repli : page). */
export function surfaceOf(ctx) {
  return ctx?.surface === Surface.WIDGET ? Surface.WIDGET : Surface.PAGE;
}

/** Vrai si le contexte est en surface widget. */
export function isWidget(ctx) {
  return surfaceOf(ctx) === Surface.WIDGET;
}

/**
 * Contexte d'usage unifié :
 *  • `phase`   — phase réelle de la discussion ;
 *  • `identity`— l'étape d'identité doit-elle être rendue ? (jamais en widget) ;
 *  • `consent` — le consentement peut-il être affiché ? (jamais en widget).
 */
export function usageOf(ctx) {
  const widget = isWidget(ctx);
  const phase = ctx?.state?.phase === "chat" ? "chat" : "identity";
  return {
    widget,
    phase: widget ? "chat" : phase,
    identity: !widget && phase === "identity",
    consent: !widget && ctx?.consent != null,
  };
}
