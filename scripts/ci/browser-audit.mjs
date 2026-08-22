import { chromium } from "playwright";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4317";
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--no-sandbox", "--disable-gpu"] });
const states = [];
const routes = ["/", "/directory"];
const themes = ["light", "dark"];
const viewports = [{ name: "mobile", width: 375, height: 812 }, { name: "desktop", width: 1440, height: 900 }];

for (const route of routes) for (const theme of themes) for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, colorScheme: theme });
  await context.addInitScript(themeName => { localStorage.clear(); localStorage.setItem("ui-folio-theme", themeName); }, theme);
  const page = await context.newPage();
  await page.route("https://image.thum.io/**", request => request.abort());
  const errors = [];
  page.on("console", message => { if (message.type() === "error" && !message.text().includes("ERR_FAILED")) errors.push(message.text()); });
  page.on("pageerror", error => errors.push(String(error)));
  const result = { route, theme, viewport: viewport.name, passed: false, checks: {}, errors };
  try {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(160);
    result.checks.routeLoaded = true;
    result.checks.theme = await page.locator(".app-shell").evaluate(el => el.className.includes("theme-dark") ? "dark" : "light");
    result.checks.oneMain = await page.locator("main").count() === 1;
    result.checks.oneH1 = await page.locator("h1").count() === 1;
    result.checks.noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
    if (route === "/directory") {
      const search = page.locator("#directory-search");
      await search.fill("react"); await page.waitForTimeout(120);
      result.checks.searchWorks = (await page.locator(".directory-results-head").innerText()).includes("resources ready");
      await search.fill("");
      await page.locator(".directory-filter-trigger").first().click();
      result.checks.filterOpens = await page.locator(".directory-filter-menu").count() === 1;
      await page.keyboard.press("Escape");
      const list = page.getByRole("button", { name: "List", exact: true });
      const grid = page.getByRole("button", { name: "Grid", exact: true });
      await list.click();
      result.checks.listWorks = await page.locator(".directory-card-grid.is-list").count() === 1;
      await grid.click();
      result.checks.gridWorks = await page.locator(".directory-card-grid:not(.is-list)").count() === 1;
    }
    result.passed = result.checks.routeLoaded && result.checks.theme === theme && result.checks.oneMain && result.checks.oneH1 && result.checks.noOverflow && errors.length === 0 && (route !== "/directory" || (result.checks.searchWorks && result.checks.filterOpens && result.checks.listWorks && result.checks.gridWorks));
  } catch (error) { result.error = String(error?.stack || error); }
  states.push(result);
  await context.close();
}
await browser.close();
const summary = { expectedStates: 8, completedStates: states.length, passedStates: states.filter(state => state.passed).length, failedStates: states.filter(state => !state.passed) };
console.log(JSON.stringify(summary, null, 2));
if (summary.completedStates !== summary.expectedStates || summary.passedStates !== summary.expectedStates) process.exitCode = 1;
