#!/usr/bin/env node
/** Removes the "Made in Webflow" floating badge and "Powered by Webflow" links. */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PUB = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

// 1. Hide the JS-injected floating badge via the shared stylesheet.
const css = join(
  PUB,
  "klaas/wf/633daa121f1308def083b05d/css/klaas-dentist-template.webflow.shared.6f6703004.min.css"
);
let cssText = readFileSync(css, "utf8");
if (!cssText.includes(".w-webflow-badge{display:none")) {
  cssText += "\n.w-webflow-badge{display:none!important;}\n";
  writeFileSync(css, cssText, "utf8");
  console.log("CSS: badge hidden.");
}

// 2. Strip the "Powered by Webflow" footer link from every page.
function walk(d) {
  const out = [];
  for (const n of readdirSync(d)) {
    if (n === "klaas") continue;
    const p = join(d, n);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (n.endsWith(".html")) out.push(p);
  }
  return out;
}

const linkRe = /<a[^>]*>\s*Powered by Webflow\s*<\/a>/gi;
let changed = 0;
for (const file of walk(PUB)) {
  let html = readFileSync(file, "utf8");
  const before = html;
  html = html.replace(linkRe, "");
  if (html !== before) {
    writeFileSync(file, html, "utf8");
    changed++;
  }
}
console.log(`Removed "Powered by Webflow" link from ${changed} pages.`);
