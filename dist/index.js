function e(t) {
	let n = Array.isArray(t) ? t : [t], r = [];
	for (let t of n) t != null && t !== !1 && (Array.isArray(t) ? r.push(...e(t)) : t instanceof Node ? r.push(t) : r.push(document.createTextNode(String(t))));
	return r;
}
function t(e, t = {}) {
	for (let [n, r] of Object.entries(t)) r != null && r !== !1 && (n === "class" ? e.className = String(r) : n === "text" ? e.textContent = String(r) : n === "style" && typeof r == "object" ? Object.assign(e.style, r) : n === "value" ? e.value = r : n === "checked" ? e.checked = !!r : n === "disabled" ? e.disabled = !!r : n === "hidden" ? e.hidden = !!r : n.startsWith("on") && typeof r == "function" ? e.addEventListener(n.slice(2).toLowerCase(), r) : e.setAttribute(n, String(r)));
	return e;
}
function n(n, r = {}, ...i) {
	let a = document.createElement(n);
	return t(a, r), a.append(...e(i)), a;
}
function r(t, n = {}, ...r) {
	let i = document.createElementNS("http://www.w3.org/2000/svg", t);
	for (let [e, t] of Object.entries(n)) t != null && t !== !1 && (e === "text" ? i.textContent = String(t) : i.setAttribute(e, String(t)));
	return i.append(...e(r)), i;
}
function i(t, n) {
	return t.replaceChildren(...e(n)), t;
}
// src/core/element.js
function a(e, t, r = {}) {
	let i = customElements.get(e);
	if (i !== void 0) return i;
	let a = r.shadowDom ?? "open";
	class o extends HTMLElement {
		#e = null;
		#t;
		#n;
		#r = null;
		constructor() {
			super(), this.#t = a === "none" ? this : this.attachShadow({ mode: a }), this.#n = n("style", { text: r.css ?? "" });
		}
		set onirtechContext(e) {
			this.#e = e, this.#i();
		}
		get onirtechContext() {
			return this.#e;
		}
		connectedCallback() {
			this.#i();
		}
		disconnectedCallback() {
			this.#r?.destroy?.();
		}
		#i() {
			if (this.#e !== null) try {
				this.#r === null ? (this.#r = t(this.#e), this.#t.replaceChildren(this.#n, this.#r.el)) : this.#r.update(this.#e), requestAnimationFrame(() => this.#r?.afterMount?.());
			} catch (e) {
				console.error("[@onirtech/chatbot-atelier]", e);
				let t = n("div", {
					class: "atelier-error",
					text: "Une erreur est survenue."
				});
				this.#t.replaceChildren(this.#n, t);
			}
		}
	}
	return customElements.define(e, o), o;
}
// src/core/constants.js
var o = "onirtech-template-chatbot-atelier", s = new class {
	constructor() {
		this.draft = "", this.openRow = null, this.selectedSuggestion = null, this.saved = !1, this.scrollTop = 0, this.detailsOpen = !1, this.widgetOpen = !1, this.submitted = !1;
	}
	reset() {
		this.draft = "", this.openRow = null, this.selectedSuggestion = null, this.saved = !1, this.scrollTop = 0, this.detailsOpen = !1, this.widgetOpen = !1, this.submitted = !1;
	}
}(), c = "\n@import url(\"https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter+Tight:wght@500&family=Tinos:ital,wght@0,400;1,400&display=swap\");\n\n:host {\n  --bg: #e2e4e8;\n  --card: #ffffff;\n  --ink: #111111;\n  --mute: #7b7e84;\n  --chip: #eceef1;\n  --line: #b9bcc2;\n  --accent: #111111;\n  /* Couleur lisible sur l'accent (posée par les gabarits, contraste WCAG). */\n  --on-accent: #ffffff;\n  --mono: \"IBM Plex Mono\", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\n  --display: \"Inter Tight\", \"Helvetica Neue\", Arial, sans-serif;\n  --serif: \"Tinos\", Georgia, \"Times New Roman\", serif;\n  --notch-pill: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));\n  --notch-center: polygon(0 10px, 12px 0, calc(100% - 12px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 10px));\n  display: block;\n  min-height: 100%;\n  /* Le template est embarqué dans une page de largeur arbitraire : les\n     ruptures sont donc exprimées en requêtes de conteneur, pas en viewport. */\n  container-type: inline-size;\n  container-name: atelier;\n  color: var(--ink);\n  font-family: var(--mono);\n  -webkit-font-smoothing: antialiased;\n}\n\n*, *::before, *::after { box-sizing: border-box; }\n\n.atelier {\n  min-height: 100%;\n  display: flex;\n  flex-direction: column;\n  background-color: var(--bg);\n  background-image:\n    linear-gradient(rgba(17, 17, 17, .022) 1px, transparent 1px),\n    linear-gradient(90deg, rgba(17, 17, 17, .022) 1px, transparent 1px);\n  background-size: 28px 28px;\n}\n\n/* La page est une application de discussion : elle occupe la hauteur de la\n   fenêtre, et c'est le fil qui défile — pas le document. */\n.atelier--page {\n  height: 100vh;\n  height: 100dvh;\n  max-height: 100dvh;\n  overflow: hidden;\n}\n\n/* ── En-tête ───────────────────────────────────────────────────────────── */\n\n.atelier-head {\n  position: sticky;\n  top: 0;\n  z-index: 6;\n  display: flex;\n  align-items: center;\n  gap: 18px;\n  padding: 10px 20px;\n  background: var(--bg);\n}\n\n.head-brand { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1 1 0; }\n\n.head-logo {\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 21px;\n  letter-spacing: -.01em;\n  line-height: 1;\n}\n\n.head-crumb {\n  font-size: 10px;\n  letter-spacing: .06em;\n  text-transform: uppercase;\n  color: var(--mute);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.head-acct { display: flex; align-items: center; gap: 10px; flex: 1 1 0; justify-content: flex-end; }\n\n.head-nav { display: flex; gap: 18px; flex: 1 1 0; justify-content: center; }\n\n.head-link {\n  padding: 0;\n  border: 0;\n  background: none;\n  color: var(--mute);\n  font-family: var(--mono);\n  font-size: 10px;\n  letter-spacing: .08em;\n  text-transform: uppercase;\n  cursor: pointer;\n  transition: color .18s ease;\n}\n\n.head-link:hover { color: var(--ink); }\n.head-link.is-active { color: var(--ink); }\n\n.head-status {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 10px;\n  letter-spacing: .06em;\n  text-transform: uppercase;\n  color: var(--mute);\n  white-space: nowrap;\n}\n\n.head-status.is-done { color: var(--ink); }\n\n.status-dot {\n  width: 6px;\n  height: 6px;\n  background: var(--accent);\n  border-radius: 50%;\n  animation: pulse 2.2s infinite;\n}\n\n.head-status.is-done .status-dot { animation: none; opacity: .35; }\n\n/* ── Pastilles ─────────────────────────────────────────────────────────── */\n\n.pill {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  height: 30px;\n  padding: 0 14px;\n  background: var(--card);\n  color: var(--ink);\n  border: 0;\n  clip-path: var(--notch-pill);\n  font-family: var(--mono);\n  font-size: 10px;\n  letter-spacing: .05em;\n  text-transform: uppercase;\n  cursor: pointer;\n  transition: background-color .18s ease;\n  white-space: nowrap;\n}\n\n.pill:hover { background: #f4f5f7; }\n.pill.is-active { background: var(--accent); color: var(--on-accent, #fff); }\n.pill-count b { font-weight: 500; }\n.pill-phase { margin-left: auto; }\n.pill-phase.is-done { opacity: .55; }\n.pill-suggestion { height: 28px; padding: 0 12px; font-size: 10px; }\n\n/* ── Scène (colonne unique centrée) ────────────────────────────────────── */\n\n.atelier-stage {\n  flex: 1;\n  min-height: 0;\n  width: 100%;\n  max-width: 940px;\n  margin: 0 auto;\n  padding: 12px 20px 20px;\n  display: flex;\n  flex-direction: column;\n}\n\n.atelier-card {\n  position: relative;\n  background: var(--card);\n  box-shadow: 0 1px 0 rgba(17, 17, 17, .05);\n}\n\n.atelier-card--chat {\n  flex: 1;\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n  padding: 0;\n  clip-path: var(--notch-center);\n}\n\n/* ── En-tête de la discussion ──────────────────────────────────────────── */\n\n.chat-head {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 12px 20px;\n  border-bottom: 1px solid var(--chip);\n}\n\n.chat-id { display: flex; flex-direction: column; gap: 3px; min-width: 0; }\n.chat-id strong { font-family: var(--display); font-weight: 500; font-size: 16px; }\n.chat-role { font-size: 9px; letter-spacing: .08em; text-transform: uppercase; color: var(--mute); }\n\n.chat-more {\n  flex: 0 0 auto;\n  width: 30px;\n  height: 30px;\n  border: 0;\n  background: var(--chip);\n  color: var(--ink);\n  font-family: var(--mono);\n  font-size: 11px;\n  cursor: pointer;\n  transition: background-color .18s ease;\n}\n\n.chat-more:hover { background: var(--line); }\n\n/* ── Écran d'accueil ───────────────────────────────────────────────────── */\n\n.chat-welcome {\n  padding: 34px 26px 32px;\n  border-bottom: 1px solid var(--chip);\n}\n\n.card-kicker {\n  font-size: 10px;\n  letter-spacing: .08em;\n  text-transform: uppercase;\n  color: var(--mute);\n}\n\n.welcome-title {\n  margin: 8px 0 0;\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: clamp(28px, 4.4vw, 40px);\n  line-height: 1.05;\n  letter-spacing: -.02em;\n  text-transform: uppercase;\n}\n\n.welcome-role {\n  display: block;\n  margin-top: 10px;\n  font-size: 10px;\n  letter-spacing: .1em;\n  text-transform: uppercase;\n  color: var(--mute);\n}\n\n.welcome-text {\n  margin: 16px 0 0;\n  max-width: 62ch;\n  font-family: var(--serif);\n  font-size: 17px;\n  line-height: 1.5;\n  color: var(--mute);\n}\n\n/* ── Discussion ────────────────────────────────────────────────────────── */\n\n.chat-stream {\n  position: relative;\n  flex: 1;\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n}\n\n.atelier-log {\n  flex: 1 1 auto;\n  min-height: 80px;\n  overflow-y: auto;\n  overscroll-behavior: contain;\n  padding: 22px 26px;\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  scrollbar-width: thin;\n  scrollbar-color: transparent transparent;\n  transition: scrollbar-color .2s ease;\n}\n\n.atelier-log:hover { scrollbar-color: var(--line) transparent; }\n\n.atelier-log::-webkit-scrollbar { width: 8px; }\n.atelier-log::-webkit-scrollbar-track { background: transparent; }\n.atelier-log::-webkit-scrollbar-thumb { background: transparent; border-radius: 0; }\n.atelier-log:hover::-webkit-scrollbar-thumb { background: var(--line); }\n\n/* Conversation vide : l'écran d'accueil est centré dans la surface. */\n.chat-stream.is-empty .atelier-log { justify-content: safe center; }\n.chat-stream.is-empty .chat-welcome { width: 100%; border-bottom: 0; padding: 0; }\n\n/* Conversation en cours : les messages s'appuient sur le composeur et\n   remontent au fur et à mesure (comme un vrai fil de discussion). */\n.chat-stream:not(.is-empty) .atelier-log > *:first-child { margin-top: auto; }\n\n/* Bouton « redescendre » (visible seulement hors bas de fil). */\n.chat-scroll-down {\n  position: absolute;\n  left: 50%;\n  bottom: 14px;\n  transform: translateX(-50%);\n  width: 32px;\n  height: 32px;\n  border: 0;\n  background: var(--card);\n  color: var(--ink);\n  font-family: var(--mono);\n  font-size: 12px;\n  cursor: pointer;\n  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));\n  box-shadow: 0 6px 18px rgba(17, 17, 17, .12);\n  transition: transform .18s ease, box-shadow .18s ease;\n}\n\n.chat-scroll-down:hover {\n  transform: translateX(-50%) translateY(-2px);\n  box-shadow: 0 10px 24px rgba(17, 17, 17, .18);\n}\n\n.chat-scroll-down[hidden] { display: none; }\n\n.atelier-msg { display: flex; gap: 12px; align-items: flex-start; }\n.atelier-msg--user { flex-direction: row-reverse; }\n\n.msg-bubble {\n  position: relative;\n  max-width: min(78%, 560px);\n  padding: 13px 16px 15px;\n  background: var(--bg);\n  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));\n}\n\n.atelier-msg--user .msg-bubble {\n  background: var(--accent);\n  color: var(--on-accent, #fff);\n  border: 1px solid color-mix(in srgb, var(--on-accent, #fff) 24%, transparent);\n  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);\n}\n\n.msg-who {\n  display: block;\n  margin-bottom: 6px;\n  font-size: 9px;\n  letter-spacing: .08em;\n  text-transform: uppercase;\n  color: var(--mute);\n}\n\n.atelier-msg--user .msg-who { color: color-mix(in srgb, var(--on-accent, #fff) 62%, transparent); }\n\n.msg-text {\n  margin: 0;\n  font-family: var(--serif);\n  font-size: 16px;\n  line-height: 1.45;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n\n/* Contenu riche (réponses de l'IA) : structuré, sans sauts « pre-wrap ». */\n.msg-text--rich { white-space: normal; }\n.msg-p { margin: 0 0 10px; }\n.msg-p:last-child { margin-bottom: 0; }\n.msg-h { margin: 14px 0 8px; font-family: var(--serif); font-weight: 700; line-height: 1.3; overflow-wrap: anywhere; }\n.msg-h1, .msg-h2 { font-size: 19px; }\n.msg-h3 { font-size: 17px; }\n.msg-h4 { font-size: 15px; }\n.msg-h:first-child { margin-top: 0; }\n.msg-list { margin: 0 0 10px; padding-left: 22px; }\n.msg-list:last-child { margin-bottom: 0; }\n.msg-list li { margin: 3px 0; }\n.msg-list li::marker { color: var(--mute); }\n.msg-list--nested { margin: 4px 0 4px; }\n.msg-quote {\n  margin: 0 0 10px;\n  padding: 6px 12px;\n  border-left: 2px solid var(--line);\n  color: var(--mute);\n  font-style: italic;\n}\n.msg-quote .msg-p:last-child { margin-bottom: 0; }\n.msg-hr { border: 0; border-top: 1px solid var(--chip); margin: 12px 0; }\n.msg-inline-code {\n  font-family: var(--mono);\n  font-size: .88em;\n  padding: 1px 6px;\n  background: rgba(17, 17, 17, .08);\n  border: 1px solid var(--chip);\n}\n.msg-code-block { margin: 10px 0; background: #141518; overflow: hidden; }\n.msg-code-block:last-child { margin-bottom: 0; }\n.msg-code-head {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 10px;\n  padding: 6px 12px;\n  background: rgba(255, 255, 255, .06);\n}\n.msg-code-lang {\n  font-family: var(--mono);\n  font-size: 9px;\n  letter-spacing: .08em;\n  text-transform: uppercase;\n  color: #a9abb1;\n}\n.msg-code-actions { display: inline-flex; align-items: center; gap: 8px; }\n.msg-copy {\n  padding: 4px 8px;\n  border: 0;\n  background: none;\n  color: #c7c9cf;\n  font-family: var(--mono);\n  font-size: 9px;\n  letter-spacing: .08em;\n  text-transform: uppercase;\n  cursor: pointer;\n}\n.msg-copy:hover { color: #fff; background: rgba(255, 255, 255, .08); }\n.msg-copy-status { font-family: var(--mono); font-size: 9px; letter-spacing: .06em; color: #6ee7a8; }\n.msg-code-body {\n  margin: 0;\n  padding: 12px;\n  overflow-x: auto;\n  font-family: var(--mono);\n  font-size: 12px;\n  line-height: 1.55;\n  white-space: pre;\n  color: #e8e8e8;\n}\n.msg-inline-photo { display: block; max-width: 100%; margin: 10px 0; }\n.msg-table-wrap { margin: 10px 0; overflow-x: auto; }\n.msg-table-wrap:last-child { margin-bottom: 0; }\n.msg-table { border-collapse: collapse; font-size: 12.5px; }\n.msg-table th, .msg-table td { border: 1px solid var(--line); padding: 6px 10px; text-align: left; vertical-align: top; }\n.msg-table th {\n  background: var(--chip);\n  font-family: var(--mono);\n  font-size: 9px;\n  letter-spacing: .08em;\n  text-transform: uppercase;\n  color: var(--mute);\n}\n.msg-text--rich, .msg-text--rich .msg-p, .msg-text--rich .msg-h, .msg-text--rich .msg-list li,\n.msg-text--rich .msg-quote, .msg-text--rich .msg-link, .msg-text--rich .msg-inline-code,\n.msg-text--rich del { overflow-wrap: anywhere; }\n\n.msg-medias { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }\n\n.msg-photo {\n  width: 132px;\n  height: 96px;\n  object-fit: cover;\n  background: var(--chip);\n  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);\n}\n\n.msg-link {\n  font-family: var(--mono);\n  font-size: 11px;\n  letter-spacing: .04em;\n  color: inherit;\n  text-decoration: underline;\n  text-underline-offset: 3px;\n}\n\n.msg-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }\n\n.chip {\n  padding: 3px 7px;\n  background: var(--chip);\n  font-size: 9px;\n  letter-spacing: .06em;\n  text-transform: uppercase;\n  color: var(--mute);\n}\n\n.atelier-msg--user .chip {\n  background: color-mix(in srgb, var(--on-accent, #fff) 14%, transparent);\n  color: color-mix(in srgb, var(--on-accent, #fff) 82%, transparent);\n}\n\n/* Résultat d'outil (génératif) : carte de lecture conversationnelle. */\n.msg-tool {\n  margin-top: 10px;\n  padding: 10px 12px;\n  background: var(--card);\n  border: 1px solid var(--chip);\n  clip-path: polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px));\n}\n\n.msg-tool-head {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-family: var(--mono);\n  font-size: 9px;\n  letter-spacing: .08em;\n  text-transform: uppercase;\n  color: var(--mute);\n}\n\n.msg-tool-body { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }\n\n.msg-tool-row { display: flex; flex-direction: column; gap: 2px; }\n\n.msg-tool-field { display: flex; flex-direction: column; gap: 2px; }\n\n.msg-tool-label {\n  font-size: 9px;\n  letter-spacing: .06em;\n  text-transform: uppercase;\n  color: var(--mute);\n}\n\n.msg-tool-value { font-size: 12px; line-height: 1.4; color: var(--ink); overflow-wrap: anywhere; }\n\n.atelier-typing {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  margin: 0;\n  padding: 0 26px 12px;\n  font-size: 11px;\n  letter-spacing: .04em;\n  color: var(--mute);\n}\n\n.typing-dots {\n  width: 26px;\n  height: 8px;\n  background:\n    linear-gradient(var(--ink), var(--ink)) 0 0 / 6px 8px no-repeat,\n    linear-gradient(var(--mute), var(--mute)) 10px 0 / 6px 8px no-repeat,\n    linear-gradient(var(--line), var(--line)) 20px 0 / 6px 8px no-repeat;\n  animation: typing 1.2s infinite;\n}\n\n/* ── Détails de l'assistant ────────────────────────────────────────────── */\n\n.chat-details {\n  padding: 20px 26px 22px;\n  border-top: 1px solid var(--chip);\n  background: var(--bg);\n}\n\n.details-head { display: flex; flex-direction: column; gap: 10px; }\n\n.details-title {\n  margin: 0;\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 15px;\n  letter-spacing: -.005em;\n  text-transform: uppercase;\n}\n\n.card-metrics {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n}\n\n.card-metric {\n  font-family: var(--display);\n  font-weight: 500;\n  font-size: 22px;\n  letter-spacing: -.01em;\n}\n\n.card-tag {\n  background: var(--chip);\n  padding: 3px 6px;\n  font-size: 10px;\n  letter-spacing: .06em;\n  text-transform: uppercase;\n}\n\n/* ── Accordéon ─────────────────────────────────────────────────────────── */\n\n.atelier-accordion { margin-top: 18px; border-top: 1px solid var(--chip); }\n\n.acc-row { border-bottom: 1px solid var(--chip); }\n\n.acc-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 10px;\n  width: 100%;\n  padding: 11px 0;\n  background: none;\n  border: 0;\n  color: var(--ink);\n  font-family: var(--mono);\n  font-size: 11px;\n  letter-spacing: .06em;\n  text-transform: uppercase;\n  cursor: pointer;\n}\n\n.acc-mark { color: var(--mute); }\n\n.acc-body {\n  display: grid;\n  grid-template-rows: 0fr;\n  transition: grid-template-rows .45s cubic-bezier(.65, 0, .25, 1);\n}\n\n.acc-inner { overflow: hidden; min-height: 0; }\n\n.acc-inner > p {\n  margin: 0;\n  padding: 2px 0 12px;\n  font-family: var(--serif);\n  font-size: 14.5px;\n  line-height: 1.4;\n  color: var(--mute);\n}\n\n/* ── Suggestions ───────────────────────────────────────────────────────── */\n\n.chat-suggestions {\n  padding: 8px 16px 10px;\n  border-top: 1px solid var(--chip);\n}\n\n.suggestions-head {\n  display: flex;\n  align-items: baseline;\n  gap: 8px;\n  margin-bottom: 6px;\n}\n\n.suggestions-title {\n  font-family: var(--display);\n  font-size: 11px;\n  letter-spacing: -.005em;\n  text-transform: uppercase;\n}\n\n.seg {\n  position: relative;\n  display: grid;\n  grid-template-columns: repeat(var(--seg-cols, 3), 1fr);\n  gap: 4px;\n  padding: 4px;\n  background: var(--chip);\n}\n\n.seg-item {\n  position: relative;\n  z-index: 1;\n  height: 36px;\n  padding: 0 8px;\n  background: none;\n  border: 0;\n  color: var(--ink);\n  font-family: var(--mono);\n  font-size: 10px;\n  letter-spacing: .04em;\n  text-transform: uppercase;\n  cursor: pointer;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.seg-item.is-selected { color: var(--on-accent, #fff); }\n\n.seg-hl {\n  position: absolute;\n  z-index: 0;\n  top: 4px;\n  bottom: 4px;\n  left: 0;\n  width: 0;\n  background: var(--accent);\n  transition: left .45s cubic-bezier(.65, 0, .25, 1), width .45s cubic-bezier(.65, 0, .25, 1);\n}\n\n.suggestions { list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 4px; }\n\n.card-note {\n  margin: 12px 0 0;\n  font-family: var(--serif);\n  font-size: 13.5px;\n  line-height: 1.45;\n  color: var(--mute);\n}\n\n/* ── Boutons ───────────────────────────────────────────────────────────── */\n\n.btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  height: 36px;\n  padding: 0 18px;\n  border: 0;\n  background: var(--chip);\n  color: var(--ink);\n  font-family: var(--mono);\n  font-size: 11px;\n  letter-spacing: .06em;\n  text-transform: uppercase;\n  cursor: pointer;\n  transition: background-color .18s ease, color .18s ease;\n  white-space: nowrap;\n}\n\n.btn-black { background: var(--accent); color: var(--on-accent, #fff); }\n.btn-black:hover { background: color-mix(in srgb, var(--accent) 84%, #000); }\n.btn-black:active { background: color-mix(in srgb, var(--accent) 70%, #000); }\n.btn-ghost { background: transparent; color: var(--mute); }\n.btn-ghost:hover { color: var(--ink); background: var(--chip); }\n.btn:disabled { opacity: .38; cursor: not-allowed; }\n\n/* ── Composeur ─────────────────────────────────────────────────────────── */\n\n.atelier-composer {\n  padding: 12px 20px 16px;\n  border-top: 1px solid var(--chip);\n}\n\n.composer-row { display: flex; gap: 8px; align-items: stretch; }\n\n.composer-input {\n  flex: 1;\n  min-width: 0;\n  height: 44px;\n  padding: 0 16px;\n  border: 1px solid var(--chip);\n  background: var(--card);\n  color: var(--ink);\n  font-family: var(--mono);\n  font-size: 13.5px;\n  outline: none;\n  clip-path: polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px));\n  transition: border-color .18s ease;\n}\n\n.composer-input:focus { border-color: var(--ink); }\n.composer-input:disabled { opacity: .5; }\n\n.composer-foot {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  margin-top: 10px;\n}\n\n.btn-save {\n  height: auto;\n  padding: 0;\n  background: none;\n  color: var(--mute);\n  font-size: 10px;\n  letter-spacing: .08em;\n}\n\n.btn-save:hover { color: var(--ink); background: none; }\n.btn-save.is-saved { color: var(--ink); background: none; }\n\n.composer-hint {\n  margin: 0;\n  font-size: 9px;\n  letter-spacing: .08em;\n  text-transform: uppercase;\n  color: var(--mute);\n}\n\n/* ── Identité ──────────────────────────────────────────────────────────── */\n\n.identity-form { display: flex; flex-direction: column; gap: 12px; margin-top: 22px; max-width: 640px; }\n\n.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }\n.field { display: flex; flex-direction: column; gap: 6px; }\n.field-label { font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: var(--mute); }\n\n.field-input {\n  height: 42px;\n  padding: 0 14px;\n  border: 1px solid var(--chip);\n  background: var(--card);\n  font-family: var(--mono);\n  font-size: 13px;\n  color: var(--ink);\n  outline: none;\n  clip-path: polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px));\n}\n\n.field-input:focus { border-color: var(--ink); }\n\n.field-check {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-family: var(--serif);\n  font-size: 13px;\n  color: var(--mute);\n}\n\n.btn-start { margin-top: 6px; align-self: flex-start; padding: 0 28px; height: 40px; }\n\n/* ── Avatars ───────────────────────────────────────────────────────────── */\n\n.atelier-avatar {\n  flex: 0 0 auto;\n  width: var(--av-size, 40px);\n  height: var(--av-size, 40px);\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  background: var(--chip);\n  color: var(--ink);\n  overflow: hidden;\n  clip-path: polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px));\n}\n\n.atelier-avatar img { width: 100%; height: 100%; object-fit: cover; }\n.atelier-avatar--fallback { font-size: 11px; letter-spacing: .06em; }\n\n/* Avatar du visiteur : icône par défaut (jamais de photo). */\n.atelier-avatar--icon { background: var(--ink); color: #fff; }\n.atelier-avatar--icon svg { width: 62%; height: 62%; display: block; }\n.atelier-msg--user .atelier-avatar--icon { background: var(--line); color: var(--ink); }\n\n/* ── Bandeau bas de la carte ───────────────────────────────────────────── */\n\n.atelier-card-foot {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 16px;\n  padding: 10px 26px 14px;\n  border-top: 1px solid var(--chip);\n  font-size: 9px;\n  letter-spacing: .08em;\n  text-transform: uppercase;\n  color: var(--mute);\n}\n\n/* ── Widget ────────────────────────────────────────────────────────────── */\n\n.atelier--widget { min-height: 0; height: 100vh; height: 100dvh; overflow: hidden; background: transparent; background-image: none; }\n\n.widget-launcher {\n  position: relative;\n  width: 64px;\n  height: 64px;\n  padding: 0;\n  border: 0;\n  background: var(--accent);\n  cursor: pointer;\n  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));\n  transition: transform .2s ease;\n}\n\n.widget-launcher:hover { transform: translateY(-2px); }\n.widget-launcher .atelier-avatar { --av-size: 30px; }\n\n.widget-online {\n  position: absolute;\n  right: 6px;\n  bottom: 6px;\n  width: 9px;\n  height: 9px;\n  background: #6ee7a8;\n  border-radius: 50%;\n  box-shadow: 0 0 0 2px var(--accent);\n}\n\n.widget-panel {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  min-height: 320px;\n  background: var(--bg);\n  clip-path: polygon(0 8px, 10px 0, calc(100% - 10px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 8px));\n}\n\n.widget-head {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 12px 14px;\n  border-bottom: 1px solid var(--chip);\n}\n\n.widget-id { display: flex; flex-direction: column; gap: 2px; min-width: 0; }\n.widget-id strong { font-family: var(--display); font-weight: 500; font-size: 14px; }\n.widget-status { font-size: 9px; letter-spacing: .06em; text-transform: uppercase; color: var(--mute); }\n\n.widget-close {\n  margin-left: auto;\n  width: 28px;\n  height: 28px;\n  border: 0;\n  background: var(--chip);\n  color: var(--ink);\n  font-size: 12px;\n  cursor: pointer;\n}\n\n.atelier--widget .atelier-card--chat { min-height: 0; background: transparent; box-shadow: none; clip-path: none; }\n.atelier--widget .chat-welcome { padding: 20px 14px 18px; }\n.atelier--widget .welcome-title { font-size: 22px; }\n.atelier--widget .welcome-text { font-size: 14px; margin-top: 10px; }\n.atelier--widget .chat-stream { min-height: 120px; }\n.atelier--widget .atelier-log { padding: 14px; gap: 12px; }\n.atelier--widget .msg-bubble { max-width: 86%; padding: 10px 12px 12px; }\n.atelier--widget .atelier-msg--assistant .msg-bubble { background: var(--card); }\n.atelier--widget .msg-text { font-size: 14.5px; }\n.atelier--widget .chat-details { padding: 14px; }\n.atelier--widget .chat-suggestions { padding: 12px 14px; }\n.atelier--widget .seg { display: flex; flex-wrap: wrap; background: none; padding: 0; gap: 6px; }\n.atelier--widget .seg-hl { display: none; }\n.atelier--widget .seg-item { height: 28px; padding: 0 12px; background: var(--card); clip-path: var(--notch-pill); flex: 0 0 auto; }\n.atelier--widget .seg-item.is-selected { background: var(--accent); }\n.atelier--widget .atelier-composer { padding: 12px 14px 14px; }\n.atelier--widget .composer-row { display: grid; grid-template-columns: 1fr; gap: 6px; }\n.atelier--widget .btn-send, .atelier--widget .btn-finish { width: 100%; }\n.atelier--widget .composer-input { grid-column: 1 / -1; height: 40px; }\n.atelier--widget .composer-foot { margin-top: 8px; }\n.atelier--widget .composer-hint { display: none; }\n\n/* ── Adaptatif (requêtes de conteneur) ─────────────────────────────────── */\n\n@container atelier (max-width: 54rem) {\n  .atelier--page .atelier-stage { padding: 14px 16px 20px; }\n  .atelier--page .chat-welcome { padding: 26px 20px 24px; }\n  .atelier--page .atelier-log { padding: 18px 20px; }\n  .atelier--page .chat-details,\n  .atelier--page .chat-suggestions,\n  .atelier--page .atelier-composer { padding-left: 20px; padding-right: 20px; }\n}\n\n@container atelier (max-width: 40rem) {\n  .atelier--page .atelier-head { padding: 6px 10px; gap: 6px; }\n  .atelier--page .head-nav { display: none; }\n  .atelier--page .head-crumb { display: none; }\n  .atelier--page .atelier-stage { padding: 6px 8px 10px; }\n  .atelier--page .chat-head { display: none; }\n  .atelier--page .chat-welcome { padding: 16px 12px 14px; }\n  .atelier--page .welcome-title { font-size: 22px; }\n  .atelier--page .welcome-text { font-size: 14px; }\n  .atelier--page .atelier-log { padding: 12px; }\n  .atelier--page .msg-bubble { max-width: 92%; }\n  .atelier--page .chat-details,\n  .atelier--page .chat-suggestions { display: none; }\n  .atelier--page .chat-more { display: none; }\n  .atelier--page .atelier-card--chat { clip-path: none; }\n  .atelier--page .chat-details,\n  .atelier--page .chat-suggestions,\n  .atelier--page .atelier-composer,\n  .atelier--page .atelier-card-foot { display: none; }\n  .atelier--page .field-row { grid-template-columns: 1fr; }\n  .atelier--page .seg { grid-template-columns: 1fr; }\n  .atelier--page .seg-hl { display: none; }\n  .atelier--page .seg-item { background: var(--card); clip-path: var(--notch-pill); height: 28px; }\n  .atelier--page .seg-item.is-selected { background: var(--accent); color: var(--on-accent, #fff); }\n  .atelier--page .composer-row { display: grid; grid-template-columns: 1fr auto; gap: 6px; }\n  .atelier--page .composer-input { grid-column: 1 / -1; height: 40px; }\n  .atelier--page .btn-send { min-width: 0; }\n  .atelier--page .btn-save { display: none; }\n  .atelier--page .composer-hint { display: none; }\n}\n\n@container atelier (max-width: 23.75rem) {\n  .atelier--page .atelier-head { padding: 8px 10px; gap: 6px; }\n  .atelier--page .head-logo { font-size: 18px; }\n  .atelier--page .head-crumb { display: none; }\n  .atelier--page .atelier-stage { padding: 6px 8px 10px; }\n  .atelier--page .chat-head { padding: 8px 10px; }\n  .atelier--page .chat-head .chat-role { display: none; }\n  .atelier--page .atelier-log { padding: 10px; }\n  .atelier--page .msg-bubble { max-width: 96%; padding: 10px 12px 12px; }\n  .atelier--page .atelier-composer { padding: 8px 10px 10px; }\n  .atelier--page .composer-input { height: 38px; }\n}\n\n/* ── Animations ────────────────────────────────────────────────────────── */\n\n@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(.7); opacity: .55; } 100% { transform: scale(1); opacity: 1; } }\n@keyframes typing { 0%, 100% { opacity: .45; } 50% { opacity: 1; } }\n\n@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }\n}\n";
// node_modules/@onirtech/template-sdk/dist/index.js
function l(e) {
	return typeof e == "string" || typeof e == "boolean" || typeof e == "number" && Number.isFinite(e);
}
function u(e, t, n) {
	let r = e.params?.[t];
	return l(r) ? r : n;
}
function d(e, t) {
	let n = e.capabilities;
	return Array.isArray(n) && n.includes(t);
}
// src/core/params.js
var f = class {
	constructor(e) {
		this.ctx = e;
	}
	raw(e, t = "") {
		let n = u(this.ctx, e, t);
		return n == null ? t : typeof n == "string" ? n : String(n);
	}
	text(e, t = "") {
		return this.raw(e, t).trim();
	}
	number(e, t = 0) {
		let n = Number(this.raw(e, t));
		return Number.isFinite(n) ? n : t;
	}
	bool(e, t = !1) {
		let n = this.raw(e, t === !0 ? "1" : "").trim().toLowerCase();
		return n === "" ? t : n === "1" || n === "true" || n === "on" || n === "yes";
	}
	lines(e, t = []) {
		let n = this.raw(e, "").split(/\r?\n/).map((e) => e.trim()).filter(Boolean);
		return n.length > 0 ? n : t;
	}
	pipe(e, t = []) {
		let n = this.raw(e, "").split("|").map((e) => e.trim()).filter(Boolean);
		return n.length > 0 ? n : t;
	}
	map(e) {
		let t = {};
		for (let n of this.lines(e, [])) {
			let e = n.indexOf("=");
			if (e <= 0) continue;
			let r = n.slice(0, e).trim();
			r !== "" && (t[r] = n.slice(e + 1).trim());
		}
		return t;
	}
	label(e, t, n = "") {
		let r = this.map(e)[t];
		return r === void 0 || r === "" ? n : r;
	}
	pairs(e, t = []) {
		let n = this.lines(e, []).map((e) => {
			let t = e.indexOf("|");
			return t < 0 ? {
				label: e,
				value: ""
			} : {
				label: e.slice(0, t).trim(),
				value: e.slice(t + 1).trim()
			};
		});
		return n.length > 0 ? n : t;
	}
	color(e, t = "#111111") {
		let n = this.text(e, t);
		return /^#[0-9a-fA-F]{6}$/.test(n) ? n : t;
	}
}, p = class {
	constructor(e, t) {
		this.ctx = e, this.store = t, this.params = new f(e), this.el = null;
	}
	update(e) {
		this.ctx = e, this.params = new f(e), this.patch();
	}
	patch() {}
	afterMount() {}
	destroy() {}
};
// src/core/theme.js
function m(e, t) {
	let n = e?.theme ?? {}, r = n.primary || n.accent;
	return typeof r == "string" && r.trim() !== "" ? r.trim() : t.color("primary_color", "#111111");
}
var h = "#111111", g = "#ffffff", _ = (e) => {
	let t = e / 255;
	return t <= .03928 ? t / 12.92 : ((t + .055) / 1.055) ** 2.4;
}, v = (e, t, n) => .2126 * _(e) + .7152 * _(t) + .0722 * _(n), y = v(17, 17, 17), b = 1;
function x(e) {
	let t = String(e ?? "").trim().toLowerCase();
	if (typeof document < "u") try {
		let e = document.createElement("canvas").getContext?.("2d");
		if (e) {
			e.fillStyle = "#010203", e.fillStyle = t;
			let n = e.fillStyle;
			n !== "#010203" && (t = n);
		}
	} catch {}
	let n = /^#([0-9a-f]{3,8})$/.exec(t);
	if (n !== null) {
		let e = n[1];
		return (e.length === 3 || e.length === 4) && (e = [...e].map((e) => e + e).join("")), e.length !== 6 && e.length !== 8 ? null : v(parseInt(e.slice(0, 2), 16), parseInt(e.slice(2, 4), 16), parseInt(e.slice(4, 6), 16));
	}
	let r = t.match(/-?[\d.]+%?/g);
	if (r !== null && r.length >= 3) {
		let [e, t, n] = r.slice(0, 3).map((e) => {
			let t = parseFloat(e);
			return e.endsWith("%") ? t / 100 * 255 : t;
		});
		return [
			e,
			t,
			n
		].some((e) => !Number.isFinite(e) || e < 0 || e > 255) ? null : v(e, t, n);
	}
	return null;
}
function S(e) {
	let t = x(e);
	if (t === null) return g;
	let n = (e) => (Math.max(t, e) + .05) / (Math.min(t, e) + .05);
	return n(y) >= n(b) ? h : g;
}
// src/components/header.js
var C = class extends p {
	constructor(e, t) {
		super(e, t), this.el = n("header", { class: "atelier-head" }), this.#e();
	}
	patch() {
		this.#e();
	}
	#e() {
		let e = this.params, t = e.text("brand_name", "ONIRTECH"), r = e.text("brand_crumbs", "ACCUEIL > ASSISTANCE"), i = e.text("counter_label", "MSG"), a = e.pipe("nav_items", [
			"Accueil",
			"Services",
			"Contact"
		]), o = this.ctx.state?.messages?.length ?? 0, s = this.ctx.state?.status === "finalisee", c = s ? e.text("status_done", "Conversation terminée") : e.text("status_active", "En ligne"), l = n("div", { class: "head-brand" }, n("span", {
			class: "head-logo",
			text: t
		}), r === "" ? null : n("span", {
			class: "head-crumb",
			text: r
		})), u = n("nav", {
			class: "head-nav",
			"aria-label": "Navigation"
		}, ...a.map((e, t) => n("button", {
			type: "button",
			class: `head-link${t === 0 ? " is-active" : ""}`,
			text: e
		}))), d = n("div", { class: "head-acct" }, n("span", { class: "pill pill-count" }, `${i}/`, n("b", { text: String(o) })), n("span", { class: `head-status${s ? " is-done" : ""}` }, n("span", {
			class: "status-dot",
			"aria-hidden": "true"
		}), c));
		this.el.replaceChildren(l, u, d);
	}
}, w = {
	PAGE: "page",
	WIDGET: "widget"
};
function ee(e) {
	return e?.surface === w.WIDGET ? w.WIDGET : w.PAGE;
}
function T(e) {
	return ee(e) === w.WIDGET;
}
function E(e) {
	let t = T(e), n = e?.state?.phase === "chat" ? "chat" : "identity";
	return {
		widget: t,
		phase: t ? "chat" : n,
		identity: !t && n === "identity",
		consent: !t && e?.consent != null
	};
}
// src/components/avatar.js
function D(e) {
	let t = String(e || "").trim().split(/\s+/).filter(Boolean);
	return t.length === 0 ? "?" : t.slice(0, 2).map((e) => e[0]?.toUpperCase() || "").join("") || "?";
}
var O = () => r("svg", {
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	"stroke-width": "1.5"
}, [r("circle", {
	cx: "12",
	cy: "8",
	r: "3.4"
}), r("path", { d: "M4.5 20c0-4 3.4-6.2 7.5-6.2s7.5 2.2 7.5 6.2" })]), k = {
	profile: O,
	person: O,
	guest: () => r("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		"stroke-width": "1.5"
	}, [
		r("circle", {
			cx: "12",
			cy: "12",
			r: "9.2",
			"stroke-dasharray": "2.6 2.6"
		}),
		r("circle", {
			cx: "12",
			cy: "9.6",
			r: "2.6"
		}),
		r("path", { d: "M7.2 18.4c0-2.6 2.2-4.1 4.8-4.1s4.8 1.5 4.8 4.1" })
	]),
	anonymous: () => r("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		"stroke-width": "1.5"
	}, [
		r("circle", {
			cx: "12",
			cy: "12",
			r: "9"
		}),
		r("path", { d: "M9.7 9.3a2.5 2.5 0 1 1 3.1 2.4c-.7.3-1 .9-1 1.6v.3" }),
		r("circle", {
			cx: "11.8",
			cy: "16.5",
			r: "0.85",
			fill: "currentColor",
			stroke: "none"
		})
	])
}, A = class extends p {
	constructor(e, t, r = {}) {
		super(e, t), this.url = r.url ?? "", this.label = r.label ?? "", this.size = r.size ?? 40, this.tone = r.tone ?? "bot", this.icon = r.icon ?? "profile", this.el = n("span", {
			class: `atelier-avatar atelier-avatar--${this.tone}`,
			style: { "--av-size": `${this.size}px` }
		}), this.#e();
	}
	patch() {
		this.#e();
	}
	#e() {
		let e = String(this.url || "").trim();
		if (e !== "") this.el.classList.remove("atelier-avatar--fallback", "atelier-avatar--icon"), this.el.textContent = "", this.el.appendChild(n("img", {
			src: e,
			alt: this.label,
			loading: "lazy",
			decoding: "async"
		}));
		else if (this.tone === "user") {
			let e = Object.hasOwn(k, this.icon) ? this.icon : "profile";
			this.el.classList.remove("atelier-avatar--fallback"), this.el.classList.add("atelier-avatar--icon"), this.el.textContent = "", this.el.setAttribute("aria-label", this.label), this.el.setAttribute("role", "img"), this.el.setAttribute("data-icon", e), this.el.appendChild(k[e]());
		} else this.el.classList.remove("atelier-avatar--icon"), this.el.removeAttribute("data-icon"), this.el.classList.add("atelier-avatar--fallback"), this.el.textContent = D(this.label), this.el.setAttribute("aria-label", this.label), this.el.setAttribute("role", "img");
	}
}, j = class extends p {
	constructor(e, t) {
		super(e, t), this.input = n("input", {
			class: "composer-input",
			type: "text",
			autocomplete: "off",
			spellcheck: "false"
		}), this.sendButton = n("button", {
			type: "submit",
			class: "btn btn-black btn-send"
		}), this.finishButton = n("button", {
			type: "button",
			class: "btn btn-ghost btn-finish"
		}), this.saveButton = n("button", {
			type: "button",
			class: "btn btn-save"
		}), this.hint = n("p", { class: "composer-hint" }), this.input.addEventListener("input", () => {
			this.store.draft = this.input.value;
		}), this.input.addEventListener("keydown", (e) => {
			e.key === "Enter" && !e.shiftKey && (e.preventDefault(), this.#t());
		}), this.el = n("form", {
			class: "atelier-composer",
			novalidate: "true"
		}, n("div", { class: "composer-row" }, this.input, this.sendButton, this.finishButton), n("div", { class: "composer-foot" }, this.saveButton, this.hint)), this.el.addEventListener("submit", (e) => {
			e.preventDefault(), this.#t();
		}), this.#e();
	}
	patch() {
		this.#e();
	}
	#e() {
		let e = this.params, t = e.text("input_placeholder", "Écrivez votre message…"), n = e.text("send_label", "ENVOYER"), r = e.text("finish_label", "TERMINER"), i = e.text("toggle_label", "SAVER"), a = e.text("toggle_saved_label", "SAVED"), o = e.text("composer_hint", "Entrée pour envoyer"), s = this.ctx.state?.status === "finalisee", c = this.ctx.state?.typing === !0, l = E(this.ctx).identity;
		this.el.hidden = l, this.input.placeholder !== t && (this.input.placeholder = t), this.input.value !== this.store.draft && (this.input.value = this.store.draft), this.input.setAttribute("aria-label", t), this.input.disabled = s, this.sendButton.textContent = n, this.sendButton.disabled = s || c, this.finishButton.textContent = r, this.finishButton.disabled = s, this.saveButton.textContent = this.store.saved ? a : i, this.saveButton.classList.toggle("is-saved", this.store.saved === !0), this.saveButton.disabled = s, this.hint.textContent = s ? e.text("status_done", "Conversation terminée") : o, this.finishButton.onclick = () => {
			s || this.ctx.actions?.finish?.();
		}, this.saveButton.onclick = () => {
			this.store.saved = !this.store.saved, this.#e();
		};
	}
	#t() {
		let e = this.store.draft.trim();
		e !== "" && this.ctx.state?.status !== "finalisee" && this.ctx.state?.typing !== !0 && (this.ctx.actions?.sendMessage?.(e), this.store.draft = "", this.input.value = "");
	}
}, te = class extends p {
	constructor(e, t) {
		super(e, t), this.el = n("div", { class: "atelier-card-foot" }), this.#e();
	}
	patch() {
		this.#e();
	}
	#e() {
		let e = this.params, t = e.text("footer_left", "ONIRTECH / 2026"), r = e.text("footer_right", "DISPONIBLE 24/7");
		this.el.replaceChildren(n("span", {
			class: "foot-left",
			text: t
		}), n("span", {
			class: "foot-right",
			text: r
		}));
	}
}, ne = class extends p {
	constructor(e, t, r = {}) {
		super(e, t), this.rows = r.rows ?? [], this.openKey = r.openKey ?? "row", this.rows.length > 0 && this.store.openRow === null && (this.store.openRow = `${this.openKey}-0`), this.el = n("div", { class: "atelier-accordion" }), this.#e();
	}
	patch() {
		this.#e();
	}
	#e() {
		this.el.replaceChildren(), this.rows.forEach((e, t) => {
			let r = `${this.openKey}-${t}`, i = this.store.openRow === r, a = n("div", { class: "acc-body" }, n("div", { class: "acc-inner" }, n("p", { text: e.value })));
			a.style.gridTemplateRows = i ? "1fr" : "0fr";
			let o = n("button", {
				type: "button",
				class: "acc-header",
				"aria-expanded": i ? "true" : "false"
			}, n("span", {
				class: "acc-label",
				text: e.label
			}), n("span", {
				class: "acc-mark",
				text: i ? "[−]" : "[+]"
			}));
			o.addEventListener("click", () => {
				this.store.openRow = i ? null : r, this.#e();
			}), this.el.appendChild(n("div", { class: "acc-row" }, o, a));
		});
	}
}, re = class extends p {
	constructor(e, t) {
		super(e, t), this.accordion = new ne(e, t, {
			rows: this.params.pairs("info_rows", [{
				label: "Description",
				value: "Un assistant disponible, des réponses claires."
			}, {
				label: "Horaires",
				value: "Du lundi au vendredi, 08:00 — 18:00."
			}]),
			openKey: "info"
		}), this.el = n("section", {
			class: "chat-details",
			hidden: "true"
		}), this.#e();
	}
	patch() {
		this.accordion.update(this.ctx), this.#e();
	}
	#e() {
		let e = this.params, t = this.store.detailsOpen === !0;
		if (this.el.hidden = !t, !t) return;
		let r = e.text("info_title", "Une conversation qui avance"), a = e.text("info_metric", "24/7"), o = e.text("info_tag", "EN LIGNE");
		i(this.el, [n("div", { class: "details-head" }, n("h3", {
			class: "details-title",
			text: r
		}), n("div", { class: "card-metrics" }, n("strong", {
			class: "card-metric",
			text: a
		}), n("span", {
			class: "card-tag",
			text: o
		}))), this.accordion.el]);
	}
}, M = (e) => typeof e == "object" && !!e && !Array.isArray(e);
function N(e, t = "") {
	let n = String(e?.content ?? "").trim();
	if (n !== "") return n;
	let r = Array.isArray(e?.blocks) ? e.blocks : [];
	for (let e of r) if (M(e) && e.type === "text" && typeof e.text == "string" && e.text.trim() !== "") return e.text;
	return String(t ?? "");
}
function P(e) {
	let t = [], n = Array.isArray(e?.blocks) ? e.blocks : [];
	for (let e of n) M(e) && e.type === "image" && typeof e.url == "string" && t.push({
		url: e.url,
		alt: e.alt ?? ""
	});
	let r = Array.isArray(e?.medias) ? e.medias : [];
	for (let e of r) e?.type === "photo" && t.push({
		url: e.url,
		alt: e.libelle ?? ""
	});
	return t;
}
function F(e) {
	let t = Array.isArray(e?.blocks) ? e.blocks : [];
	for (let e of t) if (M(e) && e.type === "tool_search_result") return e;
	return null;
}
// src/core/markdown.js
var I = /* @__PURE__ */ new Set([
	"http:",
	"https:",
	"mailto:"
]);
function L(e) {
	let t = String(e ?? "").trim();
	try {
		let e = new URL(t);
		return I.has(e.protocol) ? e.href : null;
	} catch {
		return null;
	}
}
var R = /[.,;:!?)\]]+$/;
function z(e) {
	let t = R.exec(e);
	return t === null ? {
		url: e,
		trail: ""
	} : {
		url: e.slice(0, e.length - t[0].length),
		trail: t[0]
	};
}
var B = /(!\[[^\]]*\]\([^)\s]+\)|\[[^\]]*\]\([^)\s]+\)|~~[^~\n]+~~|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`\n]+`|https?:\/\/[^\s<>()[\]]+|mailto:[^\s<>()[\]]+)/g;
function V(e, t) {
	let r = String(t ?? "").split(B);
	for (let t of r) {
		if (t === "") continue;
		let r = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(t);
		if (r !== null) {
			let i = L(r[2]);
			i === null ? e.appendChild(document.createTextNode(t)) : e.appendChild(n("img", {
				class: "msg-inline-photo",
				src: i,
				alt: r[1],
				loading: "lazy"
			}));
		} else if (r = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(t), r !== null) {
			let t = L(r[2]);
			if (t === null) {
				e.appendChild(document.createTextNode(r[1]));
				continue;
			}
			e.appendChild(n("a", {
				class: "msg-link",
				href: t,
				target: "_blank",
				rel: "noopener noreferrer",
				text: r[1]
			}));
		} else if (r = /^~~([^~\n]+)~~$/.exec(t), r !== null) e.appendChild(n("del", {}, ...H(r[1])));
		else if (r = /^\*\*([^*\n]+)\*\*$/.exec(t) || /^__([^_\n]+)__$/.exec(t), r !== null) e.appendChild(n("strong", {}, ...H(r[1])));
		else if (r = /^\*([^*\n]+)\*$/.exec(t) || /^_([^_\n]+)_$/.exec(t), r !== null) e.appendChild(n("em", {}, ...H(r[1])));
		else if (r = /^`([^`\n]+)`$/.exec(t), r !== null) e.appendChild(n("code", {
			class: "msg-inline-code",
			text: r[1]
		}));
		else if (/^(https?:\/\/|mailto:)/.test(t)) {
			let { url: r, trail: i } = z(t), a = L(r);
			a === null ? e.appendChild(document.createTextNode(r)) : e.appendChild(n("a", {
				class: "msg-link",
				href: a,
				target: "_blank",
				rel: "noopener noreferrer",
				text: r
			})), i !== "" && e.appendChild(document.createTextNode(i));
		} else e.appendChild(document.createTextNode(t));
	}
}
var H = (e) => {
	let t = document.createElement("span");
	return V(t, e), [...t.childNodes];
};
function U(e, t) {
	let r = String(t ?? "").replace(/\n+$/, ""), i = n("span", {
		class: "msg-copy-status",
		hidden: "true"
	}), a = n("button", {
		type: "button",
		class: "msg-copy",
		text: "Copier"
	});
	return a.addEventListener("click", () => {
		let e = (e) => {
			i.textContent = e ? "Copié" : "Échec", i.hidden = !1, setTimeout(() => {
				i.hidden = !0;
			}, 1600);
		};
		try {
			let t = typeof navigator < "u" ? navigator.clipboard?.writeText?.(r) : void 0;
			if (t === void 0) {
				e(!1);
				return;
			}
			t.then(() => e(!0), () => e(!1));
		} catch {
			e(!1);
		}
	}), n("div", { class: "msg-code-block" }, n("div", { class: "msg-code-head" }, n("span", {
		class: "msg-code-lang",
		text: e || "code"
	}), n("span", { class: "msg-code-actions" }, a, i)), n("pre", { class: "msg-code-body" }, n("code", { text: r })));
}
var W = /^(\s*)([-*+]|(\d+)[.)])\s+(.*)$/;
function G(e, t) {
	if (!e[t].includes("|")) return null;
	let r = e[t + 1];
	if (r === void 0 || !/^\s*\|?[\s:|-]+\|?\s*$/.test(r) || !r.includes("-") || !r.includes("|")) return null;
	let i = (e) => e.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((e) => e.trim()), a = i(e[t]), o = t + 2, s = [];
	for (; o < e.length && e[o].trim() !== "" && e[o].includes("|");) s.push(i(e[o])), o += 1;
	let c = n("table", { class: "msg-table" }), l = n("tr");
	for (let e of a) {
		let t = n("th", { scope: "col" });
		V(t, e), l.appendChild(t);
	}
	c.appendChild(n("thead", {}, l));
	let u = n("tbody");
	for (let e of s) {
		let t = [...e.slice(0, a.length)];
		for (; t.length < a.length;) t.push("");
		let r = n("tr");
		for (let e of t) {
			let t = n("td");
			V(t, e), r.appendChild(t);
		}
		u.appendChild(r);
	}
	return c.appendChild(u), {
		node: n("div", { class: "msg-table-wrap" }, c),
		next: o
	};
}
function K(e, t) {
	let r = [], i = t;
	for (; i < e.length;) {
		let t = W.exec(e[i]);
		if (t === null) break;
		r.push({
			level: Math.min(1, Math.floor(t[1].length / 2)),
			ordered: /\d/.test(t[2]),
			text: t[4]
		}), i += 1;
	}
	let a = n(r[0]?.ordered === !0 ? "ol" : "ul", { class: "msg-list" }), o = null, s = null;
	for (let e of r) e.level === 0 ? (o = n("li", {}, ...H(e.text)), a.appendChild(o), s = null) : (o === null && (o = n("li", {}), a.appendChild(o)), s === null && (s = n(e.ordered ? "ol" : "ul", { class: "msg-list msg-list--nested" }), o.appendChild(s)), s.appendChild(n("li", {}, ...H(e.text))));
	return {
		node: a,
		next: i
	};
}
var q = /^(#{1,6})\s+(.*)$/, J = /^(-{3,}|\*{3,}|_{3,})$/, Y = /^\s*```/;
function ie(e, t) {
	let n = e[t];
	if (n === void 0 || !n.includes("|")) return !1;
	let r = e[t + 1];
	return r !== void 0 && /^\s*\|?[\s:|-]+\|?\s*$/.test(r) && r.includes("-") && r.includes("|");
}
function X(e, t) {
	let r = String(t).split("\n"), i = 0, a = (e) => q.test(e.trim()) || W.test(e) || /^\s*>/.test(e) || J.test(e.trim()) || Y.test(e);
	for (; i < r.length;) {
		let t = r[i], o = t.trim();
		if (o === "") {
			i += 1;
			continue;
		}
		let s = G(r, i);
		if (s !== null) {
			e.appendChild(s.node), i = s.next;
			continue;
		}
		let c = q.exec(o);
		if (c !== null) {
			let t = Math.min(c[1].length, 4);
			e.appendChild(n(`h${t + 2}`, { class: `msg-h msg-h${c[1].length}` }, ...H(c[2].trim()))), i += 1;
			continue;
		}
		if (J.test(o)) {
			e.appendChild(n("hr", { class: "msg-hr" })), i += 1;
			continue;
		}
		if (W.test(t)) {
			let t = K(r, i);
			e.appendChild(t.node), i = t.next;
			continue;
		}
		if (/^\s*>/.test(t)) {
			let t = [];
			for (; i < r.length && /^\s*>/.test(r[i]);) t.push(r[i].replace(/^\s*>\s?/, "")), i += 1;
			let a = n("blockquote", { class: "msg-quote" });
			X(a, t.join("\n")), e.appendChild(a);
			continue;
		}
		let l = [];
		for (; i < r.length;) {
			let e = r[i];
			if (e.trim() === "" || ie(r, i) || a(e)) break;
			l.push(e), i += 1;
		}
		if (l.length === 0) {
			i += 1;
			continue;
		}
		let u = n("p", { class: "msg-p" });
		l.forEach((e, t) => {
			t > 0 && u.appendChild(n("br")), V(u, e);
		}), e.appendChild(u);
	}
}
var Z = /```([A-Za-z0-9_+-]*)[^\n]*\n([\s\S]*?)```/g;
function ae(e, t) {
	e.replaceChildren();
	let n = String(t ?? ""), r = [], i = 0;
	Z.lastIndex = 0;
	let a = Z.exec(n);
	for (; a !== null;) a.index > i && r.push({
		type: "text",
		content: n.slice(i, a.index)
	}), r.push({
		type: "code",
		lang: a[1],
		content: a[2]
	}), i = a.index + a[0].length, a = Z.exec(n);
	if (i < n.length) {
		let e = n.slice(i), t = e.indexOf("```");
		if (t === -1) r.push({
			type: "text",
			content: e
		});
		else {
			t > 0 && r.push({
				type: "text",
				content: e.slice(0, t)
			});
			let n = e.slice(t + 3), i = n.indexOf("\n"), a = (i === -1 ? n : n.slice(0, i)).trim();
			r.push({
				type: "code",
				lang: a,
				content: i === -1 ? "" : n.slice(i + 1)
			});
		}
	}
	for (let t of r) t.type === "code" ? e.appendChild(U(t.lang, t.content)) : X(e, t.content);
}
// src/components/message-list.js
function oe(e, t) {
	t?.role === "user" ? e.textContent = N(t) : ae(e, N(t));
}
var se = 32, ce = class extends p {
	constructor(e, t) {
		super(e, t), this.log = n("div", { class: "atelier-log" }), this.button = n("button", {
			type: "button",
			class: "chat-scroll-down",
			"aria-label": "Descendre dans la conversation",
			text: "↓",
			hidden: "true"
		}), this.el = n("div", { class: "chat-stream" }, this.log, this.button), this.nodes = /* @__PURE__ */ new Map(), this.leading = null, this.stick = !0, this.muting = !1, this.log.addEventListener("scroll", () => this.#a()), this.button.addEventListener("click", () => this.#o(!0)), this.#t();
	}
	setLeading(e) {
		let t = this.leading;
		this.leading = e ?? null, e === null ? t !== null && t.parentNode === this.log && t.remove() : e.parentNode !== this.log && this.log.prepend(e);
	}
	patch() {
		this.#t();
	}
	afterMount() {
		this.#s();
	}
	#e() {
		return Array.isArray(this.ctx.state?.messages) ? this.ctx.state.messages : [];
	}
	#t() {
		let e = this.#e(), t = /* @__PURE__ */ new Set(), n = null;
		this.muting = !0;
		for (let r of e) {
			let i = String(r.id ?? n?.id ?? e.indexOf(r));
			t.add(i);
			let a = this.nodes.get(i);
			a === void 0 ? (a = this.#n(r, i), this.nodes.set(i, a)) : this.#r(a, r), n === null ? this.leading === null ? this.log.firstChild !== a && this.log.prepend(a) : this.leading.nextSibling !== a && this.leading.after(a) : n.nextSibling !== a && n.after(a), n = a;
		}
		for (let [e, n] of [...this.nodes]) t.has(e) || (n.remove(), this.nodes.delete(e));
		this.#s(), requestAnimationFrame(() => {
			this.muting = !1;
		});
	}
	#n(e, t) {
		let r = e.role === "user", i = r ? this.params.text("user_label", "Vous") : this.params.text("bot_name", "Assistant"), a = new A(this.ctx, this.store, {
			url: r ? "" : this.params.text("bot_avatar_image", ""),
			label: i,
			size: 28,
			tone: r ? "user" : "bot",
			icon: this.params.text("user_icon", "profile")
		}), o = n("div", { class: r ? "msg-text" : "msg-text msg-text--rich" }), s = n("div", { class: "msg-bubble" }, n("span", {
			class: "msg-who",
			text: i
		}), o), c = n("article", {
			class: `atelier-msg atelier-msg--${r ? "user" : "assistant"}`,
			"data-id": t
		}, a.el, s);
		return this.#r(c, e), c;
	}
	#r(e, t) {
		let r = e.querySelector(".msg-text");
		r !== null && oe(r, t);
		let i = e.querySelector(".msg-medias"), a = P(t);
		a.length === 0 ? i?.remove() : (i === null && (i = n("div", { class: "msg-medias" }), e.querySelector(".msg-bubble")?.appendChild(i)), i.replaceChildren(...a.map((e) => n("img", {
			class: "msg-photo",
			src: e.url,
			alt: e.alt,
			loading: "lazy"
		}))));
		let o = F(t), s = e.querySelector(".msg-tool");
		o === null ? s?.remove() : (s === null && (s = n("div", { class: "msg-tool" }), e.querySelector(".msg-bubble")?.appendChild(s)), s.replaceChildren(n("div", { class: "msg-tool-head" }, n("span", {
			class: "msg-tool-name",
			text: o.tool ?? ""
		})), this.#i(o)));
		let c = e.querySelector(".msg-chips"), l = [];
		if (d(this.ctx, "knowledge") && Array.isArray(t.knowledge)) for (let e of t.knowledge) l.push({
			label: e.titre ?? e.ref ?? "",
			tone: "knowledge"
		});
		if (d(this.ctx, "userState") && t.userState != null && l.push({
			label: t.userState.label ?? "",
			tone: "state"
		}), l.length === 0) c?.remove();
		else {
			let t = c ?? n("div", { class: "msg-chips" });
			t.replaceChildren(...l.map((e) => n("span", {
				class: `chip chip--${e.tone}`,
				text: e.label
			}))), c === null && e.querySelector(".msg-bubble")?.appendChild(t);
		}
	}
	#i(e) {
		let t = n("div", { class: "msg-tool-body" }), r = Array.isArray(e.items) ? e.items : [];
		for (let e of r) {
			let r = Array.isArray(e?.fields) ? e.fields : [], i = n("div", { class: "msg-tool-row" });
			for (let e of r) i.appendChild(n("div", { class: "msg-tool-field" }, n("span", {
				class: "msg-tool-label",
				text: e.label ?? e.key ?? ""
			}), n("span", {
				class: "msg-tool-value",
				text: String(e.value ?? "")
			})));
			t.appendChild(i);
		}
		return t;
	}
	#a() {
		if (this.muting) return;
		let e = this.log.scrollHeight - this.log.clientHeight - this.log.scrollTop;
		this.stick = e <= se, this.store.scrollTop = this.log.scrollTop, this.button.hidden = this.stick;
	}
	#o(e) {
		if (this.stick = !0, this.store.scrollTop = this.log.scrollHeight, this.button.hidden = !0, e && typeof this.log.scrollTo == "function") {
			let e = typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			try {
				this.log.scrollTo({
					top: this.log.scrollHeight,
					behavior: e ? "auto" : "smooth"
				});
				return;
			} catch {}
		}
		this.log.scrollTop = this.log.scrollHeight;
	}
	#s() {
		this.stick ? (this.log.scrollTop = this.log.scrollHeight, this.store.scrollTop = this.log.scrollTop) : this.log.scrollTop = this.store.scrollTop, this.button.hidden = this.stick;
	}
}, Q = 3, le = class extends p {
	constructor(e, t) {
		super(e, t), this.enabled = !0, this.el = n("section", {
			class: "chat-suggestions",
			hidden: "true"
		}), this.#n();
	}
	patch() {
		this.#n();
	}
	setEnabled(e) {
		this.enabled = e === !0, this.#n();
	}
	#e() {
		let e = d(this.ctx, "fallback") && this.ctx.state?.fallback != null ? this.ctx.state.fallback : null;
		return e !== null && Array.isArray(e.questions) && e.questions.length > 0 ? {
			source: "fallback",
			items: e.questions.map((e) => ({
				id: e.id,
				label: e.label
			}))
		} : {
			source: "params",
			items: this.params.pairs("suggestion_items", []).map((e, t) => ({
				id: `param-${t}`,
				label: e.label,
				question: e.value === "" ? e.label : e.value
			}))
		};
	}
	#t(e, t) {
		this.store.selectedSuggestion = e.id, t.source === "fallback" ? this.ctx.actions?.selectFallback?.(e.id) : e.question !== void 0 && this.ctx.actions?.sendMessage?.(e.question), this.#n();
	}
	#n() {
		let e = Array.isArray(this.ctx.state?.messages) ? this.ctx.state.messages : [], t = this.#e(), r = t.items;
		if (r.length === 0 || this.enabled === !1 || e.length > 0) {
			this.el.hidden = !0, i(this.el, []);
			return;
		}
		this.el.hidden = !1;
		let a = this.params, o = a.text("action_kicker", "OPTIONS"), s = a.text("action_title", "Suggestions"), c = a.text("action_note", ""), l = r.slice(0, Q), u = r.slice(Q), d = Math.max(1, l.length), f = l.findIndex((e) => e.id === this.store.selectedSuggestion), p = n("span", {
			class: "seg-hl",
			"aria-hidden": "true"
		});
		f >= 0 && (p.style.left = `${f * 100 / d}%`, p.style.width = `${100 / d}%`);
		let m = n("div", {
			class: "seg",
			role: "group",
			"aria-label": s,
			style: { "--seg-cols": String(d) }
		}, ...l.map((e, r) => {
			let i = e.id === this.store.selectedSuggestion, a = n("button", {
				type: "button",
				class: `seg-item${i ? " is-selected" : ""}`,
				text: e.label,
				"aria-pressed": i ? "true" : "false"
			});
			return a.addEventListener("click", () => this.#t(e, t)), a;
		}), p), h = u.length === 0 ? null : n("ul", { class: "suggestions" }, ...u.map((e) => {
			let r = n("button", {
				type: "button",
				class: "pill pill-suggestion",
				text: e.label
			});
			return r.addEventListener("click", () => this.#t(e, t)), n("li", {}, r);
		}));
		i(this.el, [
			n("div", { class: "suggestions-head" }, n("span", {
				class: "card-kicker",
				text: o
			}), n("span", {
				class: "suggestions-title",
				text: s
			})),
			m,
			h,
			c === "" ? null : n("p", {
				class: "card-note",
				text: c
			})
		]);
	}
}, $ = class extends p {
	constructor(e, t) {
		super(e, t), this.el = n("form", {
			class: "identity-form",
			novalidate: "true"
		}), this.#e();
	}
	patch() {
		this.#e();
	}
	#e() {
		let e = this.params, t = e.pipe("name_field", ["Nom", "Votre nom"]), r = e.pipe("email_field", ["Email", "vous@exemple.com"]), i = e.text("start_label", "DÉMARRER"), a = this.ctx.consent?.texte ?? e.text("consent_label", ""), o = this.ctx.consent?.lien ?? "", s = n("input", {
			class: "field-input",
			type: "text",
			name: "nom",
			placeholder: t[1] ?? "",
			"aria-label": t[0] ?? "Nom",
			required: "true"
		}), c = n("input", {
			class: "field-input",
			type: "email",
			name: "email",
			placeholder: r[1] ?? "",
			"aria-label": r[0] ?? "Email",
			required: "true"
		}), l = n("input", {
			type: "checkbox",
			name: "consentement"
		}), u = n("label", { class: "field-check" }, l);
		a !== "" && u.appendChild(document.createTextNode(` ${a}`)), o !== "" && u.appendChild(n("a", {
			class: "field-link",
			href: o,
			target: "_blank",
			rel: "noopener",
			text: "›"
		}));
		let d = n("button", {
			type: "submit",
			class: "btn btn-black btn-start",
			text: i
		});
		this.el.replaceChildren(n("div", { class: "field-row" }, n("label", { class: "field" }, n("span", {
			class: "field-label",
			text: t[0] ?? "Nom"
		}), s), n("label", { class: "field" }, n("span", {
			class: "field-label",
			text: r[0] ?? "Email"
		}), c)), a === "" ? null : u, d), this.el.addEventListener("submit", (e) => {
			e.preventDefault();
			let t = s.value.trim(), n = c.value.trim();
			t !== "" && n !== "" && this.ctx.actions?.submitIdentity?.({
				nom: t,
				email: n,
				consentement: l.checked
			});
		});
	}
}, ue = class extends p {
	constructor(e, t) {
		super(e, t), this.identity = new $(e, t), this.el = n("section", { class: "chat-welcome" }), this.#e();
	}
	patch() {
		this.identity.update(this.ctx), this.#e();
	}
	#e() {
		let e = this.params;
		E(this.ctx).identity ? i(this.el, [
			n("span", {
				class: "card-kicker",
				text: e.text("identity_kicker", "● (IDENTITÉ)")
			}),
			n("h2", {
				class: "welcome-title",
				text: e.text("identity_title", "Commençons")
			}),
			n("p", {
				class: "welcome-text",
				text: e.text("identity_text", "Deux informations suffisent pour ouvrir la discussion.")
			}),
			this.identity.el
		]) : i(this.el, [
			n("span", {
				class: "card-kicker",
				text: e.text("info_kicker", "● (À PROPOS)")
			}),
			n("h2", {
				class: "welcome-title",
				text: e.text("bot_name", "Assistant")
			}),
			n("span", {
				class: "welcome-role",
				text: e.text("bot_role", "")
			}),
			n("p", {
				class: "welcome-text",
				text: e.text("welcome_message", "")
			})
		]);
	}
}, de = class extends p {
	constructor(e, t, r = {}) {
		super(e, t), this.showHeader = r.header !== !1, this.showFooter = r.footer !== !1, this.welcome = new ue(e, t), this.details = new re(e, t), this.suggestions = new le(e, t), this.suggestions.setEnabled(!E(e).identity), this.messages = new ce(e, t), this.composer = new j(e, t), this.cardFooter = new te(e, t), this.head = n("header", { class: "chat-head" }), this.pill = null, this.toggle = null, this.el = n("article", { class: "atelier-card atelier-card--chat" }, [
			this.showHeader ? this.head : null,
			this.messages.el,
			this.details.el,
			this.suggestions.el,
			this.composer.el,
			this.showFooter ? this.cardFooter.el : null
		]), this.#e(), this.#t(), this.#n();
	}
	patch() {
		this.welcome.update(this.ctx), this.details.update(this.ctx), this.suggestions.setEnabled(!E(this.ctx).identity), this.messages.update(this.ctx), this.composer.update(this.ctx), this.cardFooter.update(this.ctx), this.#t();
	}
	afterMount() {
		this.messages?.afterMount?.();
	}
	#e() {
		if (!this.showHeader) return;
		let e = this.params, t = e.text("bot_name", "Assistant"), r = e.text("bot_role", ""), i = new A(this.ctx, this.store, {
			url: e.text("bot_avatar_image", ""),
			label: t,
			size: 36,
			tone: "bot"
		});
		this.pill = n("span", {
			class: "pill pill-phase",
			text: e.text("phase_label", "CONVERSATION")
		}), this.toggle = n("button", {
			type: "button",
			class: "chat-more",
			"aria-expanded": "false",
			"aria-label": e.text("details_label", "Détails de l'assistant"),
			text: "[+]"
		}), this.toggle.addEventListener("click", () => {
			this.store.detailsOpen = this.store.detailsOpen !== !0, this.details.update(this.ctx), this.#t();
		}), this.head.replaceChildren(i.el, n("div", { class: "chat-id" }, n("strong", { text: t }), r === "" ? null : n("span", {
			class: "chat-role",
			text: r
		})), this.pill, this.toggle);
	}
	#t() {
		let e = this.params, t = e.text("bot_name", "Assistant"), r = this.ctx.state?.status === "finalisee", i = this.ctx.state?.typing === !0, a = this.store.detailsOpen === !0;
		this.pill !== null && this.pill.classList.toggle("is-done", r), this.toggle !== null && (this.toggle.textContent = a ? "[−]" : "[+]", this.toggle.setAttribute("aria-expanded", a ? "true" : "false"));
		let o = this.el.querySelector(".atelier-typing");
		if (i) {
			let r = o ?? n("p", {
				class: "atelier-typing",
				"aria-live": "polite"
			}, n("span", {
				class: "typing-dots",
				"aria-hidden": "true"
			}), n("span", { class: "typing-text" })), i = r.querySelector(".typing-text");
			i !== null && (i.textContent = `${t} ${e.text("typing_text", "est en train d’écrire…")}`), o === null && this.details.el.before(r);
		} else o !== null && o.remove();
		this.#i(), this.#r();
	}
	#n() {
		let e = this.el, t = this.messages.el, n = t.querySelector(".atelier-log") ?? t, r = () => e.clientWidth < 640, i = () => {
			let e = r();
			if (this.showHeader && (this.head.hidden = e), this.details?.el && (this.details.el.hidden = e || !this.store.detailsOpen), this.suggestions?.el) {
				let e = Array.isArray(this.ctx.state?.messages) && this.ctx.state.messages.length > 0;
				this.suggestions.el.hidden = e;
			}
			this.showFooter && this.cardFooter?.el && (this.cardFooter.el.hidden = e);
		}, a = () => {
			let e = this.suggestions?.el;
			e != null && (e.style.position = "", e.style.bottom = "", e.style.left = "", e.style.right = "", e.style.zIndex = "", e.style.background = "", e.style.borderTop = "", n && (n.style.paddingBottom = ""));
		}, o = () => {
			i();
			let n = e.clientHeight;
			if (n <= 0) return;
			let r = 0;
			this.showHeader && this.head.offsetParent !== null && !this.head.hidden && (r += this.head.offsetHeight);
			let o = this.details?.el;
			o !== null && o.offsetParent !== null && !o.hidden && (r += o.offsetHeight);
			let s = this.suggestions?.el;
			s !== null && s.offsetParent !== null && s.hidden;
			let c = this.composer?.el;
			if (c !== null && c.offsetParent !== null && !c.hidden && (r += c.offsetHeight), this.showFooter) {
				let e = this.cardFooter?.el;
				e !== null && e.offsetParent !== null && !e.hidden && (r += e.offsetHeight);
			}
			let l = Math.max(120, n - r);
			t.style.height = `${l}px`, t.style.flex = "none", requestAnimationFrame(() => a());
		};
		this._measure = o, typeof ResizeObserver < "u" && (this._ro = new ResizeObserver(() => o()), this._ro.observe(e)), requestAnimationFrame(() => o()), window.addEventListener("resize", o);
	}
	#r() {
		typeof this._measure == "function" && requestAnimationFrame(() => this._measure());
	}
	#i() {
		let e = (Array.isArray(this.ctx.state?.messages) ? this.ctx.state.messages : []).length === 0, t = e || E(this.ctx).identity;
		this.messages.el.classList.toggle("is-empty", e), this.messages.setLeading(t ? this.welcome.el : null);
	}
}, fe = class extends p {
	constructor(e, t) {
		super(e, t), this.header = new C(e, t), this.chat = new de(e, t);
		let r = n("main", { class: "atelier-stage" }, this.chat.el);
		this.el = n("div", { class: "atelier atelier--page" }, [this.header.el, r]);
		let i = m(e, this.params);
		this.el.style.setProperty("--accent", i), this.el.style.setProperty("--on-accent", S(i));
	}
	patch() {
		let e = m(this.ctx, this.params);
		this.el.style.setProperty("--accent", e), this.el.style.setProperty("--on-accent", S(e)), this.header.update(this.ctx), this.chat.update(this.ctx);
	}
	afterMount() {
		this.chat.afterMount();
	}
};
// src/index.js
a(o, (e) => new fe(e, s), { css: c });
