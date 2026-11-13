// Point d'entrée « page » : template Onirtech en surface page.
//
// L'élément enregistré porte le même nom que `ui.element` du manifeste.
import { defineTemplateElement } from "./core/element.js";
import { PAGE_ELEMENT } from "./core/constants.js";
import { store } from "./core/store.js";
import { CSS } from "./styles.js";
import { PageLayout } from "./layouts/page.js";

defineTemplateElement(PAGE_ELEMENT, (ctx) => new PageLayout(ctx, store), { css: CSS });
