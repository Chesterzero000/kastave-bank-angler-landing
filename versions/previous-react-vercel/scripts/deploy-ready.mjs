import { spawn } from "node:child_process";
import { loadProductionEnv } from "./env-file.mjs";

const root = process.cwd();
const nodeBin = process.execPath;
let env;
let loadedPath;

async function main() {
  ({ env, loadedPath } = await loadProductionEnv());

  console.log("Kastave deploy readiness check starting...");
  console.log(`Node: ${nodeBin}`);
  console.log("This gate runs local preflight first, then reports every production blocker it can verify.");
  if (loadedPath) {
    console.log(`Loaded production env file: ${loadedPath}`);
  }

  await run("Local preflight", [nodeBin, "scripts/preflight.mjs"]);
  const productionChecks = [];
  productionChecks.push(
    await run("Production environment check", [nodeBin, "scripts/check-production-env.mjs"], { continueOnFailure: true }),
  );
  productionChecks.push(
    await run("Payment link smoke check", [nodeBin, "scripts/check-payment-links.mjs"], { continueOnFailure: true }),
  );
  const failures = productionChecks.filter((result) => result.code !== 0);

  if (failures.length > 0) {
    console.error("\nKastave deploy readiness blockers:");
    failures.forEach((failure) => console.error(`- ${failure.label} failed with exit code ${failure.code}.`));
    throw new Error("production readiness gate failed.");
  }

  console.log("Kastave deploy readiness check passed.");
}

function run(label, command, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n> ${label}`);
    const child = spawn(command[0], command.slice(1), {
      cwd: root,
      env,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ code, label });
        return;
      }

      if (options.continueOnFailure) {
        resolve({ code, label });
        return;
      }

      reject(new Error(`${label} failed with exit code ${code}.`));
    });
  });
}

try {
  await main();
} catch (error) {
  console.error(`Kastave deploy readiness check failed: ${error.message}`);
  process.exit(1);
}
