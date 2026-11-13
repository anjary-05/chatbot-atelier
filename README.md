# Chatbot Atelier — « Spin Product »

Template visuel Onirtech : un chatbot au design **Spin Product** (cartes blanches à
encoches, typo monospace, accent noir), entièrement piloté par variables
dynamiques, décliné en **deux surfaces** : lien partagé (page) et widget
embarqué sur un site client.

- Protocole hôte : `onirtech.template-host.v1`
- SDK : `@onirtech/template-sdk@^0.2.0` (vanilla, sans framework)
- Variables : **40** (plafond ADR-0023)

## La page : une présentation de chatbot, pas une landing page

La page est **une seule colonne centrée** (940 px max) qui ne contient qu'une
chose : la conversation. L'en-tête (marque, compteur, statut) et le pied de
page (marque, liens, disponibilité) l'encadrent sans la concurrencer.

```
┌──────────────────────────────────────────────────────────┐
│ ONIRTECH / fil d'Ariane   ACCUEIL SERVICES CONTACT  MSG/3 ●│
├──────────────────────────────────────────────────────────┤
│  (avatar) Orvante · ASSISTANTE ÉDITORIALE   CONVERSATION [+]│
│  ──────────────────────────────────────────────────────  │
│  (écran d'accueil centré, disparaît dès le 1er message)   │
│  …messages, alignés sur le composeur et remontant…        │
│  ──────────────────────────────────────────────────────  │
│  OPTIONS  SUGGESTIONS                                     │
│  [ Obtenir un devis ][ Fixer un rendez-vous ][ … ]        │
│  ──────────────────────────────────────────────────────  │
│  [ Écrire votre message…            ][ENVOYER][TERMINER]  │
│  SAVER  ENTRÉE POUR ENVOYER                               │
│  ONIRTECH / 2026                            DISPONIBLE 24/7│
└──────────────────────────────────────────────────────────┘
```

| Zone | Contenu | Variables |
|---|---|---|
| En-tête | marque, fil d'Ariane, navigation, compteur, statut | `brand_name`, `brand_crumbs`, `nav_items`, `counter_label`, `status_active`, `status_done` |
| En-tête de discussion | avatar, nom, fonction, pastille de phase, bouton `[+]` | `bot_name`, `bot_role`, `bot_avatar_image`, `phase_label`, `details_label` |
| Écran d'accueil | formulaire d'identité **ou** carte de présentation du bot | `identity_*`, `name_field`, `email_field`, `consent_label`, `start_label` / `info_kicker`, `welcome_message` |
| Fil de discussion | messages, médias, sources, état du visiteur, indicateur de frappe | `user_label`, `user_icon`, `typing_text` |
| Détails `[+]` | titre, mesure, tag, accordéon | `info_title`, `info_metric`, `info_tag`, `info_rows` |
| Suggestions | sélecteur à curseur noir + pastilles, note | `action_kicker`, `action_title`, `suggestion_items`, `action_note` |
| Composeur | champ, envoi, fin, mémorisation, astuce | `input_placeholder`, `send_label`, `finish_label`, `toggle_label`, `toggle_saved_label`, `composer_hint` |
| Bas de carte | mentions, disponibilité | `footer_left`, `footer_right` |

### Défilement (comportement « chat »)

- La page occupe la hauteur de la fenêtre : **c'est le fil qui défile**, jamais
  le document ; le composeur reste donc toujours atteignable.
- Barre de défilement **flottante** : invisible au repos, elle n'apparaît qu'au
  survol du fil (8 px, sans piste).
- Les messages s'appuient sur le composeur et **remontent** à mesure.
- Le fil **suit** le bas seulement si le visiteur y était ; s'il remonte dans
  l'historique, sa position est conservée et un bouton **↓ « redescendre »**
  apparaît au bas du fil (défilement doux, `prefers-reduced-motion` respecté).

### Avatars

- **Bot** : `bot_avatar_image` est de type `image` — le panneau propose un
  **téléversement** (PNG/JPEG/WebP, 2 Mo) avec aperçu, remplacement et
  suppression, et non une saisie d'URL. Sans image, les initiales du bot sont
  affichées.
- **Visiteur** : jamais de photo. C'est une **icône par défaut** (silhouette,
  visiteur encadré ou anonyme) choisie par `user_icon`, dans le style
  « Spin Product » (tracé au trait, fond contrasté).

## Design

La direction artistique est reprise du gabarit « Spin Product » :

| Élément | Traitement |
|---|---|
| Fond | gris pâle `#e2e4e8` + trame technique très discrète |
| Carte | blanche, `clip-path` en ticket à encoches (angles coupés) |
| Typographie | IBM Plex Mono (interface), Inter Tight (titres), Tinos (textes longs) |
| Pastilles | 30 px, capitales 10 px, letter-spacing .05em, encoche 6 px |
| Accent | noir franc, curseur de sélection qui glisse, boutons sans rayon |
| Accordéon | en-têtes `[+]` / `[−]`, une seule ligne ouverte, animation `0fr → 1fr` |
| Écrans | cartes « à encoche » et typographie monospace en capitales |

La discussion reprend la hiérarchie d'un chat classique : messages alignés sur
le composeur (le fil remonte au fur et à mesure), identité en écran d'accueil
centré, suggestions en bas.

## Architecture (objet générique)

```
src/
├─ core/
│  ├─ component.js   classe de base : update(ctx) → patch() du DOM
│  ├─ dom.js         fabrique DOM/SVG (enfants variadiques)
│  ├─ element.js     enregistrement du Custom Element (propriété onirtechContext)
│  ├─ params.js      lecture typée des variables (texte, lignes, paires, couleurs)
│  ├─ store.js       état éphémère (brouillon, accordéon, défilement, widget)
│  ├─ surface.js     détection page / widget (ADR-0040)
│  ├─ theme.js       accent (thème hôte prioritaire, variable en repli)
│  └─ constants.js   noms d'éléments, tailles du widget
├─ components/       BrandHeader, ChatPanel, Welcome, IdentityCard, MessageList,
│                    Composer, DetailsPanel, Suggestions, Accordion, Avatar,
│                    CardFooter
├─ layouts/          PageLayout (colonne unique), WidgetLayout (launcher + panneau)
├─ index.js          entrée page   → <onirtech-template-chatbot-atelier>
├─ widget.js         entrée widget → <onirtech-widget-chatbot-atelier>
├─ manifest.js       manifeste + 40 variables
└─ styles.js         feuille de style (chaîne ES module)
```

Principes :

1. **Aucun texte figé.** Chaque libellé vient de `ctx.params` ; un test vérifie
   que les 40 variables pilotent réellement l'affichage.
2. **Rendu incrémental.** L'hôte rediffuse un contexte complet à chaque
   changement d'état ; les composants restent vivants et se repatchent, ce qui
   préserve le focus du composeur, le brouillon saisi et le défilement.
3. **Aucune requête réseau.** Le template lit le contexte et appelle des
   actions (`sendMessage`, `submitIdentity`, `finish`, `selectFallback`,
   `openMedia`, `openWidget`, `closeWidget`). Jamais de `fetch`.
4. **Aucune donnée inventée.** Les suggestions proviennent du menu de secours
   de l'hôte (capacité `fallback`) quand il existe, sinon des variables.
5. **Adaptatif au conteneur.** Le template est embarqué dans une page de
   largeur arbitraire : les ruptures (864 px / 640 px) passent par des
   requêtes de conteneur (`container-type: inline-size` sur `:host`), pas par
   des media queries de viewport.

## Surfaces

| | Page (`/l/<token>`) | Widget (`/embed/<token>`) |
|---|---|---|
| Entrée | `dist/index.js` | `dist/widget.js` |
| Élément | `onirtech-template-chatbot-atelier` | `onirtech-widget-chatbot-atelier` |
| Identité | oui (phase `identity`) | non — l'hôte démarre en `chat` |
| Consentement | affiché s'il est fourni | jamais |
| Mise en page | colonne unique centrée | launcher 64×64 puis panneau 420×680 |

Le launcher et le panneau restent sous la responsabilité du template
(ADR-0040) : l'ouverture et la fermeture passent par `openWidget` /
`closeWidget`.

## Commandes

```bash
npm install
npm run dev        # harness local sur http://localhost:4500 (mock par défaut)
npm test           # 14 tests (vitest + happy-dom)
npm run build      # dist/index.js + dist/widget.js + manifeste synchronisé
npm run validate   # manifeste : contrôle du kit + 33 règles du cœur CMS
npm run pack       # release/chatbot-atelier-<version>.onirtech-template
```

Harness :

- `http://localhost:4500/` — phase identité, mock ;
- `?phase=chat` — démarre en discussion ;
- `?surface=widget` — surface widget (launcher) ;
- `?surface=widget&open=1` — surface widget, panneau ouvert ;
- `?width=380` — contraint la largeur du template (revue des breakpoints) ;
- `?messages=14` — gonfle la discussion (revue du défilement) ;
- `?scroll=up` — remonte le fil (revue du bouton « redescendre ») ;
- `?<variable>=valeur` — surcharge n'importe quelle variable déclarée ;
- `?token=<jeton>` — mode LIVE (le jeton reste côté serveur du harness).

## Import dans le CMS

1. `npm run build && npm run validate && npm run pack`
2. Panneau d'administration → **Templates visuels** → importer
   `release/chatbot-atelier-1.0.0.onirtech-template`.
3. Pour la surface widget, créer un lien de type « specifique » ou
   « anonymous », **sans politique de confidentialité**, et choisir ce template.

## Variables (40)

Marque et chrome : `brand_name`, `brand_crumbs`, `nav_items`, `counter_label`,
`status_active`, `status_done`, `primary_color`.
Discussion : `bot_name`, `bot_role`, `bot_avatar_image`, `user_label`,
`user_icon`, `welcome_message`, `input_placeholder`, `send_label`,
`finish_label`, `typing_text`, `phase_label`, `composer_hint`, `details_label`.
Écran d'accueil et détails : `info_kicker`, `info_title`, `info_metric`,
`info_tag`, `info_rows`.
Suggestions : `action_kicker`, `action_title`, `suggestion_items`,
`toggle_label`, `toggle_saved_label`, `action_note`.
Identité : `identity_kicker`, `identity_title`, `identity_text`, `name_field`,
`email_field`, `consent_label`, `start_label`.
Bas de carte : `footer_left`, `footer_right`.

Formats multi-valeurs : `|` pour une liste sur une ligne, une ligne par
entrée pour une liste, `Titre|Texte` pour les paires.

> Le SDK publié ne connaît pas encore le type de variable `image`
> (téléversement) : il le renvoie `null` dans le manifeste généré. C'est
> pourquoi `src/manifest.js` exporte la liste brute `PARAMS` et que
> `tools/sync-manifest.mjs` reconstruit le bloc `params` après le build.
