export const requiredEnv = [
  {
    name: "VITE_STRIPE_PAYMENT_LINK",
    reason: "Lets /deposit open the live Stripe card checkout.",
    validate: validateUrl("https:", "buy.stripe.com"),
  },
  {
    name: "VITE_PAYPAL_PAYMENT_LINK",
    reason: "Lets /deposit open the live PayPal checkout.",
    validate: validateUrl("https:", "www.paypal.com"),
  },
  {
    name: "VITE_META_PIXEL_ID",
    reason: "Keeps Meta Pixel consistent in production.",
    validate: (value) => (/^\d{8,24}$/.test(value) ? null : "expected numeric Meta Pixel ID"),
  },
  {
    name: "STRIPE_WEBHOOK_SECRET",
    reason: "Required for /api/stripe-webhook signature verification.",
    validate: (value) => (value.startsWith("whsec_") ? null : "expected Stripe webhook secret starting with whsec_"),
  },
  {
    name: "PAYPAL_CLIENT_ID",
    reason: "Required to verify PayPal webhook signatures.",
  },
  {
    name: "PAYPAL_CLIENT_SECRET",
    reason: "Required to verify PayPal webhook signatures.",
  },
  {
    name: "PAYPAL_WEBHOOK_ID",
    reason: "Required to verify PayPal webhook signatures.",
  },
  {
    name: "PAYPAL_ENV",
    reason: "Selects PayPal live or sandbox API.",
    validate: (value) => (["live", "sandbox"].includes(value.toLowerCase()) ? null : "expected live or sandbox"),
  },
  {
    name: "SUPABASE_URL",
    reason: "Required for webhook payment records.",
    validate: validateUrl("https:"),
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    reason: "Required for webhook payment records.",
  },
];

export const recommendedEnv = [
  {
    name: "VITE_SUPABASE_URL",
    reason: "Enables frontend landing events, waitlist signups, and reservation-intent analytics.",
    validate: validateUrl("https:"),
  },
  {
    name: "VITE_SUPABASE_ANON_KEY",
    reason: "Enables frontend landing events, waitlist signups, and reservation-intent analytics.",
  },
  {
    name: "VITE_PLAUSIBLE_DOMAIN",
    reason: "Keeps Plausible analytics domain explicit.",
  },
  {
    name: "VITE_BEEHIIV_FORM_URL",
    reason: "Lets non-hero email signup route to the newsletter provider if desired.",
    validate: validateUrl("https:"),
  },
  {
    name: "RESEND_API_KEY",
    reason: "Lets /api/lead-notification send founder email alerts for new waitlist signups.",
  },
  {
    name: "LEAD_NOTIFY_TO",
    reason: "Recipient email address for new waitlist signup notifications.",
    validate: validateEmail,
  },
  {
    name: "LEAD_NOTIFY_FROM",
    reason: "Verified sender address used by Resend for waitlist signup notifications.",
  },
];

const placeholderPatterns = [/^your-/i, /^whsec_your/i, /^the-/i, /^example$/i, /^changeme$/i, /replace[_-]?with/i];

export function validateProductionEnv(env = process.env) {
  const failures = [];
  const warnings = [];

  requiredEnv.forEach((entry) => checkEntry(entry, env, failures));
  recommendedEnv.forEach((entry) => checkEntry(entry, env, warnings));

  return { failures, warnings };
}

function checkEntry(entry, env, target) {
  const value = env[entry.name]?.trim() || "";

  if (!value) {
    target.push(`${entry.name} is missing. ${entry.reason}`);
    return;
  }

  if (placeholderPatterns.some((pattern) => pattern.test(value))) {
    target.push(`${entry.name} still looks like a placeholder.`);
    return;
  }

  if (entry.validate) {
    const error = entry.validate(value);
    if (error) {
      target.push(`${entry.name}: ${error}.`);
    }
  }
}

function validateUrl(protocol, hostname) {
  return (value) => {
    try {
      const url = new URL(value);
      if (protocol && url.protocol !== protocol) {
        return `expected ${protocol} URL`;
      }
      if (hostname && url.hostname !== hostname) {
        return `expected hostname ${hostname}`;
      }
      return null;
    } catch {
      return "expected a valid URL";
    }
  };
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : "expected a valid email address";
}
