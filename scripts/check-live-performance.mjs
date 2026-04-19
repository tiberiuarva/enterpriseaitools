import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const usage = `Usage: node scripts/check-live-performance.mjs <base-url> [route ...]\n\nExamples:\n  node scripts/check-live-performance.mjs https://www.enterpriseai.tools\n  node scripts/check-live-performance.mjs https://n8n-65532.westeurope.cloudapp.azure.com/enterpriseai-tools / /updates\n\nEnvironment overrides:\n  LIGHTHOUSE_MOBILE_MIN_SCORE   default 0.8\n  LIGHTHOUSE_DESKTOP_MIN_SCORE  default 0.9\n  LIGHTHOUSE_CHROME_PATH        default auto-detect`;

const [, , baseUrlArg, ...routeArgs] = process.argv;

if (!baseUrlArg) {
  console.error(usage);
  process.exit(1);
}

const baseUrl = new URL(baseUrlArg.endsWith("/") ? baseUrlArg : `${baseUrlArg}/`);
const routes = routeArgs.length ? routeArgs : ["/", "/platforms", "/agents"];
const mobileMinScore = Number(process.env.LIGHTHOUSE_MOBILE_MIN_SCORE || 0.8);
const desktopMinScore = Number(process.env.LIGHTHOUSE_DESKTOP_MIN_SCORE || 0.9);
const chromePath = process.env.LIGHTHOUSE_CHROME_PATH || "/usr/bin/google-chrome";

function normalizeRoute(route) {
  if (!route || route === "/") return "/";
  return `/${route.replace(/^\/+|\/+$/g, "")}`;
}

function metricValue(audits, id) {
  return audits?.[id]?.numericValue;
}

function formatMetric(id, value) {
  if (value == null || Number.isNaN(value)) return `${id}=n/a`;
  if (["largest-contentful-paint", "interactive", "speed-index", "total-blocking-time"].includes(id)) {
    return `${id}=${(value / 1000).toFixed(2)}s`;
  }
  if (id === "cumulative-layout-shift") {
    return `${id}=${value.toFixed(3)}`;
  }
  return `${id}=${value}`;
}

async function runLighthouse(url, preset) {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "enterpriseai-lh-"));
  const reportPath = path.join(tmpDir, `${preset}.json`);
  const args = [
    "lighthouse",
    url,
    "--quiet",
    "--output=json",
    `--output-path=${reportPath}`,
    `--chrome-path=${chromePath}`,
    "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
  ];

  if (preset === "desktop") {
    args.push("--preset=desktop");
  } else {
    args.push("--form-factor=mobile", "--screenEmulation.mobile=true");
  }

  try {
    await new Promise((resolve, reject) => {
      const child = spawn("npx", args, { stdio: ["ignore", "pipe", "pipe"] });
      let stderr = "";
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });
      child.on("error", reject);
      child.on("close", (code) => {
        if (code === 0) {
          resolve();
          return;
        }
        reject(new Error(stderr || `lighthouse exited with code ${code}`));
      });
    });

    const report = JSON.parse(await readFile(reportPath, "utf8"));
    const audits = report.audits || {};
    return {
      score: Number(report.categories?.performance?.score || 0),
      metrics: {
        lcp: metricValue(audits, "largest-contentful-paint"),
        tbt: metricValue(audits, "total-blocking-time"),
        cls: metricValue(audits, "cumulative-layout-shift"),
        si: metricValue(audits, "speed-index"),
        interactive: metricValue(audits, "interactive"),
      },
    };
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

const failures = [];

for (const route of routes.map(normalizeRoute)) {
  const url = new URL(route === "/" ? "./" : `.${route}/`, baseUrl).toString();
  console.log(`\n==> Lighthouse: ${url}`);

  const mobile = await runLighthouse(url, "mobile");
  const desktop = await runLighthouse(url, "desktop");

  console.log(
    `mobile  score=${mobile.score.toFixed(2)} ${[
      formatMetric("largest-contentful-paint", mobile.metrics.lcp),
      formatMetric("total-blocking-time", mobile.metrics.tbt),
      formatMetric("cumulative-layout-shift", mobile.metrics.cls),
    ].join(" ")}`,
  );
  console.log(
    `desktop score=${desktop.score.toFixed(2)} ${[
      formatMetric("largest-contentful-paint", desktop.metrics.lcp),
      formatMetric("total-blocking-time", desktop.metrics.tbt),
      formatMetric("cumulative-layout-shift", desktop.metrics.cls),
    ].join(" ")}`,
  );

  if (mobile.score < mobileMinScore) {
    failures.push(`${url} mobile performance score ${mobile.score.toFixed(2)} < ${mobileMinScore.toFixed(2)}`);
  }

  if (desktop.score < desktopMinScore) {
    failures.push(`${url} desktop performance score ${desktop.score.toFixed(2)} < ${desktopMinScore.toFixed(2)}`);
  }
}

if (failures.length) {
  console.error("\nLive performance checks failed:\n");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`\nLive performance checks passed for ${routes.length} route(s) against ${baseUrl.toString()}`);
