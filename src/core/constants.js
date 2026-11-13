// Constantes partagées entre le manifeste, les points d'entrée et les
// gabarits. Les tailles du widget doivent rester synchronisées avec le bloc
// `ui.widget.display` du manifeste (ADR-0040).

/** Nom de l'élément du template en surface page. */
export const PAGE_ELEMENT = "onirtech-template-chatbot-atelier";

/** Nom de l'élément du template en surface widget. */
export const WIDGET_ELEMENT = "onirtech-widget-chatbot-atelier";

/** Taille du widget ouvert (demande à l'hôte). */
export const WIDGET_OPEN_SIZE = { width: 420, height: 680 };

/** Taille maximale du widget (déclarée dans le manifeste). */
export const WIDGET_MAX_SIZE = { width: 520, height: 760 };

/** Taille du widget fermé (launcher). */
export const WIDGET_CLOSED_SIZE = { width: 64, height: 64 };

/** Positions autorisées pour le widget. */
export const WIDGET_POSITIONS = ["bottom-right", "bottom-left"];
