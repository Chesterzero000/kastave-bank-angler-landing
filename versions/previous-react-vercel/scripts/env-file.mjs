import { access, readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";

export const defaultProductionEnvFile = ".env.production.local";

export async function loadProductionEnv(args = process.argv.slice(2), options = {}) {
  const root = options.root || process.cwd();
  const explicitEnvFile = getEnvFileArg(args) || process.env.KASTAVE_ENV_FILE;
  const envFile = explicitEnvFile || options.defaultFile || defaultProductionEnvFile;
  const envPath = isAbsolute(envFile) ? envFile : resolve(root, envFile);
  const exists = await fileExists(envPath);

  if (explicitEnvFile && !exists) {
    throw new Error(`Requested env file does not exist: ${envPath}`);
  }

  const loadedEnv = exists ? parseEnv(await readFile(envPath, "utf8")) : {};

  return {
    env: {
      ...loadedEnv,
      ...process.env,
    },
    loadedPath: Object.keys(loadedEnv).length > 0 ? envPath : null,
    requestedPath: envPath,
  };
}

export async function readEnvFile(path) {
  return parseEnv(await readFile(path, "utf8"));
}

function getEnvFileArg(args) {
  const kastaveInline = args.find((arg) => arg.startsWith("--kastave-env-file="));
  if (kastaveInline) {
    return kastaveInline.slice("--kastave-env-file=".length);
  }

  const kastaveIndex = args.indexOf("--kastave-env-file");
  if (kastaveIndex !== -1) {
    return args[kastaveIndex + 1];
  }

  const inline = args.find((arg) => arg.startsWith("--env-file="));
  if (inline) {
    return inline.slice("--env-file=".length);
  }

  const index = args.indexOf("--env-file");
  if (index !== -1) {
    return args[index + 1];
  }

  return null;
}

function parseEnv(text) {
  const entries = {};

  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const match = trimmed.match(/^(?:export\s+)?([A-Z0-9_]+)=(.*)$/i);
    if (!match) {
      return;
    }

    entries[match[1]] = cleanValue(match[2]);
  });

  return entries;
}

function cleanValue(value) {
  const trimmed = value.trim();
  const quote = trimmed[0];

  if ((quote === `"` || quote === "'") && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1).replace(/\\n/g, "\n");
  }

  return trimmed.replace(/\s+#.*$/, "").trim();
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
