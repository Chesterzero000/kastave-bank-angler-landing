import { access, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { requiredEnv, recommendedEnv } from "./checkProductionEnvCore.mjs";

const root = process.cwd();

const forbiddenFiles = [
  ".github/workflows/deploy-pages.yml",
  ".github/workflows/pages.yml",
  ".github/workflows/static.yml",
  "public/CNAME",
];

const requiredFiles = [
  "vercel.json",
  "api/stripe-webhook.js",
  "api/paypal-webhook.js",
  "scripts/create-spa-fallback.mjs",
  "scripts/check-production-env.mjs",
  "scripts/check-payment-links.mjs",
  "scripts/check-release-state.mjs",
  "scripts/vercel-env-checklist.mjs",
  "scripts/deploy-ready.mjs",
  ".env.example",
];

await verifyRequiredFiles();
await verifyForbiddenFilesAbsent();
await verifyNoGithubPagesWorkflow();
await verifyVercelRewrite();
await verifyWebhookRoutes();
await verifyPackageScripts();
await verifyEnvExample();

console.log("Deploy target verified.");

async function verifyRequiredFiles() {
  const missing = [];

  for (const file of requiredFiles) {
    if (!(await fileExists(join(root, file)))) {
      missing.push(file);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing deploy-critical file(s):\n${missing.join("\n")}`);
  }
}

async function verifyForbiddenFilesAbsent() {
  const present = [];

  for (const file of forbiddenFiles) {
    if (await fileExists(join(root, file))) {
      present.push(file);
    }
  }

  if (present.length > 0) {
    throw new Error(`Forbidden static/GitHub Pages file(s) still present:\n${present.join("\n")}`);
  }
}

async function verifyNoGithubPagesWorkflow() {
  const workflowsDir = join(root, ".github/workflows");
  if (!(await fileExists(workflowsDir))) {
    return;
  }

  const workflowFiles = await readdir(workflowsDir);
  const suspicious = [];

  for (const file of workflowFiles) {
    if (!/\.(ya?ml)$/i.test(file)) {
      continue;
    }

    const text = await readFile(join(workflowsDir, file), "utf8");
    if (/github-pages|pages-deploy|actions\/deploy-pages|peaceiris\/actions-gh-pages|gh-pages/i.test(text)) {
      suspicious.push(`.github/workflows/${file}`);
    }
  }

  if (suspicious.length > 0) {
    throw new Error(`GitHub Pages workflow(s) found, but this project should deploy on Vercel:\n${suspicious.join("\n")}`);
  }
}

async function verifyVercelRewrite() {
  const config = JSON.parse(await readFile(join(root, "vercel.json"), "utf8"));
  const rewrite = config.rewrites?.find(
    (entry) => entry.source === "/((?!api/).*)" && entry.destination === "/index.html",
  );

  if (!rewrite) {
    throw new Error("vercel.json must preserve SPA fallback without rewriting /api/* routes.");
  }
}

async function verifyWebhookRoutes() {
  const routes = [
    ["api/stripe-webhook.js", "handleStripeWebhook", "stripe-signature"],
    ["api/paypal-webhook.js", "handlePayPalWebhook", "request.json()"],
  ];

  for (const [file, handlerName, requiredText] of routes) {
    const text = await readFile(join(root, file), "utf8");
    const missing = [];

    if (!text.includes("async fetch(request)")) {
      missing.push("Vercel Web fetch handler");
    }
    if (!text.includes("request.method !== \"POST\"")) {
      missing.push("POST-only guard");
    }
    if (!text.includes(handlerName)) {
      missing.push(handlerName);
    }
    if (!text.includes(requiredText)) {
      missing.push(requiredText);
    }

    if (missing.length > 0) {
      throw new Error(`${file} is missing deploy-critical webhook behavior: ${missing.join(", ")}`);
    }
  }
}

async function verifyPackageScripts() {
  const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  const scripts = packageJson.scripts || {};
  const expectedScripts = {
    build: "scripts/create-spa-fallback.mjs",
    preflight: "scripts/preflight.mjs",
    "deploy:ready": "scripts/deploy-ready.mjs",
    "check:vercel-env": "scripts/vercel-env-checklist.mjs",
    "check:release-state": "scripts/check-release-state.mjs",
    "check:payment-links": "scripts/check-payment-links.mjs",
    "check:prod-env": "scripts/check-production-env.mjs",
  };

  const missing = Object.entries(expectedScripts)
    .filter(([name, text]) => !scripts[name]?.includes(text))
    .map(([name, text]) => `${name} must include ${text}`);

  if (missing.length > 0) {
    throw new Error(`package.json script issue(s):\n${missing.join("\n")}`);
  }
}

async function verifyEnvExample() {
  const envExample = await readFile(join(root, ".env.example"), "utf8");
  const envNames = [...requiredEnv, ...recommendedEnv].map((entry) => entry.name);
  const missing = envNames.filter((name) => !new RegExp(`^${name}=`, "m").test(envExample));

  if (missing.length > 0) {
    throw new Error(`.env.example is missing deploy env var(s):\n${missing.join("\n")}`);
  }

  const expectedLines = [
    "VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/9B69AVbpieTIcPx9rBd7q00",
    "VITE_PAYPAL_PAYMENT_LINK=https://www.paypal.com/ncp/payment/6W9PTBNB267ZW",
    "PAYPAL_ENV=live",
    "VITE_META_PIXEL_ID=1542765323857764",
    "VITE_PLAUSIBLE_DOMAIN=kastave.com",
  ];
  const mismatched = expectedLines.filter((line) => !envExample.includes(line));

  if (mismatched.length > 0) {
    throw new Error(`.env.example is missing expected production default(s):\n${mismatched.join("\n")}`);
  }
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
