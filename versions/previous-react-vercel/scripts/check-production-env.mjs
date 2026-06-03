import { validateProductionEnv } from "./checkProductionEnvCore.mjs";
import { loadProductionEnv } from "./env-file.mjs";

try {
  const { env, loadedPath } = await loadProductionEnv();

  if (loadedPath) {
    console.log(`Loaded production env file: ${loadedPath}`);
  }

  const { failures, warnings } = validateProductionEnv(env);

  if (warnings.length > 0) {
    console.log("Recommended production env warnings:");
    warnings.forEach((warning) => console.log(`- ${warning}`));
    console.log("");
  }

  if (failures.length > 0) {
    console.error("Production environment check failed:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log("Production environment check passed.");
} catch (error) {
  console.error(`Production environment check failed: ${error.message}`);
  process.exit(1);
}
