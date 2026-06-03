import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";

const exec = promisify(execFile);
const productionUrl = process.env.KASTAVE_PRODUCTION_URL || "https://kastave.com";
const remoteName = process.env.KASTAVE_RELEASE_REMOTE || "origin";
const remoteBranch = process.env.KASTAVE_RELEASE_BRANCH || "main";

try {
  console.log("Kastave release state check starting...");

  await verifyGitSync();
  await verifyProductionAssets();

  console.log("Kastave release state check passed.");
} catch (error) {
  console.error(`Kastave release state check failed: ${error.message}`);
  process.exit(1);
}

async function verifyGitSync() {
  await runGit(["fetch", "--quiet", remoteName, remoteBranch]);

  const localHead = await git(["rev-parse", "HEAD"]);
  const remoteHead = await git(["rev-parse", `${remoteName}/${remoteBranch}`]);
  const counts = await git(["rev-list", "--left-right", "--count", `HEAD...${remoteName}/${remoteBranch}`]);
  const [ahead, behind] = counts.split(/\s+/).map((value) => Number.parseInt(value, 10));

  if (ahead || behind) {
    throw new Error(
      `Git is not release-synced. Local HEAD ${short(localHead)} is ahead ${ahead} and behind ${behind} versus ${remoteName}/${remoteBranch} ${short(remoteHead)}.`,
    );
  }

  console.log(`Git release sync verified at ${short(localHead)}.`);
}

async function verifyProductionAssets() {
  const localHtml = await readFile("dist/index.html", "utf8").catch(() => {
    throw new Error("dist/index.html is missing. Run npm run build or npm run preflight before checking release state.");
  });
  const response = await fetch(productionUrl, {
    redirect: "follow",
    headers: {
      "cache-control": "no-cache",
      "user-agent": "Kastave-release-state-check/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`${productionUrl} returned HTTP ${response.status}.`);
  }

  const productionHtml = await response.text();
  const localAssets = extractViteAssets(localHtml);
  const productionAssets = extractViteAssets(productionHtml);
  const missing = localAssets.filter((asset) => !productionAssets.includes(asset));

  if (missing.length > 0) {
    throw new Error(
      `Production is not serving the current local build assets. Missing from ${productionUrl}: ${missing.join(", ")}`,
    );
  }

  console.log(`Production asset sync verified on ${productionUrl}.`);
}

function extractViteAssets(html) {
  return [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]).sort();
}

async function git(args) {
  const { stdout } = await runGit(args);
  return stdout.trim();
}

function runGit(args) {
  return exec("git", args, { cwd: process.cwd() });
}

function short(hash) {
  return hash.slice(0, 7);
}
