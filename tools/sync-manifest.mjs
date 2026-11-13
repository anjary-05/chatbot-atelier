#!/usr/bin/env node
// Synchronise le manifeste après les deux builds.
//
// Le build « page » écrit `onirtech.template.json` (entrée + SRI). Le build
// « widget » produit `dist/widget.js` mais ne touche pas au manifeste : ce
// script y renseigne `ui.widget.integrity` (SRI du bundle widget), exigé par
// l'import CMS (ADR-0040) et par `onirtech-template validate`.
//
// Il reconstruit aussi le bloc `params` à partir de la source : le SDK publié
// ne connaît pas encore le type `image` (téléversement d'avatar) et le
// renvoie `null` dans le manifeste généré.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { PARAMS } from "../src/manifest.js";

const dir = process.cwd();
const manifestPath = join(dir, "onirtech.template.json");

const sri = (buffer) => `sha256-${createHash("sha256").update(buffer).digest("base64")}`;

/** Normalisation d'une variable, alignée sur celle du SDK (+ type `image`). */
function normalizeParam(param) {
  const base = {
    key: param.key,
    label: param.label,
    description: param.description ?? "",
    default: param.default,
  };
  switch (param.type) {
    case "string":
    case "text":
      return { ...base, type: param.type, ...(param.maxLength === undefined ? {} : { maxLength: param.maxLength }) };
    case "number":
      return {
        ...base,
        type: param.type,
        ...(param.min === undefined ? {} : { min: param.min }),
        ...(param.max === undefined ? {} : { max: param.max }),
      };
    case "boolean":
    case "color":
    case "url":
    case "image":
      return { ...base, type: param.type };
    case "select":
      return { ...base, type: param.type, options: [...param.options] };
    default:
      return { ...base, type: param.type };
  }
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const errors = [];

manifest.params = PARAMS.map(normalizeParam);

const entryPath = join(dir, manifest.ui.entry.replace(/^\.\//, ""));
const entryBuffer = await readFile(entryPath);
if (sri(entryBuffer) !== manifest.ui.integrity) {
  errors.push(`intégrité de l'entrée désynchronisée : ${manifest.ui.entry}`);
}

if (manifest.ui.widget !== undefined) {
  const widgetPath = join(dir, manifest.ui.widget.entry.replace(/^\.\//, ""));
  const widgetBuffer = await readFile(widgetPath);
  manifest.ui.widget.integrity = sri(widgetBuffer);
  const widgetSource = widgetBuffer.toString("utf8");
  if (!widgetSource.includes(manifest.ui.widget.element)) {
    errors.push(`le bundle widget n'enregistre pas l'élément ${manifest.ui.widget.element}`);
  }
} else {
  errors.push("ui.widget absent du manifeste");
}

if (errors.length > 0) {
  console.error(`✗ Manifeste :\n - ${errors.join("\n - ")}`);
  process.exit(1);
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`✓ Manifeste synchronisé (page + widget, ${manifest.params.length} variables).`);
