import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const root = process.cwd();
const baseUrl = "http://127.0.0.1:4173";
const knownInternalRoutes = new Set([
  "/",
  "/deposit",
  "/thanks",
  "/privacy",
  "/terms",
  "/policies/privacy-policy",
  "/policies/terms-of-service",
]);
const allowedExternalHosts = new Set(["buy.stripe.com", "facebook.com", "paypal.com", "www.facebook.com", "www.paypal.com"]);
const requiredHomeAnchorTargets = [
  "cast-options",
  "audience",
  "app-ui",
  "specs",
  "faq",
];

const pageChecks = [
  {
    path: "/",
    mustInclude: [
      "meet",
      "Kastave",
      "Get the Highlights",
      "Who is Kastave For",
      "Auto mode first. Quiet or fast when you need it.",
      "Your Privacy Comes First",
      "Built tough. Bank ready.",
      "6 hours",
      "20 m radius",
      "Wi-Fi 6",
      "Bluetooth 5.4",
      "Reserve for $1",
      "Package includes",
      "Kastave Scout boat",
      "Kastave app + founder software membership",
      "Sign up",
      "For bank anglers who read before they cast.",
    ],
    mustExclude: [
      "Core Capabilities",
      "Built to scan, model, and choose the first 3 casts.",
      "Workflow comparison",
      "How it works",
      "From unknown bank water to a first-cast plan.",
      "Scan mode, cast calls, and private spots in one fishing screen.",
      "Bank angler problem",
      "Stop guessing where to start.",
      "Reddit proof",
    ],
    check: (html) => {
      const hrefs = extractHrefs(html);
      const externalPaymentHref = hrefs.find((href) => isPaymentUrl(href));

      if (externalPaymentHref) {
        throw new Error(`Homepage CTA should route to /deposit before payment, but found payment href: ${externalPaymentHref}`);
      }

      if (!hrefs.some((href) => new URL(href, baseUrl).pathname === "/deposit")) {
        throw new Error("Homepage does not include a /deposit CTA href.");
      }

      verifyRequiredHomeAnchors(html, hrefs);
    },
  },
  {
    path: "/deposit",
    mustInclude: [
      "$1",
      "Deposit Now,",
      "$100",
      "Credit Later",
      "Credit Card",
      "PayPal",
      "not the full product",
      "No long checkout form on this page.",
    ],
    mustExclude: ["Card number", "Billing address", "Expires", "CSC"],
  },
  {
    path: "/thanks?provider=stripe",
    mustInclude: ["What happens after payment?", "Stripe or PayPal sends your payment receipt.", "Join Early Access"],
    mustExclude: ["Card number", "Billing address"],
  },
  {
    path: "/privacy",
    mustInclude: ["Privacy Policy", "Meta Pixel", "Stripe and PayPal"],
  },
  {
    path: "/terms",
    mustInclude: ["Terms of Service", "founder reservation is not a finished-product purchase"],
  },
  {
    path: "/not-a-real-route",
    mustInclude: ["Kastave", "Get the Highlights", "Who is Kastave For"],
    mustExclude: ["Not Found", "Core Capabilities", "Workflow comparison", "How it works", "Bank angler problem"],
  },
];

const vite = await createServer({
  root,
  appType: "custom",
  logLevel: "error",
  server: {
    middlewareMode: true,
  },
});

try {
  const [{ default: App }, content] = await Promise.all([
    vite.ssrLoadModule("/src/App.jsx"),
    vite.ssrLoadModule("/src/content.js"),
  ]);

  verifyPaymentMethods(content.PAYMENT_METHODS);

  pageChecks.forEach(({ path, mustInclude = [], mustExclude = [], check }) => {
    installBrowserGlobals(`${baseUrl}${path}`);
    const html = renderToStaticMarkup(React.createElement(App));

    mustInclude.forEach((text) => {
      if (!html.includes(text)) {
        throw new Error(`Rendered ${path} is missing expected text: ${text}`);
      }
    });

    mustExclude.forEach((text) => {
      if (html.includes(text)) {
        throw new Error(`Rendered ${path} contains removed or unwanted text: ${text}`);
      }
    });

    check?.(html);
    verifyRenderedLinks(path, html);
  });

  console.log("React render smoke verified.");
} finally {
  await vite.close();
}

function verifyPaymentMethods(paymentMethods) {
  const providerKeys = paymentMethods.map((method) => method.key);

  if (providerKeys.join(",") !== "stripe,paypal") {
    throw new Error(`Expected Stripe and PayPal payment methods, got: ${providerKeys.join(",") || "none"}`);
  }

  paymentMethods.forEach((method) => {
    if (!method.paymentLink || !isPaymentUrl(method.paymentLink)) {
      throw new Error(`Payment method ${method.key} is missing a valid payment link.`);
    }
  });
}

function installBrowserGlobals(url) {
  const storage = new Map();
  const location = new URL(url);

  globalThis.window = {
    location,
    addEventListener() {},
    removeEventListener() {},
    dataLayer: [],
  };
  globalThis.document = {
    addEventListener() {},
    createElement: () => ({
      setAttribute() {},
    }),
    getElementById: () => null,
    head: {
      appendChild() {},
    },
    querySelector: () => null,
  };
  globalThis.localStorage = createStorage(storage);
  globalThis.sessionStorage = createStorage(new Map());
}

function createStorage(storage) {
  return {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    removeItem(key) {
      storage.delete(key);
    },
    clear() {
      storage.clear();
    },
  };
}

function extractHrefs(html) {
  return [...html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)].map((match) => match[1]);
}

function extractIds(html) {
  return new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
}

function verifyRequiredHomeAnchors(html, hrefs) {
  const ids = extractIds(html);

  requiredHomeAnchorTargets.forEach((target) => {
    if (!ids.has(target)) {
      throw new Error(`Homepage is missing required section id: ${target}`);
    }

    if (!hrefs.includes(`#${target}`)) {
      throw new Error(`Homepage is missing required anchor href: #${target}`);
    }
  });
}

function verifyRenderedLinks(path, html) {
  const ids = extractIds(html);
  const hrefs = extractHrefs(html);
  const base = new URL(path, baseUrl);

  hrefs.forEach((href) => {
    if (href.startsWith("mailto:")) {
      return;
    }

    if (href.startsWith("#")) {
      if (!ids.has(href.slice(1))) {
        throw new Error(`Rendered ${path} links to missing anchor: ${href}`);
      }
      return;
    }

    const url = new URL(href, base);

    if (url.origin !== baseUrl) {
      if (!allowedExternalHosts.has(url.hostname)) {
        throw new Error(`Rendered ${path} contains an unexpected external link: ${href}`);
      }
      return;
    }

    if (!knownInternalRoutes.has(url.pathname)) {
      throw new Error(`Rendered ${path} contains an unsupported internal route: ${href}`);
    }

    if (url.hash && !ids.has(url.hash.slice(1))) {
      throw new Error(`Rendered ${path} links to missing anchor: ${href}`);
    }
  });
}

function isPaymentUrl(value) {
  try {
    const url = new URL(value, baseUrl);
    return url.hostname === "buy.stripe.com" || url.hostname === "paypal.com" || url.hostname === "www.paypal.com";
  } catch {
    return false;
  }
}
