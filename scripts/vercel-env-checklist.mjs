import { requiredEnv, recommendedEnv, validateProductionEnv } from "./checkProductionEnvCore.mjs";
import { loadProductionEnv } from "./env-file.mjs";

const webhookEndpoints = [
  ["Stripe webhook", "https://kastave.com/api/stripe-webhook"],
  ["PayPal webhook", "https://kastave.com/api/paypal-webhook"],
];
const returnUrls = [
  ["Stripe completion redirect", "https://kastave.com/thanks?provider=stripe"],
  ["PayPal return URL", "https://kastave.com/thanks?provider=paypal"],
];

try {
  const { env, loadedPath } = await loadProductionEnv();
  const { failures, warnings } = validateProductionEnv(env);

  console.log("Kastave local production env mirror checklist");
  console.log("Scope: local shell values plus .env.production.local only; this does not read the Vercel dashboard.");
  if (loadedPath) {
    console.log(`Loaded local env file: ${loadedPath}`);
  }
  console.log("Use this to mirror and sanity-check the values that should already exist in Vercel.");
  console.log("");

  printEntries("Required production variables", requiredEnv, env, failures);
  printEntries("Recommended production variables", recommendedEnv, env, warnings);
  printLinks("Webhook endpoints to configure", webhookEndpoints);
  printLinks("Payment return URLs to configure", returnUrls);

  console.log("Final gates:");
  console.log("- node scripts/deploy-ready.mjs");
  console.log("- node scripts/check-release-state.mjs");

  if (failures.length > 0) {
    console.error("\nLocal production env mirror is incomplete.");
    console.error("This does not prove the Vercel dashboard is missing these variables.");
    process.exit(1);
  }
} catch (error) {
  console.error(`Kastave local production env mirror checklist failed: ${error.message}`);
  process.exit(1);
}

function printEntries(title, entries, env, issues) {
  console.log(title);

  entries.forEach((entry) => {
    const issue = issues.find((message) => message.startsWith(`${entry.name} `) || message.startsWith(`${entry.name}:`));
    const configured = Boolean(env[entry.name]?.trim());
    const marker = issue ? "!" : configured ? "x" : " ";
    const status = issue ? issue.replace(`${entry.name} `, "").replace(`${entry.name}: `, "") : configured ? "configured" : "missing";
    console.log(`- [${marker}] ${entry.name}: ${status}`);
  });

  console.log("");
}

function printLinks(title, links) {
  console.log(title);
  links.forEach(([label, url]) => console.log(`- ${label}: ${url}`));
  console.log("");
}
