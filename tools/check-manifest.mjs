// Contrôle du manifeste publié, aligné sur les règles du cœur CMS
// (src/domain/entities/visual-template.ts + src/domain/template-params.ts).
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("onirtech.template.json", "utf8"));
const ok = [];
const ko = [];
const check = (condition, label) => (condition ? ok : ko).push(label);

const KEBAB = /^[a-z][a-z0-9-]*$/;
const SNAKE = /^[a-z][a-z0-9_]{1,40}$/;
const SRI = /^sha256-[A-Za-z0-9+/]+={0,2}$/;
const HTTP = /^https?:\/\//;
const CAPABILITIES = [
  "messages",
  "media",
  "modelForm",
  "theme",
  "userState",
  "knowledge",
  "attachments",
  "fallback",
  "data",
];

check(manifest.schemaVersion === 1, "schemaVersion = 1");
check(manifest.kind === "template", 'kind = "template"');
check(KEBAB.test(manifest.id), "id kebab-case");
check(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z-.]+)?$/.test(manifest.version), "version SemVer");
check(["official", "verified", "community"].includes(manifest.publisher.trustLevel), "trustLevel connu");
check(
  manifest.compatibility.hostProtocol === "onirtech.template-host.v1",
  "hostProtocol onirtech.template-host.v1",
);
check(manifest.ui.mode === "web-component", "ui.mode web-component");
check(
  !manifest.ui.entry.startsWith("/") && !manifest.ui.entry.includes("\\") && !manifest.ui.entry.includes(".."),
  "ui.entry chemin relatif sûr",
);
check(KEBAB.test(manifest.ui.element), "ui.element kebab-case");
check(SRI.test(manifest.ui.integrity), "ui.integrity SRI valide");
check(["open", "closed", "none"].includes(manifest.ui.shadowDom), "shadowDom connu");
check(
  manifest.capabilities.every((capability) => CAPABILITIES.includes(capability)),
  "capabilities connues",
);
check(
  manifest.capabilities.includes("messages"),
  "capacité messages déclarée",
);
check(
  Array.isArray(manifest.network) && manifest.network.every((entry) => typeof entry === "string"),
  "network : liste de chaînes",
);

const widget = manifest.ui.widget;
check(widget !== undefined, "ui.widget déclaré (surface widget)");
if (widget !== undefined) {
  check(KEBAB.test(widget.element), "ui.widget.element kebab-case");
  check(SRI.test(widget.integrity), "ui.widget.integrity SRI valide");
  const display = widget.display;
  const inRange = (value, min, max) => value >= min && value <= max;
  check(
    inRange(display.closedSize.width, 24, 1200) && inRange(display.closedSize.height, 24, 2000),
    "closedSize dans les bornes",
  );
  check(
    inRange(display.openSize.width, 24, 1200) && inRange(display.openSize.height, 24, 2000),
    "openSize dans les bornes",
  );
  check(
    inRange(display.maxSize.width, 24, 1200) && inRange(display.maxSize.height, 24, 2000),
    "maxSize dans les bornes",
  );
  check(
    display.maxSize.width >= display.openSize.width &&
      display.maxSize.height >= display.openSize.height,
    "maxSize >= openSize",
  );
  check(
    display.openSize.width >= display.closedSize.width &&
      display.openSize.height >= display.closedSize.height,
    "openSize >= closedSize",
  );
  check(
    display.allowedPositions.includes(display.defaultPosition),
    "defaultPosition autorisée",
  );
}

const params = manifest.params;
const keys = params.map((param) => param.key);
check(params.length <= 40, `<= 40 variables (${params.length})`);
check(new Set(keys).size === keys.length, "clés uniques");
check(keys.every((key) => SNAKE.test(key)), "clés snake_case valides");
check(
  params.every((param) => typeof param.label === "string" && param.label.length > 0),
  "label obligatoire",
);
check(
  params.every((param) => Object.prototype.hasOwnProperty.call(param, "default")),
  "default obligatoire",
);
check(
  params.every((param) => !/(token|secret|password|api[_-]?key)/i.test(String(param.default))),
  "aucun secret dans les défauts",
);
check(
  params
    .filter((param) => param.type === "image")
    .every((param) => param.default === "" || HTTP.test(param.default)),
  "image : défaut vide ou URL http(s)",
);
check(
  params
    .filter((param) => param.type === "select")
    .every(
      (param) =>
        Array.isArray(param.options) &&
        param.options.length > 0 &&
        param.options.some((option) => option.value === param.default),
    ),
  "select : options et défaut valide",
);
check(
  params
    .filter((param) => param.type === "url")
    .every((param) => HTTP.test(param.default)),
  "url : défaut http(s)",
);
check(
  params
    .filter((param) => param.type === "color")
    .every((param) => /^#[0-9a-fA-F]{6}$/.test(param.default)),
  "color : défaut #rrggbb",
);

for (const label of ok) console.log(`  ✓ ${label}`);
for (const label of ko) console.log(`  ✗ ${label}`);
console.log(`\n${ok.length} contrôle(s) OK, ${ko.length} échec(s).`);
process.exit(ko.length === 0 ? 0 : 1);
