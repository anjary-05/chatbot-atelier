// État éphémère du template.
//
// Le contrat hôte rediffuse un contexte complet à chaque changement d'état :
// le DOM est donc reconstruit ou repatché. Les informations qui ne vivent pas
// dans le contexte (brouillon saisi, ligne d'accordéon ouverte, défilement,
// choix en cours, panneau de détails) sont conservées ici, hors du cycle de
// rendu, pour survivre aux rediffusions.

export class Store {
  constructor() {
    /** Brouillon du message en cours de saisie. */
    this.draft = "";
    /** Clé de la ligne d'accordéon ouverte (une seule à la fois). */
    this.openRow = null;
    /** Suggestion sélectionnée dans la barre de suggestions. */
    this.selectedSuggestion = null;
    /** Interrupteur « sauvegardé » du composeur. */
    this.saved = false;
    /** Position de défilement de la liste de messages. */
    this.scrollTop = 0;
    /** Le panneau de détails de l'assistant est-il déplié ? */
    this.detailsOpen = false;
    /** Le panneau du widget est-il ouvert ? */
    this.widgetOpen = false;
    /** Le composeur a-t-il déjà envoyé un message ? */
    this.submitted = false;
  }

  /** Réinitialise l'état éphémère (nouveau point de départ). */
  reset() {
    this.draft = "";
    this.openRow = null;
    this.selectedSuggestion = null;
    this.saved = false;
    this.scrollTop = 0;
    this.detailsOpen = false;
    this.widgetOpen = false;
    this.submitted = false;
  }
}

/** Instance unique : le page et le widget partagent le même état logique. */
export const store = new Store();
