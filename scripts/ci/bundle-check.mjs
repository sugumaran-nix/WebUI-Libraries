import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { join } from "node:path";
const assetsDir = new URL("../../dist/assets/", import.meta.url);
const entries = await readdir(assetsDir, { withFileTypes: true });
const jsFiles = entries.filter(entry => entry.isFile() && entry.name.endsWith(".js"));
if (jsFiles.length === 0) throw new Error("Bundle check failed: no JavaScript asset was emitted.");

const files = [];
for (const entry of jsFiles) {
  const path = join(assetsDir.pathname, entry.name);
  const source = await stat(path);
  const body = await readFile(path);
  const compressed = gzipSync(body, { level: 9 });
  files.push({ file: entry.name, rawBytes: source.size, gzipBytes: compressed.length });
}

const totals = files.reduce((sum, file) => ({ rawBytes: sum.rawBytes + file.rawBytes, gzipBytes: sum.gzipBytes + file.gzipBytes }), { rawBytes: 0, gzipBytes: 0 });
const budget = { rawBytes: Number(process.env.BUNDLE_RAW_BUDGET || 320000), gzipBytes: Number(process.env.BUNDLE_GZIP_BUDGET || 85000) };
const passed = totals.rawBytes <= budget.rawBytes && totals.gzipBytes <= budget.gzipBytes;
const report = { files, totals, budget, passed };
await writeFile("bundle-report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!passed) {
  console.error(`Bundle budget exceeded: raw ${totals.rawBytes}/${budget.rawBytes}, gzip ${totals.gzipBytes}/${budget.gzipBytes}.`);
  process.exitCode = 1;
}
