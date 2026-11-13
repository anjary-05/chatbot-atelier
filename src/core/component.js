// Base commune des composants (approche objet générique).
//
// Un composant possède son propre DOM et sait se mettre à jour en place :
// `update(ctx)` ne reconstruit que ce qui change, ce qui préserve le focus du
// composeur, la position de défilement et les animations en cours.
import { Params } from "./params.js";

export class Component {
  /**
   * @param {object} ctx  contexte hôte (`onirtech.template-host.v1`)
   * @param {object} store état éphémère partagé (brouillon, défilement…)
   */
  constructor(ctx, store) {
    this.ctx = ctx;
    this.store = store;
    this.params = new Params(ctx);
    /** Nœud racine du composant. */
    this.el = null;
  }

  /** Reçoit un nouveau contexte. */
  update(ctx) {
    this.ctx = ctx;
    this.params = new Params(ctx);
    this.patch();
  }

  /** Repatch du DOM. À surcharger. */
  patch() {}

  /** Appelé une fois le composant inséré dans le document. */
  afterMount() {}

  /** Libère les écouteurs globaux. */
  destroy() {}
}
