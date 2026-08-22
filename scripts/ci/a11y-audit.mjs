import { writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import axe from "axe-core";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4317";
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--no-sandbox", "--disable-gpu"] });
const results = [];

for (const route of ["/", "/directory"]) for (const theme of ["light", "dark"]) for (const viewport of [{ name: "mobile", width: 375, height: 812 }, { name: "desktop", width: 1440, height: 900 }]) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, colorScheme: theme });
  await context.addInitScript(themeName => { localStorage.clear(); localStorage.setItem("ui-folio-theme", themeName); }, theme);
  const page = await context.newPage();
  await page.route("https://image.thum.io/**", request => request.abort());
  await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(160);
  await page.addScriptTag({ content: axe.source });
  const report = await page.evaluate(() => axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "best-practice"] } }));
  results.push({ route, theme, viewport: viewport.name, violations: report.violations.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })) });
  await context.close();
}
await browser.close();
const summary = { expectedStates: 8, completedStates: results.length, passedStates: results.filter(item => item.violations.length === 0).length, totalViolations: results.reduce((sum, item) => sum + item.violations.length, 0), results };
await writeFile("a11y-report.json", JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (summary.passedStates !== summary.expectedStates) process.exitCode = 1;
