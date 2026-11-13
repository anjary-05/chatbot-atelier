// Formulaire d'identité (écran d'accueil) : nom, email et consentement.
//
// En surface widget, le formulaire n'est jamais rendu (l'hôte y refuse
// `submitIdentity`) : c'est `usageOf(ctx)` qui décide.
import { Component } from "../core/component.js";
import { el } from "../core/dom.js";

export class IdentityCard extends Component {
  constructor(ctx, store) {
    super(ctx, store);
    this.el = el("form", { class: "identity-form", novalidate: "true" });
    this.#render();
  }

  patch() {
    this.#render();
  }

  #render() {
    const params = this.params;
    const nameField = params.pipe("name_field", ["Nom", "Votre nom"]);
    const emailField = params.pipe("email_field", ["Email", "vous@exemple.com"]);
    const startLabel = params.text("start_label", "DÉMARRER");
    const consentText = this.ctx.consent?.texte ?? params.text("consent_label", "");
    const consentLink = this.ctx.consent?.lien ?? "";

    const name = el("input", {
      class: "field-input",
      type: "text",
      name: "nom",
      placeholder: nameField[1] ?? "",
      "aria-label": nameField[0] ?? "Nom",
      required: "true",
    });
    const email = el("input", {
      class: "field-input",
      type: "email",
      name: "email",
      placeholder: emailField[1] ?? "",
      "aria-label": emailField[0] ?? "Email",
      required: "true",
    });
    const consent = el("input", { type: "checkbox", name: "consentement" });

    const consentLabel = el("label", { class: "field-check" }, consent);
    if (consentText !== "") consentLabel.appendChild(document.createTextNode(` ${consentText}`));
    if (consentLink !== "") {
      consentLabel.appendChild(
        el("a", { class: "field-link", href: consentLink, target: "_blank", rel: "noopener", text: "›" }),
      );
    }

    const submit = el("button", { type: "submit", class: "btn btn-black btn-start", text: startLabel });

    this.el.replaceChildren(
      el(
        "div",
        { class: "field-row" },
        el(
          "label",
          { class: "field" },
          el("span", { class: "field-label", text: nameField[0] ?? "Nom" }),
          name,
        ),
        el(
          "label",
          { class: "field" },
          el("span", { class: "field-label", text: emailField[0] ?? "Email" }),
          email,
        ),
      ),
      consentText === "" ? null : consentLabel,
      submit,
    );

    this.el.addEventListener("submit", (event) => {
      event.preventDefault();
      const nom = name.value.trim();
      const mail = email.value.trim();
      if (nom === "" || mail === "") return;
      this.ctx.actions?.submitIdentity?.({
        nom,
        email: mail,
        consentement: consent.checked,
      });
    });
  }
}
