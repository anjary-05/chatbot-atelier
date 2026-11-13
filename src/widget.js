// Point d'entrée « widget » : template Onirtech en surface widget (ADR-0040).
//
// L'élément enregistré porte le même nom que `ui.widget.element` du manifeste.
// Le widget démarre toujours en phase « chat » : ni formulaire d'identité, ni
// politique de confidentialité.
import { defineTemplateElement } from "./core/element.js";
import { WIDGET_ELEMENT } from "./core/constants.js";
import { store } from "./core/store.js";
import { CSS } from "./styles.js";
import { WidgetLayout } from "./layouts/widget.js";

defineTemplateElement(WIDGET_ELEMENT, (ctx) => new WidgetLayout(ctx, store), { css: CSS });
