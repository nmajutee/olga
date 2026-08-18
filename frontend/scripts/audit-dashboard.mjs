#!/usr/bin/env node
/**
 * Visual and layout audit of every dashboard screen.
 *
 * Structural checks (does the route 200? does the class exist?) miss layout
 * failures entirely — a page can render perfectly valid HTML with every panel
 * collapsed to 100px. This drives a real browser and measures the result.
 *
 *   npx playwright install chromium      # once
 *   npm run dev                          # in another shell
 *   node scripts/audit-dashboard.mjs .audit-shots
 *
 * Screenshots land in the given directory; failures print with the reason.
 */

import { chromium } from "playwright";

const SHOTS = process.argv[2];
const COOKIE = { name: "olga_session", value: "devsessiondevsessiondevsession01", domain: "localhost", path: "/" };

const PAGES = [
  ["overview", "/admin"],
  ["articles", "/admin/posts"],
  ["article-editor", "/admin/posts/new"],
  ["collections", "/admin/collections"],
  ["collection-list", "/admin/collections/portfolio"],
  ["media", "/admin/media"],
  ["messages", "/admin/messages"],
  ["navigation", "/admin/navigation"],
  ["appearance", "/admin/appearance"],
  ["seo", "/admin/seo"],
  ["settings", "/admin/settings"],
  ["profile", "/admin/profile"],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await ctx.addCookies([COOKIE]);

const consoleErrors = [];
const report = [];

for (const [name, path] of PAGES) {
  const page = await ctx.newPage();
  const errs = [];
  const rawMsgs = [];
  page.on("console", (m) => { if (m.type() === "error") { errs.push(m.text().slice(0, 140)); rawMsgs.push(m); } });
  page.on("pageerror", (e) => errs.push("pageerror: " + String(e).slice(0, 140)));

  await page.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(400);

  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const out = {
      hOverflow: doc.scrollWidth - doc.clientWidth,
      narrow: [],
      overflowing: [],
      tinyText: new Set(),
      zeroSize: [],
    };

    for (const el of document.querySelectorAll(".admin-card, .admin-stat, .admin-field, .admin-btn, section, aside")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      // A panel or field narrower than 160px is almost certainly collapsed.
      if ((el.classList.contains("admin-card") || el.classList.contains("admin-field") || el.tagName === "SECTION") && r.width < 160) {
        out.narrow.push(`${el.tagName.toLowerCase()}.${[...el.classList].slice(0,2).join(".")} w=${Math.round(r.width)}`);
      }
      if (el.scrollWidth - el.clientWidth > 2) {
        out.overflowing.push(`${el.tagName.toLowerCase()}.${[...el.classList].slice(0,2).join(".")} +${el.scrollWidth - el.clientWidth}px`);
      }
    }

    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      const size = parseFloat(cs.fontSize);
      if (size && size < 11 && el.textContent?.trim()) out.tinyText.add(`${Math.round(size)}px`);
    }
    out.tinyText = [...out.tinyText];

    // Accessibility spot checks
    const imgsNoAlt = [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length;
    const inputsNoLabel = [...document.querySelectorAll("input:not([type=hidden]),textarea,select")].filter((i) => {
      if (i.getAttribute("aria-label") || i.getAttribute("aria-labelledby")) return false;
      if (i.id && document.querySelector(`label[for="${CSS.escape(i.id)}"]`)) return false;
      return !i.closest("label");
    }).length;
    const h1s = document.querySelectorAll("h1").length;

    return { ...out, imgsNoAlt, inputsNoLabel, h1s };
  });

  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true, caret: "initial" });

  // Resolve full console arguments before the page closes.
  const detailed = [];
  for (const m of rawMsgs) {
    const parts = [];
    for (const a of m.args()) {
      try { parts.push(String(await a.jsonValue())); } catch { parts.push("<obj>"); }
    }
    detailed.push(parts.join(" | "));
  }
  if (detailed.length && process.env.VERBOSE) {
    console.log("#".repeat(70) + "\n" + name + "\n" + detailed.join("\n"));
  }
  report.push({ name, path, errs, ...metrics });
  if (errs.length) consoleErrors.push([name, errs]);
  await page.close();
}

await browser.close();

let problems = 0;
for (const r of report) {
  const issues = [];
  if (r.hOverflow > 0) issues.push(`page scrolls horizontally +${r.hOverflow}px`);
  if (r.narrow.length) issues.push(`collapsed: ${r.narrow.slice(0, 3).join("; ")}`);
  if (r.overflowing.length) issues.push(`overflow: ${r.overflowing.slice(0, 3).join("; ")}`);
  if (r.tinyText.length) issues.push(`text under 11px: ${r.tinyText.join(",")}`);
  if (r.imgsNoAlt) issues.push(`${r.imgsNoAlt} img without alt`);
  if (r.inputsNoLabel) issues.push(`${r.inputsNoLabel} unlabelled input`);
  if (r.h1s !== 1) issues.push(`${r.h1s} h1 elements`);
  if (r.errs.length) issues.push(`console: ${r.errs[0]}`);

  console.log(`${issues.length ? "FAIL" : "ok  "}  ${r.name.padEnd(16)} ${issues.join(" | ") || ""}`);
  if (issues.length) problems++;
}
console.log(`\n${problems} of ${report.length} screens with issues`);
