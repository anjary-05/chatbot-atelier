// Manifeste du template — source de vérité.
//
// Le build Vite le fige dans `onirtech.template.json` (entrées, intégrité SRI).
// Les 40 variables décrivent TOUT ce qui est visible : aucun texte n'est écrit
// en dur dans les composants.
import { defineManifest } from "@onirtech/template-sdk";
import {
  PAGE_ELEMENT,
  WIDGET_ELEMENT,
  WIDGET_CLOSED_SIZE,
  WIDGET_MAX_SIZE,
  WIDGET_OPEN_SIZE,
  WIDGET_POSITIONS,
} from "./core/constants.js";

const CLOUDFRONT = "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P";

/**
 * Variables du template, déclarées hors de `defineManifest`.
 *
 * Le SDK publié normalise les variables pour `defineManifest` mais ne connaît
 * pas encore le type `image` (téléversement) : il le renvoie `null`. La
 * liste brute est donc exportée pour être réinjectée par
 * `tools/sync-manifest.mjs`, qui reconstruit le bloc `params` du manifeste
 * publié sans perdre les images.
 */
const MANIFEST = {
  id: "chatbot-atelier",
  name: "Chatbot Atelier — Spin Product",
  description:
    "Template chatbot Onirtech au design « Spin Product » : cartes blanches à encoches, typo monospace, accent noir. Toutes les variables dynamiques pilotent l'affichage. Compatible surfaces page et widget.",
  version: "2.5.0",
  publisher: { id: "onirtech", name: "ONIRTECH", trustLevel: "official" },
  ui: {
    mode: "web-component",
    entry: "./dist/index.js",
    element: PAGE_ELEMENT,
    shadowDom: "open",
    widget: {
      entry: "./dist/widget.js",
      element: WIDGET_ELEMENT,
      display: {
        defaultPosition: "bottom-right",
        allowedPositions: WIDGET_POSITIONS,
        closedSize: { ...WIDGET_CLOSED_SIZE },
        openSize: { ...WIDGET_OPEN_SIZE },
        maxSize: { ...WIDGET_MAX_SIZE },
      },
    },
  },
  capabilities: ["messages", "media", "theme", "fallback", "knowledge", "userState"],
  network: [CLOUDFRONT, "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
};

export const PARAMS = [
    {
      key: "brand_name",
      label: "Nom de marque",
      description: "Logo affiché en haut à gauche de l'en-tête.",
      type: "string",
      default: "ONIRTECH",
      maxLength: 40,
    },
    {
      key: "brand_crumbs",
      label: "Fil d'Ariane",
      description: "Fil d'Ariane sous le logo. Laisser vide pour le masquer.",
      type: "string",
      default: "ACCUEIL > ASSISTANCE",
      maxLength: 80,
    },
    {
      key: "nav_items",
      label: "Navigation",
      description: "Entrées de navigation du pied de page, séparées par « | ».",
      type: "text",
      default: "Accueil | Services | Contact",
      maxLength: 200,
    },
    {
      key: "counter_label",
      label: "Libellé du compteur",
      description: "Préfixe du compteur de messages (en-tête).",
      type: "string",
      default: "MSG",
      maxLength: 12,
    },
    {
      key: "status_active",
      label: "Statut en cours",
      description: "Statut affiché quand la conversation est ouverte.",
      type: "string",
      default: "En ligne",
      maxLength: 40,
    },
    {
      key: "status_done",
      label: "Statut terminé",
      description: "Statut affiché une fois la conversation finalisée.",
      type: "string",
      default: "Conversation terminée",
      maxLength: 40,
    },
    {
      key: "bot_name",
      label: "Nom du bot",
      description: "Nom de l'assistant (en-tête, bulles, indicateur de frappe).",
      type: "string",
      default: "Orvante",
      maxLength: 40,
    },
    {
      key: "bot_role",
      label: "Fonction du bot",
      description: "Précision sous le nom de l'assistant.",
      type: "string",
      default: "Assistante éditoriale",
      maxLength: 60,
    },
    {
      key: "bot_avatar_image",
      label: "Avatar du bot",
      description:
        "Portrait de l'assistant : image téléversée depuis le panneau (PNG, JPEG ou WebP). Laisser vide pour les initiales.",
      type: "image",
      default: `${CLOUDFRONT}/300f41b1-3de5-4153-afde-06e15e753ad0.webp`,
    },
    {
      key: "user_label",
      label: "Libellé du visiteur",
      description: "Nom affiché sur les messages du visiteur.",
      type: "string",
      default: "Vous",
      maxLength: 20,
    },
    {
      key: "user_icon",
      label: "Icône du visiteur",
      description: "Icône affichée à côté des messages du visiteur.",
      type: "select",
      default: "profile",
      options: [
        { value: "profile", label: "Profil" },
        { value: "person", label: "Silhouette" },
        { value: "guest", label: "Visiteur encadré" },
        { value: "anonymous", label: "Anonyme" },
      ],
    },
    {
      key: "welcome_message",
      label: "Message d'accueil",
      description: "Premier message affiché si la discussion est vide.",
      type: "text",
      default: "Bonjour. Je suis Orvante. Dites-moi ce que vous cherchez.",
      maxLength: 300,
    },
    {
      key: "input_placeholder",
      label: "Placeholder du message",
      description: "Texte d'invite dans le champ de saisie.",
      type: "string",
      default: "Écrivez votre message…",
      maxLength: 80,
    },
    {
      key: "send_label",
      label: "Libellé envoyer",
      description: "Bouton d'envoi du message.",
      type: "string",
      default: "ENVOYER",
      maxLength: 20,
    },
    {
      key: "finish_label",
      label: "Libellé terminer",
      description: "Bouton de fin de conversation.",
      type: "string",
      default: "TERMINER",
      maxLength: 20,
    },
    {
      key: "typing_text",
      label: "Texte de frappe",
      description: "Complété par le nom du bot pendant la rédaction de la réponse.",
      type: "string",
      default: "est en train d’écrire…",
      maxLength: 60,
    },
    {
      key: "phase_label",
      label: "Surtitre de phase",
      description: "Pastille affichée dans l'en-tête de la discussion.",
      type: "string",
      default: "CONVERSATION",
      maxLength: 24,
    },
    {
      key: "composer_hint",
      label: "Astuce du composeur",
      description: "Ligne d'aide sous le champ de saisie.",
      type: "string",
      default: "Entrée pour envoyer",
      maxLength: 80,
    },
    {
      key: "info_kicker",
      label: "Surtitre de présentation",
      description: "Sur-titre au-dessus du nom de l'assistant (écran d'accueil).",
      type: "string",
      default: "● (À PROPOS)",
      maxLength: 40,
    },
    {
      key: "info_title",
      label: "Titre des détails",
      description: "Titre du panneau de détails de l'assistant.",
      type: "text",
      default: "Une relation\nqui se construit",
      maxLength: 120,
    },
    {
      key: "info_metric",
      label: "Mesure",
      description: "Grand nombre mis en avant dans la carte d'information.",
      type: "string",
      default: "24/7",
      maxLength: 24,
    },
    {
      key: "info_tag",
      label: "Tag d'information",
      description: "Étiquette accolée à la mesure.",
      type: "string",
      default: "EN LIGNE",
      maxLength: 24,
    },
    {
      key: "info_rows",
      label: "Lignes d'accordéon",
      description:
        "Lignes du panneau de détails : une par ligne, au format « Titre|Texte ». La première ligne s'ouvre au déploiement.",
      type: "text",
      default:
        "Description|Un assistant disponible, des réponses claires et un suivi pensé pour les marques qui veulent avancer vite.\nHoraires|Du lundi au vendredi, 08:00 — 18:00. Réponse sous 24 h ouvrées.\nConfidentialité|Aucune donnée n'est conservée au-delà de la conversation.",
      maxLength: 1200,
    },
    {
      key: "action_kicker",
      label: "Surtitre suggestions",
      description: "Sur-titre de la barre de suggestions.",
      type: "string",
      default: "OPTIONS",
      maxLength: 40,
    },
    {
      key: "action_title",
      label: "Titre des suggestions",
      description: "Titre de la barre de suggestions.",
      type: "string",
      default: "Suggestions",
      maxLength: 40,
    },
    {
      key: "suggestion_items",
      label: "Suggestions",
      description:
        "Suggestions de départ : une par ligne, au format « Libellé|Question ». Ignorées si l'hôte fournit un menu de secours.",
      type: "text",
      default:
        "Devis|Bonjour, je souhaite un devis pour un projet.\nRDV|Pouvons-nous fixer un rendez-vous cette semaine ?\nDocs|Quels documents dois-je préparer pour notre échange ?",
      maxLength: 800,
    },
    {
      key: "toggle_label",
      label: "Libellé de l'interrupteur",
      description: "Libellé du bouton d'enregistrement (carte d'actions).",
      type: "string",
      default: "SAVER",
      maxLength: 20,
    },
    {
      key: "toggle_saved_label",
      label: "Libellé une fois enregistré",
      description: "Libellé du bouton d-interrupteur lorsqu'il est activé.",
      type: "string",
      default: "SAVED",
      maxLength: 20,
    },
    {
      key: "action_note",
      label: "Note des suggestions",
      description: "Précision sous les suggestions.",
      type: "text",
      default: "Chaque clic envoie un message ou ouvre une demande de rappel.",
      maxLength: 240,
    },
    {
      key: "identity_kicker",
      label: "Surtitre identité",
      description: "Sur-titre du formulaire d'identité.",
      type: "string",
      default: "● (IDENTITÉ)",
      maxLength: 40,
    },
    {
      key: "identity_title",
      label: "Titre du formulaire",
      description: "Titre affiché avant le formulaire d'identité.",
      type: "string",
      default: "Commençons",
      maxLength: 60,
    },
    {
      key: "identity_text",
      label: "Introduction du formulaire",
      description: "Phrase d'introduction du formulaire d'identité.",
      type: "text",
      default: "Deux informations suffisent pour ouvrir la discussion.",
      maxLength: 240,
    },
    {
      key: "name_field",
      label: "Champ nom",
      description: "Étiquette et exemple du champ nom, séparés par « | ».",
      type: "text",
      default: "Nom | Votre nom",
      maxLength: 80,
    },
    {
      key: "email_field",
      label: "Champ email",
      description: "Étiquette et exemple du champ email, séparés par « | ».",
      type: "text",
      default: "Email | vous@exemple.com",
      maxLength: 80,
    },
    {
      key: "consent_label",
      label: "Libellé du consentement",
      description:
        "Texte du consentement si la politique du lien n'en fournit pas. Laisser vide pour masquer la case.",
      type: "string",
      default: "J'accepte le traitement de mes données",
      maxLength: 160,
    },
    {
      key: "start_label",
      label: "Libellé de démarrage",
      description: "Bouton de soumission du formulaire d'identité.",
      type: "string",
      default: "DÉMARRER",
      maxLength: 40,
    },
    {
      key: "footer_left",
      label: "Pied de page gauche",
      description: "Texte à gauche du pied de page.",
      type: "string",
      default: "ONIRTECH / 2026",
      maxLength: 60,
    },
    {
      key: "footer_right",
      label: "Pied de page droite",
      description: "Texte à droite du pied de page.",
      type: "string",
      default: "DISPONIBLE 24/7",
      maxLength: 60,
    },
    {
      key: "details_label",
      label: "Libellé des détails",
      description: "Étiquette du bouton qui déploie le panneau de détails de l'assistant.",
      type: "string",
      default: "Détails de l'assistant",
      maxLength: 40,
    },
    {
      key: "primary_color",
      label: "Couleur principale",
      description: "Couleur d'accent (repli si un thème hôte est fourni).",
      type: "color",
      default: "#111111",
    },
];

export default defineManifest({ ...MANIFEST, params: PARAMS });
