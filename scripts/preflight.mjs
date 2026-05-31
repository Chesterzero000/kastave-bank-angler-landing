import { spawn } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();
const nodeBin = process.execPath;
const ignoredDirs = new Set([".git", "dist", "node_modules"]);
const ignoredFiles = new Set(["package-lock.json"]);
const textFilePattern = /\.(css|env|example|html|js|jsx|json|md|mjs|sql|toml|txt|yaml|yml)$/i;

const secretPatterns = [
  { name: "Stripe live secret key", pattern: /sk_live_[A-Za-z0-9]{16,}/ },
  { name: "Stripe live restricted key", pattern: /rk_live_[A-Za-z0-9]{16,}/ },
  { name: "Stripe live webhook secret", pattern: /whsec_(?!test|route|your)[A-Za-z0-9]{20,}/ },
  { name: "GitHub token", pattern: /(ghp|gho|ghu|ghs|ghr|github_pat)_[A-Za-z0-9_]{20,}/ },
  { name: "AWS access key", pattern: /AKIA[0-9A-Z]{16}/ },
  { name: "Slack token", pattern: /xox[baprs]-[A-Za-z0-9-]{20,}/ },
  { name: "Private key block", pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |)?PRIVATE KEY-----/ },
  { name: "Committed PayPal client secret", pattern: /^PAYPAL_CLIENT_SECRET=(?!$|your-)[^\s]+/m },
  { name: "Committed Supabase service role key", pattern: /^SUPABASE_SERVICE_ROLE_KEY=(?!$|your-)[^\s]+/m },
];

async function main() {
  console.log("Kastave preflight starting...");
  console.log(`Node: ${nodeBin}`);

  await runTests();
  await run("Project structure check", [nodeBin, "scripts/check-project-structure.mjs"]);
  await run("Asset reference check", [nodeBin, "scripts/check-assets.mjs"]);
  await run("Deploy target check", [nodeBin, "scripts/check-deploy-target.mjs"]);
  await run("React render smoke", [nodeBin, "scripts/render-smoke.mjs"]);
  await runBuild();
  await verifySpaFallback();
  await run("Production preview smoke", [nodeBin, "scripts/preview-smoke.mjs"]);
  await scanSecrets();

  console.log("Kastave preflight passed.");
}

async function runTests() {
  const testFiles = (await listFiles(root))
    .filter((file) => file.endsWith(".test.js"))
    .filter(
      (file) =>
        file.includes(`${join(root, "src")}/`) ||
        file.includes(`${join(root, "api")}/`) ||
        file.includes(`${join(root, "scripts")}/`),
    )
    .sort();

  if (testFiles.length === 0) {
    throw new Error("No test files found under src/ or api/.");
  }

  await run("Tests", [nodeBin, "--test", ...testFiles.map((file) => relative(root, file))]);
}

async function runBuild() {
  await run("Vite build", [nodeBin, "node_modules/vite/bin/vite.js", "build"]);
  await run("SPA fallback", [nodeBin, "scripts/create-spa-fallback.mjs"]);
}

async function verifySpaFallback() {
  const index = await readFile(join(root, "dist/index.html"));
  const fallback = await readFile(join(root, "dist/404.html"));

  if (!index.equals(fallback)) {
    throw new Error("dist/404.html does not match dist/index.html.");
  }

  console.log("SPA fallback verified.");
}

async function scanSecrets() {
  const files = (await listFiles(root))
    .filter((file) => shouldScanTextFile(file))
    .sort();
  const findings = [];

  for (const file of files) {
    const text = await readFile(file, "utf8");
    secretPatterns.forEach(({ name, pattern }) => {
      if (pattern.test(text)) {
        findings.push(`${relative(root, file)}: ${name}`);
      }
    });
  }

  if (findings.length > 0) {
    throw new Error(`Potential committed secret(s):\n${findings.join("\n")}`);
  }

  console.log("Secret scan verified.");
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        files.push(...(await listFiles(path)));
      }
      continue;
    }

    if (entry.isFile()) {
      files.push(path);
    }
  }

  return files;
}

function shouldScanTextFile(file) {
  const name = file.split("/").pop();
  return !ignoredFiles.has(name) && textFilePattern.test(name);
}

function run(label, command) {
  return new Promise((resolve, reject) => {
    console.log(`\n> ${label}`);
    const child = spawn(command[0], command.slice(1), {
      cwd: root,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${label} failed with exit code ${code}.`));
    });
  });
}

await main();
