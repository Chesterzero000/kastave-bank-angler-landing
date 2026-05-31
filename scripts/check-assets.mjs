import { access, readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();

const sourceFiles = [
  "index.html",
  "src/App.jsx",
  "src/styles.css",
  "src/landingContent.test.js",
];

const requiredAssets = [
  "assets/kastave-app-sonar.jpg",
  "assets/kastave-audience-bank-angler.jpg",
  "assets/kastave-audience-castable-auto-scan-ui-v7.jpg",
  "assets/kastave-audience-hidden-snag-first-person-v4.jpg",
  "assets/kastave-audience-pond-hopper.jpg",
  "assets/kastave-deposit-hand-carry-product-match.jpg",
  "assets/kastave-feature-3d-terrain.jpg",
  "assets/kastave-feature-ai-strategy.jpg",
  "assets/kastave-feature-water-conditions.jpg",
  "assets/kastave-logo-wordmark.png",
  "assets/kastave-new-hero.jpg",
  "assets/kastave-new-process.jpg",
  "assets/kastave-new-recognition.jpg",
  "assets/kastave-product-detail.jpg",
  "public/favicon.svg",
  "public/kastave-hero.jpg",
];

const retiredAssets = [
  "assets/kastave-app-sonar.png",
  "assets/kastave-feature-3d-terrain.png",
  "assets/kastave-feature-ai-strategy.png",
  "assets/kastave-feature-fish-activity.png",
  "assets/kastave-feature-water-conditions.png",
  "assets/kastave-field-use.png",
  "assets/kastave-hero-system.png",
  "assets/kastave-hero.png",
  "assets/kastave-new-app.png",
  "assets/kastave-new-email.png",
  "assets/kastave-new-hero.png",
  "assets/kastave-new-process.png",
  "assets/kastave-new-recognition.png",
  "assets/kastave-new-value.png",
  "assets/kastave-product-detail.png",
  "assets/kastave-product-real.jpg",
  "assets/reddit-proof-pond-has-fish.png",
  "assets/reddit-proof-snag-frustration.png",
  "assets/reddit-proof-stocked-pond.png",
  "assets/reddit-proof-treble-weeds.png",
  "assets/kastave-social-ad.png",
  "public/CNAME",
  "public/kastave-hero.png",
  "public/kastave-product-real.jpg",
];

await verifyRequiredAssets();
await verifyReferencedAssets();
await verifyRetiredAssetsAbsent();

console.log("Asset references verified.");

async function verifyRequiredAssets() {
  const missing = [];

  for (const asset of requiredAssets) {
    if (!(await fileExists(join(root, asset)))) {
      missing.push(asset);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required asset(s):\n${missing.join("\n")}`);
  }
}

async function verifyReferencedAssets() {
  const missing = [];

  for (const sourceFile of sourceFiles) {
    const sourcePath = join(root, sourceFile);
    const text = await readFile(sourcePath, "utf8");
    const matches = [
      ...text.matchAll(/["'(](\.\.\/assets\/[^"')]+)["')]/g),
      ...text.matchAll(/["'](\/[^"']+\.(?:jpg|jpeg|png|svg|webp))["']/gi),
    ];

    for (const match of matches) {
      const reference = match[1];
      const resolved = resolveAssetReference(sourceFile, reference);

      if (resolved && !(await fileExists(join(root, resolved)))) {
        missing.push(`${sourceFile} -> ${reference} (${resolved})`);
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing referenced asset(s):\n${missing.join("\n")}`);
  }
}

async function verifyRetiredAssetsAbsent() {
  const present = [];
  const references = [];
  const sourceText = await readSourceText();

  for (const asset of retiredAssets) {
    if (await fileExists(join(root, asset))) {
      present.push(asset);
    }

    if (sourceText.includes(asset.split("/").pop())) {
      references.push(asset);
    }
  }

  if (present.length > 0 || references.length > 0) {
    const details = [];
    if (present.length > 0) {
      details.push(`Retired files still present:\n${present.join("\n")}`);
    }
    if (references.length > 0) {
      details.push(`Retired asset references still present:\n${references.join("\n")}`);
    }
    throw new Error(details.join("\n\n"));
  }
}

async function readSourceText() {
  const files = await listTextFiles(join(root, "src"));
  files.push(join(root, "index.html"));
  return (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
}

async function listTextFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listTextFiles(path)));
    } else if (entry.isFile() && /\.(css|html|js|jsx|mjs)$/i.test(entry.name)) {
      files.push(path);
    }
  }

  return files;
}

function resolveAssetReference(sourceFile, reference) {
  if (reference.startsWith("../assets/")) {
    return relative(root, join(root, "src", reference));
  }

  if (reference.startsWith("/")) {
    return `public${reference}`;
  }

  return null;
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
