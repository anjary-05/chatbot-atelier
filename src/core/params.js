// Lecture typée des paramètres du template (ADR-0023).
//
// Convention de formatage des paramètres multi-valeurs :
//   • `text` multi-lignes  → une valeur par ligne        (`lines`)
//   • `text` séparée par « | » → une valeur par segment (`pipe`)
//   • bloc `clé=valeur`    → une entrée par ligne        (`map`)
//
// Aucun texte visible n'est écrit en dur dans les composants : tout passe par
// cette classe, avec un repli explicite pour chaque paramètre.
import { param } from "@onirtech/template-sdk";

export class Params {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /** Valeur brute, convertie en chaîne. */
  raw(key, fallback = "") {
    const value = param(this.ctx, key, fallback);
    if (value === null || value === undefined) return fallback;
    return typeof value === "string" ? value : String(value);
  }

  /** Chaîne, sans espaces de bord. */
  text(key, fallback = "") {
    return this.raw(key, fallback).trim();
  }

  /** Nombre (repli si la valeur n'est pas numérique). */
  number(key, fallback = 0) {
    const value = Number(this.raw(key, fallback));
    return Number.isFinite(value) ? value : fallback;
  }

  /** Booléen (« 1 », « true », « on »). */
  bool(key, fallback = false) {
    const value = this.raw(key, fallback === true ? "1" : "").trim().toLowerCase();
    if (value === "") return fallback;
    return value === "1" || value === "true" || value === "on" || value === "yes";
  }

  /** Lignes non vides. */
  lines(key, fallback = []) {
    const parts = this.raw(key, "")
      .split(/\r?\n/)
      .map((part) => part.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts : fallback;
  }

  /** Segments séparés par « | ». */
  pipe(key, fallback = []) {
    const parts = this.raw(key, "")
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts : fallback;
  }

  /** Bloc `clé=valeur` (une entrée par ligne). */
  map(key) {
    const out = {};
    for (const line of this.lines(key, [])) {
      const index = line.indexOf("=");
      if (index <= 0) continue;
      const name = line.slice(0, index).trim();
      if (name !== "") out[name] = line.slice(index + 1).trim();
    }
    return out;
  }

  /** Entrée d'un bloc `clé=valeur`, avec repli. */
  label(key, name, fallback = "") {
    const value = this.map(key)[name];
    return value === undefined || value === "" ? fallback : value;
  }

  /** Paires `titre|texte` (une par ligne). */
  pairs(key, fallback = []) {
    const pairs = this.lines(key, []).map((line) => {
      const index = line.indexOf("|");
      if (index < 0) return { label: line, value: "" };
      return { label: line.slice(0, index).trim(), value: line.slice(index + 1).trim() };
    });
    return pairs.length > 0 ? pairs : fallback;
  }

  /** Couleur hexadécimale (repli si le format est invalide). */
  color(key, fallback = "#111111") {
    const value = this.text(key, fallback);
    return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
  }
}
