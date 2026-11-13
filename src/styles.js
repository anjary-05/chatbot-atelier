// Feuille de style « Spin Product » — palette, typo, encoches, animations.
//
// Rappel du style source : fond gris pâle, cartes blanches à encoches (forme de
// ticket imprimé), typo monospace en capitales, accent noir franc, pastilles
// biseautées, curseur noir glissant, lignes de liaison techniques.
export const CSS = `
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter+Tight:wght@500&family=Tinos:ital,wght@0,400;1,400&display=swap");

:host {
  --bg: #e2e4e8;
  --card: #ffffff;
  --ink: #111111;
  --mute: #7b7e84;
  --chip: #eceef1;
  --line: #b9bcc2;
  --accent: #111111;
  /* Couleur lisible sur l'accent (posée par les gabarits, contraste WCAG). */
  --on-accent: #ffffff;
  --mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --display: "Inter Tight", "Helvetica Neue", Arial, sans-serif;
  --serif: "Tinos", Georgia, "Times New Roman", serif;
  --notch-pill: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
  --notch-center: polygon(0 10px, 12px 0, calc(100% - 12px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 10px));
  display: block;
  min-height: 100%;
  /* Le template est embarqué dans une page de largeur arbitraire : les
     ruptures sont donc exprimées en requêtes de conteneur, pas en viewport. */
  container-type: inline-size;
  container-name: atelier;
  color: var(--ink);
  font-family: var(--mono);
  -webkit-font-smoothing: antialiased;
}

*, *::before, *::after { box-sizing: border-box; }

.atelier {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg);
  background-image:
    linear-gradient(rgba(17, 17, 17, .022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(17, 17, 17, .022) 1px, transparent 1px);
  background-size: 28px 28px;
}

/* La page est une application de discussion : elle occupe la hauteur de la
   fenêtre, et c'est le fil qui défile — pas le document. */
.atelier--page {
  height: 100vh;
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
}

/* ── En-tête ───────────────────────────────────────────────────────────── */

.atelier-head {
  position: sticky;
  top: 0;
  z-index: 6;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 10px 20px;
  background: var(--bg);
}

.head-brand { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1 1 0; }

.head-logo {
  font-family: var(--display);
  font-weight: 500;
  font-size: 21px;
  letter-spacing: -.01em;
  line-height: 1;
}

.head-crumb {
  font-size: 10px;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--mute);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.head-acct { display: flex; align-items: center; gap: 10px; flex: 1 1 0; justify-content: flex-end; }

.head-nav { display: flex; gap: 18px; flex: 1 1 0; justify-content: center; }

.head-link {
  padding: 0;
  border: 0;
  background: none;
  color: var(--mute);
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: .08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color .18s ease;
}

.head-link:hover { color: var(--ink); }
.head-link.is-active { color: var(--ink); }

.head-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--mute);
  white-space: nowrap;
}

.head-status.is-done { color: var(--ink); }

.status-dot {
  width: 6px;
  height: 6px;
  background: var(--accent);
  border-radius: 50%;
  animation: pulse 2.2s infinite;
}

.head-status.is-done .status-dot { animation: none; opacity: .35; }

/* ── Pastilles ─────────────────────────────────────────────────────────── */

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 14px;
  background: var(--card);
  color: var(--ink);
  border: 0;
  clip-path: var(--notch-pill);
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: .05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color .18s ease;
  white-space: nowrap;
}

.pill:hover { background: #f4f5f7; }
.pill.is-active { background: var(--accent); color: var(--on-accent, #fff); }
.pill-count b { font-weight: 500; }
.pill-phase { margin-left: auto; }
.pill-phase.is-done { opacity: .55; }
.pill-suggestion { height: 28px; padding: 0 12px; font-size: 10px; }

/* ── Scène (colonne unique centrée) ────────────────────────────────────── */

.atelier-stage {
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: 940px;
  margin: 0 auto;
  padding: 12px 20px 20px;
  display: flex;
  flex-direction: column;
}

.atelier-card {
  position: relative;
  background: var(--card);
  box-shadow: 0 1px 0 rgba(17, 17, 17, .05);
}

.atelier-card--chat {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
  clip-path: var(--notch-center);
}

/* ── En-tête de la discussion ──────────────────────────────────────────── */

.chat-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--chip);
}

.chat-id { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.chat-id strong { font-family: var(--display); font-weight: 500; font-size: 16px; }
.chat-role { font-size: 9px; letter-spacing: .08em; text-transform: uppercase; color: var(--mute); }

.chat-more {
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  border: 0;
  background: var(--chip);
  color: var(--ink);
  font-family: var(--mono);
  font-size: 11px;
  cursor: pointer;
  transition: background-color .18s ease;
}

.chat-more:hover { background: var(--line); }

/* ── Écran d'accueil ───────────────────────────────────────────────────── */

.chat-welcome {
  padding: 34px 26px 32px;
  border-bottom: 1px solid var(--chip);
}

.card-kicker {
  font-size: 10px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--mute);
}

.welcome-title {
  margin: 8px 0 0;
  font-family: var(--display);
  font-weight: 500;
  font-size: clamp(28px, 4.4vw, 40px);
  line-height: 1.05;
  letter-spacing: -.02em;
  text-transform: uppercase;
}

.welcome-role {
  display: block;
  margin-top: 10px;
  font-size: 10px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--mute);
}

.welcome-text {
  margin: 16px 0 0;
  max-width: 62ch;
  font-family: var(--serif);
  font-size: 17px;
  line-height: 1.5;
  color: var(--mute);
}

/* ── Discussion ────────────────────────────────────────────────────────── */

.chat-stream {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.atelier-log {
  flex: 1 1 auto;
  min-height: 80px;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 22px 26px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color .2s ease;
}

.atelier-log:hover { scrollbar-color: var(--line) transparent; }

.atelier-log::-webkit-scrollbar { width: 8px; }
.atelier-log::-webkit-scrollbar-track { background: transparent; }
.atelier-log::-webkit-scrollbar-thumb { background: transparent; border-radius: 0; }
.atelier-log:hover::-webkit-scrollbar-thumb { background: var(--line); }

/* Conversation vide : l'écran d'accueil est centré dans la surface. */
.chat-stream.is-empty .atelier-log { justify-content: safe center; }
.chat-stream.is-empty .chat-welcome { width: 100%; border-bottom: 0; padding: 0; }

/* Conversation en cours : les messages s'appuient sur le composeur et
   remontent au fur et à mesure (comme un vrai fil de discussion). */
.chat-stream:not(.is-empty) .atelier-log > *:first-child { margin-top: auto; }

/* Bouton « redescendre » (visible seulement hors bas de fil). */
.chat-scroll-down {
  position: absolute;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  border: 0;
  background: var(--card);
  color: var(--ink);
  font-family: var(--mono);
  font-size: 12px;
  cursor: pointer;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
  box-shadow: 0 6px 18px rgba(17, 17, 17, .12);
  transition: transform .18s ease, box-shadow .18s ease;
}

.chat-scroll-down:hover {
  transform: translateX(-50%) translateY(-2px);
  box-shadow: 0 10px 24px rgba(17, 17, 17, .18);
}

.chat-scroll-down[hidden] { display: none; }

.atelier-msg { display: flex; gap: 12px; align-items: flex-start; }
.atelier-msg--user { flex-direction: row-reverse; }

.msg-bubble {
  position: relative;
  max-width: min(78%, 560px);
  padding: 13px 16px 15px;
  background: var(--bg);
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
}

.atelier-msg--user .msg-bubble {
  background: var(--accent);
  color: var(--on-accent, #fff);
  border: 1px solid color-mix(in srgb, var(--on-accent, #fff) 24%, transparent);
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
}

.msg-who {
  display: block;
  margin-bottom: 6px;
  font-size: 9px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--mute);
}

.atelier-msg--user .msg-who { color: color-mix(in srgb, var(--on-accent, #fff) 62%, transparent); }

.msg-text {
  margin: 0;
  font-family: var(--serif);
  font-size: 16px;
  line-height: 1.45;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* Contenu riche (réponses de l'IA) : structuré, sans sauts « pre-wrap ». */
.msg-text--rich { white-space: normal; }
.msg-p { margin: 0 0 10px; }
.msg-p:last-child { margin-bottom: 0; }
.msg-h { margin: 14px 0 8px; font-family: var(--serif); font-weight: 700; line-height: 1.3; overflow-wrap: anywhere; }
.msg-h1, .msg-h2 { font-size: 19px; }
.msg-h3 { font-size: 17px; }
.msg-h4 { font-size: 15px; }
.msg-h:first-child { margin-top: 0; }
.msg-list { margin: 0 0 10px; padding-left: 22px; }
.msg-list:last-child { margin-bottom: 0; }
.msg-list li { margin: 3px 0; }
.msg-list li::marker { color: var(--mute); }
.msg-list--nested { margin: 4px 0 4px; }
.msg-quote {
  margin: 0 0 10px;
  padding: 6px 12px;
  border-left: 2px solid var(--line);
  color: var(--mute);
  font-style: italic;
}
.msg-quote .msg-p:last-child { margin-bottom: 0; }
.msg-hr { border: 0; border-top: 1px solid var(--chip); margin: 12px 0; }
.msg-inline-code {
  font-family: var(--mono);
  font-size: .88em;
  padding: 1px 6px;
  background: rgba(17, 17, 17, .08);
  border: 1px solid var(--chip);
}
.msg-code-block { margin: 10px 0; background: #141518; overflow: hidden; }
.msg-code-block:last-child { margin-bottom: 0; }
.msg-code-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, .06);
}
.msg-code-lang {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: #a9abb1;
}
.msg-code-actions { display: inline-flex; align-items: center; gap: 8px; }
.msg-copy {
  padding: 4px 8px;
  border: 0;
  background: none;
  color: #c7c9cf;
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: .08em;
  text-transform: uppercase;
  cursor: pointer;
}
.msg-copy:hover { color: #fff; background: rgba(255, 255, 255, .08); }
.msg-copy-status { font-family: var(--mono); font-size: 9px; letter-spacing: .06em; color: #6ee7a8; }
.msg-code-body {
  margin: 0;
  padding: 12px;
  overflow-x: auto;
  font-family: var(--mono);
  font-size: 12px;
  line-height: 1.55;
  white-space: pre;
  color: #e8e8e8;
}
.msg-inline-photo { display: block; max-width: 100%; margin: 10px 0; }
.msg-table-wrap { margin: 10px 0; overflow-x: auto; }
.msg-table-wrap:last-child { margin-bottom: 0; }
.msg-table { border-collapse: collapse; font-size: 12.5px; }
.msg-table th, .msg-table td { border: 1px solid var(--line); padding: 6px 10px; text-align: left; vertical-align: top; }
.msg-table th {
  background: var(--chip);
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--mute);
}
.msg-text--rich, .msg-text--rich .msg-p, .msg-text--rich .msg-h, .msg-text--rich .msg-list li,
.msg-text--rich .msg-quote, .msg-text--rich .msg-link, .msg-text--rich .msg-inline-code,
.msg-text--rich del { overflow-wrap: anywhere; }

.msg-medias { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }

.msg-photo {
  width: 132px;
  height: 96px;
  object-fit: cover;
  background: var(--chip);
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
}

.msg-link {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: .04em;
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.msg-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }

.chip {
  padding: 3px 7px;
  background: var(--chip);
  font-size: 9px;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--mute);
}

.atelier-msg--user .chip {
  background: color-mix(in srgb, var(--on-accent, #fff) 14%, transparent);
  color: color-mix(in srgb, var(--on-accent, #fff) 82%, transparent);
}

/* Résultat d'outil (génératif) : carte de lecture conversationnelle. */
.msg-tool {
  margin-top: 10px;
  padding: 10px 12px;
  background: var(--card);
  border: 1px solid var(--chip);
  clip-path: polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px));
}

.msg-tool-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--mute);
}

.msg-tool-body { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }

.msg-tool-row { display: flex; flex-direction: column; gap: 2px; }

.msg-tool-field { display: flex; flex-direction: column; gap: 2px; }

.msg-tool-label {
  font-size: 9px;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--mute);
}

.msg-tool-value { font-size: 12px; line-height: 1.4; color: var(--ink); overflow-wrap: anywhere; }

.atelier-typing {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 0 26px 12px;
  font-size: 11px;
  letter-spacing: .04em;
  color: var(--mute);
}

.typing-dots {
  width: 26px;
  height: 8px;
  background:
    linear-gradient(var(--ink), var(--ink)) 0 0 / 6px 8px no-repeat,
    linear-gradient(var(--mute), var(--mute)) 10px 0 / 6px 8px no-repeat,
    linear-gradient(var(--line), var(--line)) 20px 0 / 6px 8px no-repeat;
  animation: typing 1.2s infinite;
}

/* ── Détails de l'assistant ────────────────────────────────────────────── */

.chat-details {
  padding: 20px 26px 22px;
  border-top: 1px solid var(--chip);
  background: var(--bg);
}

.details-head { display: flex; flex-direction: column; gap: 10px; }

.details-title {
  margin: 0;
  font-family: var(--display);
  font-weight: 500;
  font-size: 15px;
  letter-spacing: -.005em;
  text-transform: uppercase;
}

.card-metrics {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-metric {
  font-family: var(--display);
  font-weight: 500;
  font-size: 22px;
  letter-spacing: -.01em;
}

.card-tag {
  background: var(--chip);
  padding: 3px 6px;
  font-size: 10px;
  letter-spacing: .06em;
  text-transform: uppercase;
}

/* ── Accordéon ─────────────────────────────────────────────────────────── */

.atelier-accordion { margin-top: 18px; border-top: 1px solid var(--chip); }

.acc-row { border-bottom: 1px solid var(--chip); }

.acc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 11px 0;
  background: none;
  border: 0;
  color: var(--ink);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: .06em;
  text-transform: uppercase;
  cursor: pointer;
}

.acc-mark { color: var(--mute); }

.acc-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows .45s cubic-bezier(.65, 0, .25, 1);
}

.acc-inner { overflow: hidden; min-height: 0; }

.acc-inner > p {
  margin: 0;
  padding: 2px 0 12px;
  font-family: var(--serif);
  font-size: 14.5px;
  line-height: 1.4;
  color: var(--mute);
}

/* ── Suggestions ───────────────────────────────────────────────────────── */

.chat-suggestions {
  padding: 8px 16px 10px;
  border-top: 1px solid var(--chip);
}

.suggestions-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 6px;
}

.suggestions-title {
  font-family: var(--display);
  font-size: 11px;
  letter-spacing: -.005em;
  text-transform: uppercase;
}

.seg {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--seg-cols, 3), 1fr);
  gap: 4px;
  padding: 4px;
  background: var(--chip);
}

.seg-item {
  position: relative;
  z-index: 1;
  height: 36px;
  padding: 0 8px;
  background: none;
  border: 0;
  color: var(--ink);
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: .04em;
  text-transform: uppercase;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seg-item.is-selected { color: var(--on-accent, #fff); }

.seg-hl {
  position: absolute;
  z-index: 0;
  top: 4px;
  bottom: 4px;
  left: 0;
  width: 0;
  background: var(--accent);
  transition: left .45s cubic-bezier(.65, 0, .25, 1), width .45s cubic-bezier(.65, 0, .25, 1);
}

.suggestions { list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 4px; }

.card-note {
  margin: 12px 0 0;
  font-family: var(--serif);
  font-size: 13.5px;
  line-height: 1.45;
  color: var(--mute);
}

/* ── Boutons ───────────────────────────────────────────────────────────── */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 18px;
  border: 0;
  background: var(--chip);
  color: var(--ink);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: .06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color .18s ease, color .18s ease;
  white-space: nowrap;
}

.btn-black { background: var(--accent); color: var(--on-accent, #fff); }
.btn-black:hover { background: color-mix(in srgb, var(--accent) 84%, #000); }
.btn-black:active { background: color-mix(in srgb, var(--accent) 70%, #000); }
.btn-ghost { background: transparent; color: var(--mute); }
.btn-ghost:hover { color: var(--ink); background: var(--chip); }
.btn:disabled { opacity: .38; cursor: not-allowed; }

/* ── Composeur ─────────────────────────────────────────────────────────── */

.atelier-composer {
  padding: 12px 20px 16px;
  border-top: 1px solid var(--chip);
}

.composer-row { display: flex; gap: 8px; align-items: stretch; }

.composer-input {
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 16px;
  border: 1px solid var(--chip);
  background: var(--card);
  color: var(--ink);
  font-family: var(--mono);
  font-size: 13.5px;
  outline: none;
  clip-path: polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px));
  transition: border-color .18s ease;
}

.composer-input:focus { border-color: var(--ink); }
.composer-input:disabled { opacity: .5; }

.composer-foot {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 10px;
}

.btn-save {
  height: auto;
  padding: 0;
  background: none;
  color: var(--mute);
  font-size: 10px;
  letter-spacing: .08em;
}

.btn-save:hover { color: var(--ink); background: none; }
.btn-save.is-saved { color: var(--ink); background: none; }

.composer-hint {
  margin: 0;
  font-size: 9px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--mute);
}

/* ── Identité ──────────────────────────────────────────────────────────── */

.identity-form { display: flex; flex-direction: column; gap: 12px; margin-top: 22px; max-width: 640px; }

.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: var(--mute); }

.field-input {
  height: 42px;
  padding: 0 14px;
  border: 1px solid var(--chip);
  background: var(--card);
  font-family: var(--mono);
  font-size: 13px;
  color: var(--ink);
  outline: none;
  clip-path: polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px));
}

.field-input:focus { border-color: var(--ink); }

.field-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--serif);
  font-size: 13px;
  color: var(--mute);
}

.btn-start { margin-top: 6px; align-self: flex-start; padding: 0 28px; height: 40px; }

/* ── Avatars ───────────────────────────────────────────────────────────── */

.atelier-avatar {
  flex: 0 0 auto;
  width: var(--av-size, 40px);
  height: var(--av-size, 40px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--chip);
  color: var(--ink);
  overflow: hidden;
  clip-path: polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px));
}

.atelier-avatar img { width: 100%; height: 100%; object-fit: cover; }
.atelier-avatar--fallback { font-size: 11px; letter-spacing: .06em; }

/* Avatar du visiteur : icône par défaut (jamais de photo). */
.atelier-avatar--icon { background: var(--ink); color: #fff; }
.atelier-avatar--icon svg { width: 62%; height: 62%; display: block; }
.atelier-msg--user .atelier-avatar--icon { background: var(--line); color: var(--ink); }

/* ── Bandeau bas de la carte ───────────────────────────────────────────── */

.atelier-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 26px 14px;
  border-top: 1px solid var(--chip);
  font-size: 9px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--mute);
}

/* ── Widget ────────────────────────────────────────────────────────────── */

.atelier--widget { min-height: 0; height: 100vh; height: 100dvh; overflow: hidden; background: transparent; background-image: none; }

.widget-launcher {
  position: relative;
  width: 64px;
  height: 64px;
  padding: 0;
  border: 0;
  background: var(--accent);
  cursor: pointer;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
  transition: transform .2s ease;
}

.widget-launcher:hover { transform: translateY(-2px); }
.widget-launcher .atelier-avatar { --av-size: 30px; }

.widget-online {
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 9px;
  height: 9px;
  background: #6ee7a8;
  border-radius: 50%;
  box-shadow: 0 0 0 2px var(--accent);
}

.widget-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 320px;
  background: var(--bg);
  clip-path: polygon(0 8px, 10px 0, calc(100% - 10px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 8px));
}

.widget-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--chip);
}

.widget-id { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.widget-id strong { font-family: var(--display); font-weight: 500; font-size: 14px; }
.widget-status { font-size: 9px; letter-spacing: .06em; text-transform: uppercase; color: var(--mute); }

.widget-close {
  margin-left: auto;
  width: 28px;
  height: 28px;
  border: 0;
  background: var(--chip);
  color: var(--ink);
  font-size: 12px;
  cursor: pointer;
}

.atelier--widget .atelier-card--chat { min-height: 0; background: transparent; box-shadow: none; clip-path: none; }
.atelier--widget .chat-welcome { padding: 20px 14px 18px; }
.atelier--widget .welcome-title { font-size: 22px; }
.atelier--widget .welcome-text { font-size: 14px; margin-top: 10px; }
.atelier--widget .chat-stream { min-height: 120px; }
.atelier--widget .atelier-log { padding: 14px; gap: 12px; }
.atelier--widget .msg-bubble { max-width: 86%; padding: 10px 12px 12px; }
.atelier--widget .atelier-msg--assistant .msg-bubble { background: var(--card); }
.atelier--widget .msg-text { font-size: 14.5px; }
.atelier--widget .chat-details { padding: 14px; }
.atelier--widget .chat-suggestions { padding: 12px 14px; }
.atelier--widget .seg { display: flex; flex-wrap: wrap; background: none; padding: 0; gap: 6px; }
.atelier--widget .seg-hl { display: none; }
.atelier--widget .seg-item { height: 28px; padding: 0 12px; background: var(--card); clip-path: var(--notch-pill); flex: 0 0 auto; }
.atelier--widget .seg-item.is-selected { background: var(--accent); }
.atelier--widget .atelier-composer { padding: 12px 14px 14px; }
.atelier--widget .composer-row { display: grid; grid-template-columns: 1fr; gap: 6px; }
.atelier--widget .btn-send, .atelier--widget .btn-finish { width: 100%; }
.atelier--widget .composer-input { grid-column: 1 / -1; height: 40px; }
.atelier--widget .composer-foot { margin-top: 8px; }
.atelier--widget .composer-hint { display: none; }

/* ── Adaptatif (requêtes de conteneur) ─────────────────────────────────── */

@container atelier (max-width: 54rem) {
  .atelier--page .atelier-stage { padding: 14px 16px 20px; }
  .atelier--page .chat-welcome { padding: 26px 20px 24px; }
  .atelier--page .atelier-log { padding: 18px 20px; }
  .atelier--page .chat-details,
  .atelier--page .chat-suggestions,
  .atelier--page .atelier-composer { padding-left: 20px; padding-right: 20px; }
}

@container atelier (max-width: 40rem) {
  .atelier--page .atelier-head { padding: 6px 10px; gap: 6px; }
  .atelier--page .head-nav { display: none; }
  .atelier--page .head-crumb { display: none; }
  .atelier--page .atelier-stage { padding: 6px 8px 10px; }
  .atelier--page .chat-head { display: none; }
  .atelier--page .chat-welcome { padding: 16px 12px 14px; }
  .atelier--page .welcome-title { font-size: 22px; }
  .atelier--page .welcome-text { font-size: 14px; }
  .atelier--page .atelier-log { padding: 12px; }
  .atelier--page .msg-bubble { max-width: 92%; }
  .atelier--page .chat-details,
  .atelier--page .chat-suggestions { display: none; }
  .atelier--page .chat-more { display: none; }
  .atelier--page .atelier-card--chat { clip-path: none; }
  .atelier--page .chat-details,
  .atelier--page .chat-suggestions,
  .atelier--page .atelier-composer,
  .atelier--page .atelier-card-foot { display: none; }
  .atelier--page .field-row { grid-template-columns: 1fr; }
  .atelier--page .seg { grid-template-columns: 1fr; }
  .atelier--page .seg-hl { display: none; }
  .atelier--page .seg-item { background: var(--card); clip-path: var(--notch-pill); height: 28px; }
  .atelier--page .seg-item.is-selected { background: var(--accent); color: var(--on-accent, #fff); }
  .atelier--page .composer-row { display: grid; grid-template-columns: 1fr auto; gap: 6px; }
  .atelier--page .composer-input { grid-column: 1 / -1; height: 40px; }
  .atelier--page .btn-send { min-width: 0; }
  .atelier--page .btn-save { display: none; }
  .atelier--page .composer-hint { display: none; }
}

@container atelier (max-width: 23.75rem) {
  .atelier--page .atelier-head { padding: 8px 10px; gap: 6px; }
  .atelier--page .head-logo { font-size: 18px; }
  .atelier--page .head-crumb { display: none; }
  .atelier--page .atelier-stage { padding: 6px 8px 10px; }
  .atelier--page .chat-head { padding: 8px 10px; }
  .atelier--page .chat-head .chat-role { display: none; }
  .atelier--page .atelier-log { padding: 10px; }
  .atelier--page .msg-bubble { max-width: 96%; padding: 10px 12px 12px; }
  .atelier--page .atelier-composer { padding: 8px 10px 10px; }
  .atelier--page .composer-input { height: 38px; }
}

/* ── Animations ────────────────────────────────────────────────────────── */

@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(.7); opacity: .55; } 100% { transform: scale(1); opacity: 1; } }
@keyframes typing { 0%, 100% { opacity: .45; } 50% { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
}
`;
