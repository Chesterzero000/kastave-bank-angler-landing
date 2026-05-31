import { spawn } from "node:child_process";
import { createServer } from "node:net";

const nodeBin = process.execPath;
const routes = [
  "/",
  "/deposit",
  "/thanks?provider=stripe",
  "/privacy",
  "/terms",
  "/policies/privacy-policy",
  "/policies/terms-of-service",
  "/not-a-real-route",
];

const htmlExpectations = [
  "Kastave | Scan Before You Cast",
  "<div id=\"root\">",
  "/assets/index-",
  "1542765323857764",
];

const port = await findAvailablePort(4173);
const preview = spawn(nodeBin, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
  cwd: process.cwd(),
  stdio: ["ignore", "pipe", "pipe"],
});

let output = "";
preview.stdout.on("data", (chunk) => {
  output += chunk.toString();
});
preview.stderr.on("data", (chunk) => {
  output += chunk.toString();
});

try {
  await waitForPreview(port);
  await verifyRoutes(port);
  console.log(`Production preview smoke verified on http://127.0.0.1:${port}/.`);
} finally {
  preview.kill("SIGTERM");
}

async function verifyRoutes(portNumber) {
  for (const route of routes) {
    const response = await fetch(`http://127.0.0.1:${portNumber}${route}`);
    const body = await response.text();

    if (!response.ok) {
      throw new Error(`Preview route ${route} returned ${response.status}.`);
    }

    if (!response.headers.get("content-type")?.includes("text/html")) {
      throw new Error(`Preview route ${route} did not return HTML.`);
    }

    htmlExpectations.forEach((text) => {
      if (!body.includes(text)) {
        throw new Error(`Preview route ${route} is missing expected text: ${text}`);
      }
    });
  }
}

async function waitForPreview(portNumber) {
  const deadline = Date.now() + 10_000;
  let lastError;

  while (Date.now() < deadline) {
    if (preview.exitCode !== null) {
      throw new Error(`Vite preview exited before becoming ready.\n${output}`);
    }

    try {
      const response = await fetch(`http://127.0.0.1:${portNumber}/`);
      if (response.ok) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await sleep(120);
  }

  throw new Error(`Timed out waiting for Vite preview. ${lastError?.message || ""}\n${output}`);
}

async function findAvailablePort(startPort) {
  for (let candidate = startPort; candidate < startPort + 20; candidate += 1) {
    if (await isPortAvailable(candidate)) {
      return candidate;
    }
  }

  throw new Error(`No available preview port found from ${startPort} to ${startPort + 19}.`);
}

function isPortAvailable(candidate) {
  return new Promise((resolve) => {
    const server = createServer();
    server.unref();
    server.once("error", () => resolve(false));
    server.listen(candidate, "127.0.0.1", () => {
      server.close(() => resolve(true));
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
