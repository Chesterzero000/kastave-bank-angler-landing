import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { loadProductionEnv, readEnvFile } from "./env-file.mjs";

test("readEnvFile parses dotenv values, comments, exports, and quoted values", async () => {
  const directory = await mkdtemp(join(tmpdir(), "kastave-env-"));
  const path = join(directory, ".env.test");

  await writeFile(
    path,
    [
      "# comment",
      "VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/test # inline comment",
      "export PAYPAL_ENV=live",
      "PAYPAL_CLIENT_ID='client-id'",
      'VITE_META_PIXEL_ID="1542765323857764"',
    ].join("\n"),
  );

  try {
    assert.deepEqual(await readEnvFile(path), {
      VITE_STRIPE_PAYMENT_LINK: "https://buy.stripe.com/test",
      PAYPAL_ENV: "live",
      PAYPAL_CLIENT_ID: "client-id",
      VITE_META_PIXEL_ID: "1542765323857764",
    });
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});

test("loadProductionEnv reads .env.production.local and keeps shell env precedence", async () => {
  const directory = await mkdtemp(join(tmpdir(), "kastave-env-"));
  const path = join(directory, ".env.production.local");
  const original = process.env.KASTAVE_ENV_FILE_TEST_VALUE;

  await writeFile(path, "KASTAVE_ENV_FILE_TEST_VALUE=from-file\nPAYPAL_ENV=live\n");
  process.env.KASTAVE_ENV_FILE_TEST_VALUE = "from-shell";

  try {
    const { env, loadedPath } = await loadProductionEnv([], { root: directory });

    assert.equal(loadedPath, path);
    assert.equal(env.KASTAVE_ENV_FILE_TEST_VALUE, "from-shell");
    assert.equal(env.PAYPAL_ENV, "live");
  } finally {
    if (original === undefined) {
      delete process.env.KASTAVE_ENV_FILE_TEST_VALUE;
    } else {
      process.env.KASTAVE_ENV_FILE_TEST_VALUE = original;
    }
    await rm(directory, { force: true, recursive: true });
  }
});

test("loadProductionEnv fails when an explicit Kastave env file path is missing", async () => {
  const directory = await mkdtemp(join(tmpdir(), "kastave-env-"));

  try {
    await assert.rejects(
      loadProductionEnv(["--kastave-env-file", "missing.env"], { root: directory }),
      /Requested env file does not exist/,
    );
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});
