import React, { useEffect, useState } from "react";
import {
  ANNOUNCEMENT,
  DEFAULT_PAYMENT_METHOD,
  FAQS,
  HERO,
  HOOK_VARIANTS,
  PAYMENT_AFTER_STEPS,
  PAYMENT_METHODS,
  PAYPAL_PAYMENT_SETUP_PENDING,
  RESERVATION_OFFER,
  SITE,
  getPaymentMethodLabel,
} from "./content.js";
import {
  initAnalytics,
  trackEvent,
  trackInitiateCheckout,
  trackLead,
  trackLeadIntent,
  trackPurchase,
  withUtm,
} from "./tracking.js";
import { notifyLeadSignup } from "./leadNotification.js";
import {
  recordReservationIntent,
  recordWaitlistSignup,
} from "./supabaseBackend.js";
import heroImage from "../assets/kastave-new-hero.jpg";
import logoImage from "../assets/kastave-logo-wordmark.png";
import processImage from "../assets/kastave-new-process.jpg";
import recognitionImage from "../assets/kastave-new-recognition.jpg";
import depositHeroImage from "../assets/kastave-deposit-hand-carry-product-match.jpg";
import productDetailImage from "../assets/kastave-product-detail.jpg";
import terrainFeatureImage from "../assets/kastave-feature-3d-terrain.jpg";
import waterFeatureImage from "../assets/kastave-feature-water-conditions.jpg";
import strategyFeatureImage from "../assets/kastave-feature-ai-strategy.jpg";
import audienceBankAnglerImage from "../assets/kastave-audience-bank-angler.jpg";
import audiencePondHopperImage from "../assets/kastave-audience-pond-hopper.jpg";
import audienceHiddenSnagImage from "../assets/kastave-audience-hidden-snag-first-person-v4.jpg";
import audienceCastableVsKastaveImage from "../assets/kastave-audience-castable-auto-scan-ui-v7.jpg";

const APP_MODES = [
  {
    key: "auto",
    label: "Auto",
    title: "Auto Mode",
    body: "Kastave runs a shoreline scan path, builds the map, and keeps the route repeatable.",
    metrics: ["Route lock", "Scan fan", "Cast calls"],
    status: "Auto shoreline sweep",
    action: "Scanning reachable bank water",
    readouts: [
      { label: "Coverage", value: "72%" },
      { label: "Route", value: "Locked" },
      { label: "Wake", value: "Normal" },
    ],
  },
  {
    key: "silent",
    label: "Silent",
    title: "Silent Mode",
    body: "Slower movement and softer route changes for pressured ponds, shallow grass, and cautious fish.",
    metrics: ["Low wake", "Soft turns", "Close cover"],
    status: "Quiet close-cover pass",
    action: "Reducing wake near grass",
    readouts: [
      { label: "Coverage", value: "41%" },
      { label: "Route", value: "Soft turn" },
      { label: "Wake", value: "Low" },
    ],
  },
  {
    key: "performance",
    label: "Performance",
    title: "Performance Mode",
    body: "Faster coverage when you need to scan a longer bank, compare pockets, or move before sunset.",
    metrics: ["Fast sweep", "Long bank", "Return path"],
    status: "Fast long-bank sweep",
    action: "Covering the next pocket",
    readouts: [
      { label: "Coverage", value: "88%" },
      { label: "Route", value: "Wide" },
      { label: "Wake", value: "High" },
    ],
  },
];

const PRODUCT_SPECS = [
  { icon: "battery", label: "Battery Life", value: "6 hours", detail: "target runtime" },
  { icon: "weight", label: "Weight", value: "5 kg", detail: "about 11 lb" },
  { icon: "sonar", label: "Sonar Range", value: "20 m radius", detail: "shoreline scan coverage" },
  { icon: "speed", label: "Cruise Speed", value: "1.5 m/s max", detail: "quiet scan at lower speed" },
  { icon: "wave", label: "Wind & Chop", value: "Beaufort 3", detail: "light chop, about 0.3 m" },
  { icon: "connectivity", label: "Connectivity", value: "Wi-Fi 6", detail: "Bluetooth 5.4 pairing" },
];

const MEDIA_SCRIPT_CARDS = [
  {
    title: "Castable sonar hassle",
    body: "First-person shot: one hand holds the rod, one hand checks the app, one round sonar ball is on the line, while Kastave moves forward by itself.",
  },
  {
    title: "Hidden snag reveal",
    body: "First-person cast into calm water, then a clean over-under cutaway shows the crankbait caught on a hidden branch.",
  },
  {
    title: "Auto-scan to 3 cast calls",
    body: "Launch from shore, show a calm sweep path, then cut to the app UI revealing Safe, Structure, and Risk / Reward points.",
  },
];

const PRIVACY_STATEMENTS = [
  {
    icon: "lock",
    body: "Kastave saves your waypoints, notes, and scan history for you. Your fishing map stays private unless you choose to share it.",
  },
  {
    icon: "shield",
    body: "No public spot feed. No spot burning. We do not sell your saved fishing locations or turn your private water into someone else's map.",
  },
];

const TARGET_AUDIENCES = [
  {
    title: "The Bank-Only Bass Angler",
    body: "No boat electronics. No dock advantage. Just bank water you can actually reach.",
    image: audienceBankAnglerImage,
    imagePosition: "50% 50%",
    animation: "bank",
  },
  {
    title: "The After-Work Pond Hopper",
    body: "Forty minutes after work is too short to spend half the session guessing.",
    image: audiencePondHopperImage,
    imagePosition: "50% 50%",
    animation: "timer",
  },
  {
    title: "The Snag-Weary Lure Saver",
    body: "Grass, muck, brush, and hidden junk should not cost you your favorite bait.",
    image: audienceHiddenSnagImage,
    imagePosition: "50% 50%",
    animation: "snag",
  },
  {
    title: "The Castable-Sonar Upgrade Seeker",
    body: "If casting your fish finder feels like work, let the scout scan first.",
    image: audienceCastableVsKastaveImage,
    imagePosition: "52% 50%",
    animation: "sonar",
  },
];

const DEPOSIT_PERKS = [
  {
    icon: "pricing",
    title: "Founder pricing",
    body: `Your ${RESERVATION_OFFER.depositAmount} reservation unlocks ${RESERVATION_OFFER.creditAmount} off and lowers ${RESERVATION_OFFER.regularPrice} to ${RESERVATION_OFFER.productPrice}.`,
  },
  {
    icon: "allocation",
    title: "Founder allocation",
    body: "We reserve your place in the early founder list before the public Kickstarter launch.",
  },
  {
    icon: "updates",
    title: "Team updates",
    body: "Follow the hull, sensor, and app updates as Kastave moves toward field testing.",
  },
];

const DEPOSIT_STEPS = [
  "Place $1 deposit",
  "Get launch email",
  "Apply $100 credit",
];

const PACKAGE_INCLUDES = [
  "Kastave Scout boat",
  "Removable battery pack",
  "Kastave app + founder software membership",
  "USB-C charging cable",
  "Quick-start guide",
];

const DEPOSIT_FAQS = [
  {
    question: "Is this the full Kastave price?",
    answer: `No. This is a ${RESERVATION_OFFER.depositAmount} founder reservation, not a finished-unit purchase. The planned launch price is ${RESERVATION_OFFER.regularPrice}, and the limited-time founder price is ${RESERVATION_OFFER.productPrice}.`,
  },
  {
    question: "What do I get for $1?",
    answer: `You reserve a founder spot and unlock ${RESERVATION_OFFER.creditAmount} founder discount, lowering the planned ${RESERVATION_OFFER.regularPrice} launch price to ${RESERVATION_OFFER.productPrice} if you buy at launch.`,
  },
  {
    question: "Is the reservation refundable?",
    answer: "No. The reservation is non-refundable because it is used to measure founder demand and plan the first production run.",
  },
  {
    question: "When do I pay for the unit?",
    answer: "You only pay for the actual unit later, when Kastave launches and you decide to complete the purchase.",
  },
  {
    question: "Can I use PayPal or a card?",
    answer: PAYPAL_PAYMENT_SETUP_PENDING
      ? "Credit card through Stripe is active now. PayPal stays visible but disabled until the live PayPal payment link is configured."
      : "Yes. The page keeps both routes simple: credit card through Stripe, or PayPal checkout.",
  },
  {
    question: "Why reserve before Kickstarter?",
    answer: "It helps us size the first run and gives you a clear launch-credit record before the campaign opens.",
  },
];

const PRIVACY_POLICY_SECTIONS = [
  {
    title: "Information we collect",
    body: [
      "Contact details you submit, such as email address and messages sent to Kastave.",
      "Reservation details, such as payment provider, payment status, amount, currency, receipt identifiers, and attribution source.",
      "Site and advertising data, such as UTM parameters, referring pages, approximate location, device/browser information, cookies, local storage, and Meta Pixel or similar ad-event data when enabled.",
    ],
  },
  {
    title: "How we use information",
    body: [
      "To manage the waitlist, founder reservations, launch-credit records, receipts, support, and product updates.",
      "To understand which campaigns, pages, and checkout paths are working.",
      "To prevent fraud, secure the site, troubleshoot payment issues, and comply with legal obligations.",
    ],
  },
  {
    title: "Payments and service providers",
    body: [
      "Payments are processed by third-party providers such as Stripe and PayPal. Kastave does not store full card numbers.",
      "We may use hosting, analytics, email, database, payment, advertising, and customer-support providers to operate the site.",
      "We do not sell private fishing spots or personal waypoint data. During this prelaunch site, Kastave collects reservation and marketing data, not finished-product trip maps.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "You can unsubscribe from marketing emails using the link in the email or by contacting us.",
      "You can limit cookies and ad tracking through your browser, device, or platform settings.",
      "You may request access, correction, or deletion of personal information by emailing Kastave.",
    ],
  },
  {
    title: "Retention, security, and changes",
    body: [
      "We keep information as long as needed for reservations, launch-credit records, support, analytics, legal compliance, and security.",
      "No online service is perfectly secure, but we use reasonable safeguards and rely on established payment providers.",
      "We may update this policy as Kastave moves from prelaunch to launch. The updated date will show when changes are made.",
    ],
  },
];

const TERMS_SECTIONS = [
  {
    title: "Using the site",
    body: [
      "You may use this site to learn about Kastave, join the waitlist, reserve a founder spot, and contact us.",
      "Do not misuse the site, interfere with payments or analytics, attempt unauthorized access, or submit false reservation information.",
      "Kastave content, logos, images, product concepts, and page designs are owned by Kastave or its licensors and may not be copied for commercial use without permission.",
    ],
  },
  {
    title: "Founder reservation",
    body: [
      `The ${RESERVATION_OFFER.depositAmount} founder reservation is not a finished-product purchase and does not guarantee a shipped unit.`,
      `If you later buy Kastave at launch, the reservation is intended to unlock the 3-day founder offer and ${RESERVATION_OFFER.creditAmount} founder discount toward your first unit.`,
      `The current planned launch price is ${RESERVATION_OFFER.regularPrice}, and the current 3-day founder price is ${RESERVATION_OFFER.productPrice}. Final pricing, specifications, accessories, availability, launch date, and campaign details may change.`,
      "Unless otherwise required by law, the founder reservation is non-refundable because it is used to measure demand and plan the first production run.",
    ],
  },
  {
    title: "Payments",
    body: [
      "Checkout may be handled by Stripe, PayPal, or other third-party payment providers. Their terms and privacy notices also apply.",
      "If a payment provider does not redirect correctly, your provider receipt may still be the source of truth for payment status.",
      "Taxes, shipping, import duties, and final product checkout terms may be added later when actual units become available.",
    ],
  },
  {
    title: "Product and fishing use",
    body: [
      "Kastave is in prelaunch development. Site images, features, sensor claims, app flows, prices, and accessories may change before release.",
      "Fishing conditions are variable. Kastave may help scout water, but it does not guarantee catches, safe conditions, or legal access to any water.",
      "You are responsible for following local fishing laws, water-access rules, safety requirements, and property boundaries.",
    ],
  },
  {
    title: "Disclaimers and liability",
    body: [
      "The site is provided as-is for prelaunch information, reservations, and updates.",
      "To the maximum extent permitted by law, Kastave is not liable for indirect, incidental, special, consequential, or lost-profit damages from site use, payment-provider issues, delayed launch, or changed product plans.",
      "Some regions do not allow certain limitations, so parts of this section may not apply where prohibited.",
    ],
  },
];

function getLandingHookVariant() {
  const params = new URLSearchParams(window.location.search);
  const rawHook =
    params.get("hook") || params.get("variant") || params.get("creative_hook") || params.get("utm_content") || "";
  const normalizedHook = rawHook.toLowerCase().replaceAll("_", "-");

  if (normalizedHook.includes("obvious") || normalizedHook.includes("wrong-cast")) {
    return HOOK_VARIANTS["obvious-cast"];
  }
  if (
    normalizedHook.includes("castable") ||
    normalizedHook.includes("sonar") ||
    normalizedHook.includes("fish-finder")
  ) {
    return HOOK_VARIANTS["castable-sonar"];
  }
  if (
    normalizedHook.includes("three-cast") ||
    normalizedHook.includes("3-cast") ||
    normalizedHook.includes("safe-structure") ||
    normalizedHook.includes("risk-reward")
  ) {
    return HOOK_VARIANTS["three-casts"];
  }

  return HOOK_VARIANTS.default;
}

function getThanksPaymentProvider() {
  const params = new URLSearchParams(window.location.search);
  return params.get("provider") || (params.has("session_id") ? "stripe" : DEFAULT_PAYMENT_METHOD.key);
}

function App() {
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [signupMessage, setSignupMessage] = useState("");
  const hookVariant = getLandingHookVariant();
  const currentPath = window.location.pathname;
  const isThanksPage = currentPath === "/thanks";
  const isDepositPage = currentPath === "/deposit";
  const isPrivacyPage = currentPath === "/privacy" || currentPath === "/policies/privacy-policy";
  const isTermsPage = currentPath === "/terms" || currentPath === "/policies/terms-of-service";

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackEvent("landing_hook_variant_view", {
      hook_variant: hookVariant.key,
      hook_title: hookVariant.title,
    });
  }, [hookVariant.key, hookVariant.title]);

  useEffect(() => {
    if (isThanksPage) {
      const purchaseKey = `kastave_purchase_tracked_${window.location.search || "direct"}`;
      if (sessionStorage.getItem(purchaseKey) === "true") {
        return;
      }
      sessionStorage.setItem(purchaseKey, "true");
      const eventId = `purchase_${Date.now()}`;
      const provider = getThanksPaymentProvider();
      trackPurchase({
        event_id: eventId,
        value: 1,
        currency: "USD",
        amount_cents: 100,
        provider,
        source: "thanks_page",
        content_name: "Kastave $1 early reservation",
      });
    }
  }, [isThanksPage]);

  const openDepositPage = (source = "unknown", event) => {
    trackLeadIntent({ cta: "reserve_for_1", cta_location: source, source });
    trackEvent("deposit_page_open", { source, value: 1, currency: "USD" });
    if (event?.currentTarget?.tagName === "A") {
      return;
    }
    window.location.href = withUtm("/deposit");
  };

  const reserveWithPayment = (providerKey = DEFAULT_PAYMENT_METHOD.key, source = "unknown") => {
    const paymentMethod = PAYMENT_METHODS.find((method) => method.key === providerKey) || DEFAULT_PAYMENT_METHOD;
    const provider = paymentMethod.key;
    const paymentLink = paymentMethod.paymentLink;

    trackLeadIntent({ cta: "reserve_for_1", cta_location: source, source });
    trackInitiateCheckout({
      cta: "reserve_for_1",
      cta_location: source,
      source,
      value: 1,
      currency: "USD",
      amount_cents: 100,
      provider,
      content_name: "Kastave $1 early reservation",
    });
    trackEvent("outbound_click", { link: provider, source, href: paymentLink });
    recordReservationIntent({
      amountCents: 100,
      refundable: false,
      provider,
      source,
      paymentLink,
    });

    if (paymentLink) {
      window.location.href = withUtm(paymentLink);
      return;
    }

    trackEvent("payment_failed", {
      reason: "missing_payment_link",
      source,
      provider,
      value: 1,
      currency: "USD",
    });
    setSetupDialogOpen(true);
  };

  const subscribe = (email, source = "inline_form") => {
    const continueToDeposit = source === "hero";

    trackLeadIntent({ cta: "join_early_access_submit", cta_location: source, source });
    trackLead({
      source,
      cta: "join_early_access_submit",
      cta_location: source,
      content_name: "Kastave early access waitlist",
      lead_type: "email_waitlist",
      continue_to_deposit: continueToDeposit,
    });
    recordWaitlistSignup(email, { source });
    notifyLeadSignup(email, { source });

    if (continueToDeposit) {
      localStorage.setItem("kastave_last_signup_email", email);
      trackEvent("signup_continue_to_deposit", { source, destination: "/deposit" });
      window.location.href = withUtm("/deposit");
      return;
    }

    if (SITE.beehiivFormUrl) {
      window.location.href = withUtm(SITE.beehiivFormUrl);
      return;
    }

    const subscribers = JSON.parse(localStorage.getItem("kastave_subscribers") || "[]");
    if (!subscribers.includes(email)) {
      subscribers.push(email);
      localStorage.setItem("kastave_subscribers", JSON.stringify(subscribers));
    }

    setSignupMessage("You're on the Kastave Bank Fishing Scout Co-Creation list.");
  };

  const focusWaitlist = (source = "unknown") => {
    trackLeadIntent({ cta: "join_early_access", cta_location: source, source });
    const input = document.getElementById("hero-email");
    if (input) {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      input.focus({ preventScroll: true });
    }
  };

  if (isThanksPage) {
    return <ThanksPage onSubscribe={(email) => subscribe(email, "thanks")} message={signupMessage} />;
  }

  if (isDepositPage) {
    return <DepositPage onPayment={(providerKey) => reserveWithPayment(providerKey, "deposit_page")} />;
  }

  if (isPrivacyPage) {
    return <LegalPage type="privacy" />;
  }

  if (isTermsPage) {
    return <LegalPage type="terms" />;
  }

  return (
    <>
      <AnnouncementBar />
      <SiteNav
        depositHref={withUtm("/deposit")}
        onWaitlist={() => focusWaitlist("nav")}
        onReserve={(event) => openDepositPage("nav", event)}
      />
      <main>
        <Hero
          depositHref={withUtm("/deposit")}
          hookVariant={hookVariant}
          onSubscribe={(email) => subscribe(email, "hero")}
          onReserve={(event) => openDepositPage("hero", event)}
          message={signupMessage}
        />
        <CastOptionsSection />
        <AudienceSection />
        <AppExperienceSection />
        <ProductSpecsSection depositHref={withUtm("/deposit")} onReserve={(event) => openDepositPage("specs", event)} />
        <MediaScriptSection />
        <PrivacySection />
        <ReservationSection
          depositHref={withUtm("/deposit")}
          onSubscribe={(email) => subscribe(email, "reservation")}
          onWaitlist={() => focusWaitlist("reservation")}
          onReserve={(event) => openDepositPage("reservation", event)}
          message={signupMessage}
        />
        <FAQ />
      </main>
      <Footer onSubscribe={(email) => subscribe(email, "footer")} message={signupMessage} />
      <SetupDialog open={setupDialogOpen} onClose={() => setSetupDialogOpen(false)} />
    </>
  );
}

function AnnouncementBar() {
  return <div className="announcement">{ANNOUNCEMENT}</div>;
}

function SiteNav({ depositHref, onWaitlist, onReserve }) {
  const [open, setOpen] = useState(false);
  const navItems = ["Highlights", "Who it's for", "App", "Specs", "FAQ"];

  return (
    <header className="site-nav">
      <a
        className="brand dark-brand"
        href="/"
        aria-label="Kastave home"
        onClick={() => trackEvent("link_click", { link: "brand", source: "nav", href: "/" })}
      >
        <img className="brand-logo" src={logoImage} alt={SITE.name} />
      </a>
      <button
        className="hamburger"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="primary-navigation"
      >
        <span />
        <span />
      </button>
      <nav className={open ? "main-nav is-open" : "main-nav"} id="primary-navigation" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a
            key={item}
            href={navHref(item)}
            onClick={() => {
              setOpen(false);
              trackEvent("link_click", { link: item.toLowerCase(), source: "nav", href: navHref(item) });
            }}
          >
            {item}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <button className="nav-waitlist-button" type="button" onClick={onWaitlist}>
          Join Early Access
        </button>
        <a className="nav-reserve-button" href={depositHref} onClick={onReserve}>
          Reserve for $1
        </a>
      </div>
    </header>
  );
}

function navHref(item) {
  const hrefs = {
    Highlights: "#cast-options",
    "Who it's for": "#audience",
    App: "#app-ui",
    Specs: "#specs",
    FAQ: "#faq",
  };

  return hrefs[item] || `#${item.toLowerCase().replaceAll(" ", "-")}`;
}

function Hero({ depositHref, hookVariant, onSubscribe, onReserve, message }) {
  return (
    <section className="hero commerce-hero" aria-labelledby="hero-title">
      <img
        className="hero-image"
        src={heroImage}
        alt="Kastave fish finder boat scanning a shoreline"
        fetchPriority="high"
        decoding="async"
      />
      <div className="hero-scrim" />
      <div className="hero-scan-overlay" aria-hidden="true">
        <span className="scan-line scan-line-one" />
        <span className="scan-line scan-line-two" />
        <span className="scan-pin scan-pin-depth">drop-off</span>
        <span className="scan-pin scan-pin-cover">weed edge</span>
      </div>
      <div className="hero-content hero-centered">
        <p className="eyebrow">{hookVariant.eyebrow}</p>
        <h1 id="hero-title">{hookVariant.title}</h1>
        <p className="hero-copy">{hookVariant.body}</p>
        {hookVariant.key !== "default" && (
          <div className={`hero-hook-card hero-hook-${hookVariant.key}`} aria-label="Ad hook continuity">
            <span>{hookVariant.sceneLabel}</span>
            <strong>{hookVariant.sceneCopy}</strong>
          </div>
        )}
        {hookVariant.key !== "default" && (
          <div className="hero-offer-card" aria-label={`${RESERVATION_OFFER.depositAmount} reservation credit offer`}>
            <div className="hero-offer-icon" aria-hidden="true">
              <span className="ticket-cut ticket-cut-left" />
              <span className="ticket-cut ticket-cut-right" />
              <span>{RESERVATION_OFFER.depositAmount}</span>
            </div>
            <div className="hero-offer-copy">
              <strong>{RESERVATION_OFFER.title}</strong>
              <span>
                {RESERVATION_OFFER.discountLabel}: {RESERVATION_OFFER.regularPrice} becomes{" "}
                {RESERVATION_OFFER.productPrice} with the founder discount.
              </span>
            </div>
          </div>
        )}
        <p className="hero-signup-copy">
          {RESERVATION_OFFER.discountLabel}: reserve to lock {RESERVATION_OFFER.productPrice}.
        </p>
        <div className="hero-actions" id="reserve">
          <EmailForm id="hero-email" source="hero" onSubscribe={onSubscribe} buttonLabel="Sign up" />
          <a className="secondary-link hero-reserve-button" href={depositHref} onClick={onReserve}>
            Reserve for $1
          </a>
        </div>
        <p className="form-message hero-form-message">{message}</p>
        <div className="hero-launch-row" aria-label="Kickstarter launch status">
          <span>Coming soon</span>
          <small aria-hidden="true">·</small>
          <strong>Kickstarter</strong>
        </div>
        <p className="microcopy">{HERO.note}</p>
      </div>
    </section>
  );
}

function DepositPerkIcon({ type }) {
  if (type === "pricing") {
    return (
      <svg viewBox="0 0 32 32" role="img" aria-label="Discount tag">
        <path d="M6 13.5 15.5 4H26v10.5L16.5 24a3 3 0 0 1-4.2 0L6 17.7a3 3 0 0 1 0-4.2Z" />
        <circle cx="22" cy="8" r="1.8" />
        <path d="m12 19 8-8" />
        <circle cx="12.6" cy="12.4" r="1.4" />
        <circle cx="19.4" cy="18.6" r="1.4" />
      </svg>
    );
  }

  if (type === "allocation") {
    return (
      <svg viewBox="0 0 32 32" role="img" aria-label="Reserved founder slot">
        <path d="M7 10a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3v-3a3 3 0 0 0 0-6v-3Z" />
        <path d="M12 13h8" />
        <path d="M12 19h5" />
        <path d="M22 12v8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" role="img" aria-label="Team updates">
      <path d="M5 10h22v14H5z" />
      <path d="m6 11 10 8 10-8" />
      <path d="M22 5h4v4" />
      <path d="M26 5 20 11" />
    </svg>
  );
}

function DepositPage({ onPayment }) {
  const jumpToDepositCheckout = (source = "deposit_page") => {
    trackEvent("deposit_checkout_jump", { source });
    document.getElementById("deposit-checkout")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="deposit-page deposit-mondo-page">
      <div className="deposit-floating-nav">
        <a
          href="/"
          aria-label="Back to Kastave home"
          onClick={() => trackEvent("link_click", { link: "deposit_brand", source: "deposit_page", href: "/" })}
        >
          <img className="brand-logo" src={logoImage} alt={SITE.name} />
        </a>
        <button
          type="button"
          onClick={() => jumpToDepositCheckout("floating_nav")}
        >
          Reserve Kastave
        </button>
      </div>

      <section className="deposit-mondo-hero" aria-labelledby="deposit-title">
        <img
          className="deposit-hero-image"
          src={depositHeroImage}
          alt="A hand carrying Kastave to a shoreline fishing spot"
          fetchPriority="high"
          decoding="async"
        />
        <div className="deposit-mondo-shade" />
        <div className="deposit-mondo-copy">
          <p className="deposit-launch">
            <span>Coming soon</span>
            <small aria-hidden="true">·</small>
            <strong>Kickstarter</strong>
          </p>
          <h1 id="deposit-title">
            <strong>{RESERVATION_OFFER.depositAmount}</strong> Deposit Now,{" "}
            <strong>{RESERVATION_OFFER.creditAmount}</strong> Off Later
          </h1>
          <p className="deposit-offer-timer">{RESERVATION_OFFER.durationLabel}</p>
          <p className="deposit-lock-label">Lock the price at</p>
          <div className="deposit-lock-price" aria-label="Kastave limited-time founder price">
            <span className="deposit-original-price">{RESERVATION_OFFER.regularPrice}</span>
            <strong>{RESERVATION_OFFER.productPrice}</strong>
            <span>limited-time founder price</span>
          </div>
          <p className="deposit-price-note">
            {RESERVATION_OFFER.discountCopy} This is a reservation credit, not the full product price.
          </p>
          <button className="deposit-mondo-primary" type="button" onClick={() => jumpToDepositCheckout("hero")}>
            Deposit Now <span aria-hidden="true">-&gt;</span>
          </button>
        </div>
      </section>

      <section className="deposit-mondo-perks" aria-labelledby="deposit-perks-title">
        <h2 className="sr-only" id="deposit-perks-title">
          What your deposit reserves
        </h2>
        <div className="deposit-mondo-card-grid">
          {DEPOSIT_PERKS.map((perk) => (
            <article className="deposit-mondo-card" key={perk.title}>
              <span className="deposit-card-icon" aria-hidden="true">
                <DepositPerkIcon type={perk.icon} />
              </span>
              <h3>{perk.title}</h3>
              <p>{perk.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="deposit-mondo-save" id="deposit-checkout" aria-label="Kastave reservation checkout">
        <p>Save</p>
        <strong>{RESERVATION_OFFER.creditAmount}</strong>
        <p>
          with {RESERVATION_OFFER.depositAmount} deposit: {RESERVATION_OFFER.regularPrice} becomes{" "}
          {RESERVATION_OFFER.productPrice}
        </p>
        <div className="deposit-mondo-payment-row" aria-label="Choose payment method">
          {PAYMENT_METHODS.map((method) => (
            <button
              className={`deposit-mondo-pay-button deposit-mondo-pay-${method.key}`}
              type="button"
              disabled={!method.paymentLink}
              aria-disabled={!method.paymentLink}
              title={method.disabledReason || `Pay with ${method.label}`}
              onClick={() => onPayment(method.key)}
              key={method.key}
            >
              {method.key === "stripe" ? "Credit Card" : method.label}{" "}
              <span aria-hidden="true">{method.paymentLink ? "->" : "setup pending"}</span>
            </button>
          ))}
        </div>
        <ul className="deposit-mondo-checklist">
          <li>
            <span>Your {RESERVATION_OFFER.depositAmount} applies to your founder reservation record.</span>
            <strong aria-hidden="true">✓</strong>
          </li>
          <li>
            <span>Non-refundable reservation. No long checkout form on this page.</span>
            <strong aria-hidden="true">✓</strong>
          </li>
          <li>
            <span>
              {PAYPAL_PAYMENT_SETUP_PENDING
                ? "PayPal checkout appears after the live link is connected."
                : "Secure Stripe or PayPal checkout."}
            </span>
            <strong aria-hidden="true">✓</strong>
          </li>
        </ul>
      </section>

      <section className="deposit-mondo-how" aria-labelledby="deposit-how-title">
        <h2 id="deposit-how-title">How does the deposit work?</h2>
        <ol className="deposit-mondo-steps">
          {DEPOSIT_STEPS.map((step, index) => (
            <li key={step}>
              <span className="deposit-step-icon" aria-hidden="true">
                {index + 1}
              </span>
              <strong>{step}</strong>
            </li>
          ))}
        </ol>
      </section>

      <section className="deposit-mondo-faq" aria-labelledby="deposit-faq-title">
        <h2 id="deposit-faq-title">FAQ</h2>
        <div className="deposit-mondo-faq-box">
          {DEPOSIT_FAQS.map((item) => (
            <details key={item.question} open={item.question === "What do I get for $1?"}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <DepositPolicyFooter />
    </main>
  );
}

function LegalPage({ type }) {
  const isPrivacy = type === "privacy";
  const title = isPrivacy ? "Privacy Policy" : "Terms of Service";
  const subtitle = isPrivacy
    ? "How Kastave handles waitlist, reservation, payment, analytics, and advertising data."
    : "Terms for using Kastave.com, joining early access, and placing a founder reservation.";
  const sections = isPrivacy ? PRIVACY_POLICY_SECTIONS : TERMS_SECTIONS;
  const otherLink = isPrivacy
    ? { href: "/terms", label: "Terms of Service" }
    : { href: "/privacy", label: "Privacy Policy" };

  return (
    <main className="legal-page">
      <nav className="legal-nav" aria-label="Legal navigation">
        <a className="brand" href="/" onClick={() => trackEvent("link_click", { link: "legal_brand", source: type, href: "/" })}>
          <img className="brand-logo" src={logoImage} alt={SITE.name} />
        </a>
        <a href={otherLink.href} onClick={() => trackEvent("link_click", { link: otherLink.label, source: type, href: otherLink.href })}>
          {otherLink.label}
        </a>
      </nav>
      <section className="legal-hero">
        <p className="section-kicker">Kastave legal</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <small>Last updated: May 29, 2026</small>
      </section>
      <section className="legal-content" aria-label={title}>
        <article className="legal-card">
          <h2>Overview</h2>
          <p>
            Kastave is a prelaunch bank-fishing scout project. This page is written for visitors, waitlist members,
            founder-reservation customers, and people who contact us through {SITE.domain}.
          </p>
          <p>
            Contact us at <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> for privacy, reservation, or
            terms questions.
          </p>
        </article>
        {sections.map((section) => (
          <article className="legal-card" key={section.title}>
            <h2>{section.title}</h2>
            {section.body.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </article>
        ))}
      </section>
      <DepositPolicyFooter />
    </main>
  );
}

function DepositPolicyFooter() {
  const trackPolicyLink = (link, href) => {
    trackEvent("link_click", { link, source: "policy_footer", href });
  };

  return (
    <footer className="deposit-policy-footer">
      <a href="/privacy" onClick={() => trackPolicyLink("privacy_policy", "/privacy")}>
        Privacy Policy
      </a>
      <a href="/terms" onClick={() => trackPolicyLink("terms_of_service", "/terms")}>
        Terms of Service
      </a>
      <a href={`mailto:${SITE.contactEmail}`} onClick={() => trackPolicyLink("contact_email", `mailto:${SITE.contactEmail}`)}>
        Contact
      </a>
    </footer>
  );
}

function CastOptionsSection() {
  const highlights = [
    {
      title: "3D UNDERWATER VIEW",
      subtitle: "See bottom, breaks, weeds, and drop-offs.",
      image: terrainFeatureImage,
      className: "highlight-bento-card-wide",
    },
    {
      title: "AUTO-SCAN THE BANK",
      subtitle: "Covers shoreline water without repeated casts.",
      image: waterFeatureImage,
      className: "highlight-bento-card-square",
    },
    {
      title: "SENSE THE WATER",
      subtitle: "Multi-sensor clues before your first cast.",
      image: processImage,
      className: "highlight-bento-card-square",
    },
    {
      title: "AI CAST CALLS",
      subtitle: "AI recommends 3 spots: safe, structure, swing-for-it.",
      image: strategyFeatureImage,
      className: "highlight-bento-card-square",
    },
    {
      title: "KEEP YOUR HONEY HOLES",
      subtitle: "Auto-save spots. Only you see them.",
      image: recognitionImage,
      className: "highlight-bento-card-square",
    },
  ];

  return (
    <section className="cast-options-section highlight-bento-section" id="cast-options" aria-labelledby="cast-options-title">
      <div className="highlight-bento-inner">
        <h2 className="highlight-bento-heading" id="cast-options-title">
          Get the Highlights
        </h2>
        <div className="highlight-bento-grid" aria-label="Kastave product highlights">
          <div className="highlight-bento-main">
            {highlights.slice(0, 3).map((item) => (
              <HighlightBentoCard item={item} key={item.title} />
            ))}
          </div>
          <div className="highlight-bento-side">
            {highlights.slice(3).map((item) => (
              <HighlightBentoCard item={item} key={item.title} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HighlightBentoCard({ item }) {
  return (
    <article className={`highlight-bento-card ${item.className}`}>
      <img src={item.image} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      <div className="highlight-bento-card-copy">
        <h3>{item.title}</h3>
        <p>{item.subtitle}</p>
      </div>
    </article>
  );
}

function AudienceVisual({ type }) {
  if (type === "bank") {
    return (
      <div className="audience-visual-layer audience-visual-bank" aria-hidden="true">
        <span className="audience-bank-reach-edge" />
        <span className="audience-cast-arc" />
        <span className="audience-cast-point" />
        <span className="audience-shore-route" />
        <span className="audience-scan-fan" />
        <span className="audience-water-pin audience-pin-one" />
        <span className="audience-water-pin audience-pin-two" />
      </div>
    );
  }

  if (type === "timer") {
    return (
      <div className="audience-visual-layer audience-visual-timer" aria-hidden="true">
        <span className="audience-clock-ring" />
        <span className="audience-clock-hand" />
        <span className="audience-time-window" />
        <span className="audience-sweep-line" />
        <span className="audience-route-dot audience-dot-one" />
        <span className="audience-route-dot audience-dot-two" />
        <span className="audience-route-dot audience-dot-three" />
      </div>
    );
  }

  if (type === "snag") {
    return (
      <div className="audience-visual-layer audience-visual-snag" aria-hidden="true">
        <span className="audience-calm-surface" />
        <span className="audience-weed-bed" />
        <span className="audience-snag-root" />
        <span className="audience-snag-tension-line" />
        <span className="audience-lure-path" />
        <span className="audience-hook-point" />
        <span className="audience-snag-lock" />
        <span className="audience-warning-pin audience-warning-one" />
        <span className="audience-warning-pin audience-warning-two" />
        <span className="audience-safe-lane" />
      </div>
    );
  }

  return (
    <div className="audience-visual-layer audience-visual-sonar" aria-hidden="true">
      <span className="audience-castable-line" />
      <span className="audience-repeat-cast-arc" />
      <span className="audience-sonar-ball" />
      <span className="audience-forward-wake" />
      <span className="audience-scout-route" />
      <span className="audience-kastave-scan-beam" />
      <span className="audience-scan-pulse audience-pulse-one" />
      <span className="audience-scan-pulse audience-pulse-two" />
    </div>
  );
}

function AudienceSection() {
  const renderAudienceCard = (audience, keySuffix = "") => (
    <article className={`audience-card audience-card-${audience.animation}`} key={`${audience.title}${keySuffix}`}>
      <div className={`audience-media audience-media-${audience.animation}`}>
        <img
          src={audience.image}
          alt={audience.title}
          style={{ objectPosition: audience.imagePosition }}
          loading="lazy"
          decoding="async"
        />
        <AudienceVisual type={audience.animation} />
      </div>
      <h3>{audience.title}</h3>
      <p>{audience.body}</p>
    </article>
  );

  return (
    <section className="audience-section" id="audience" aria-labelledby="audience-title">
      <div className="audience-inner">
        <h2 className="audience-heading" id="audience-title">
          Who is Kastave For
        </h2>
        <div className="audience-marquee" aria-label="Kastave target anglers">
          <div className="audience-card-row">
            <div className="audience-card-set">
              {TARGET_AUDIENCES.map((audience) => renderAudienceCard(audience))}
            </div>
            <div className="audience-card-set" aria-hidden="true">
              {TARGET_AUDIENCES.map((audience) => renderAudienceCard(audience, "-duplicate"))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AppExperienceSection() {
  const [autoMode, ...supportModes] = APP_MODES;

  return (
    <section className="app-ui-section" id="app-ui" aria-labelledby="app-ui-title">
      <div className="section-inner app-ui-layout">
        <div className="app-ui-copy">
          <p className="section-kicker">Kastave app UI</p>
          <h2 id="app-ui-title">Auto mode first. Quiet or fast when you need it.</h2>
          <p>
            The app should feel like a fishing tool, not a raw sonar puzzle. Auto Mode is the main scan flow; Silent
            and Performance are simple behavior choices for different water.
          </p>
          <div className="app-mode-stack" aria-label="Kastave boat modes">
            <article className="app-mode-card app-mode-card-auto">
              <span>{autoMode.title}</span>
              <p>{autoMode.body}</p>
              <div>
                {autoMode.metrics.map((metric) => (
                  <strong key={metric}>{metric}</strong>
                ))}
              </div>
            </article>
            <div className="app-mode-text-grid">
              {supportModes.map((mode) => (
                <article className={`app-mode-text app-mode-text-${mode.key}`} key={mode.key}>
                  <span>{mode.title}</span>
                  <p>{mode.body}</p>
                  <small>{mode.metrics.join(" / ")}</small>
                </article>
              ))}
            </div>
          </div>
        </div>
        <div className="auto-mode-media" aria-label="Auto Mode media slot">
          <div className="auto-mode-placeholder" aria-hidden="true">
            <div className="auto-mode-map">
              <span className="auto-contour auto-contour-one" />
              <span className="auto-contour auto-contour-two" />
              <span className="auto-route-path" />
              <span className="auto-scan-beam" />
              <span className="auto-boat-marker" />
              <span className="auto-cast-pin auto-cast-pin-safe" />
              <span className="auto-cast-pin auto-cast-pin-structure" />
              <span className="auto-cast-pin auto-cast-pin-risk" />
            </div>
            <div className="auto-mode-panel">
              {autoMode.readouts.map((readout) => (
                <span key={readout.label}>
                  {readout.label}
                  <strong>{readout.value}</strong>
                </span>
              ))}
            </div>
            <div className="auto-cast-row">
              <span>Safe</span>
              <span>Structure</span>
              <span>Risk / Reward</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductSpecsSection({ depositHref, onReserve }) {
  return (
    <section className="product-specs-section" id="specs" aria-labelledby="specs-title">
      <div className="section-inner specs-showcase">
        <div className="specs-hero">
          <img
            className="specs-product-image"
            src={productDetailImage}
            alt="Kastave scout boat product detail"
            loading="lazy"
            decoding="async"
          />
          <div className="specs-copy">
            <p className="section-kicker">Specs: what's under the hull</p>
            <h2 id="specs-title">Built tough. Bank ready.</h2>
          </div>
        </div>
        <div className="specs-detail-row" aria-label="Kastave product specifications">
          {PRODUCT_SPECS.map((spec) => (
            <article className="spec-detail-card" key={spec.label}>
              <SpecIcon type={spec.icon} />
              <span>{spec.label}</span>
              <strong>{spec.value}</strong>
              <small>{spec.detail}</small>
            </article>
          ))}
        </div>
        <div className="specs-note-row">
          <p>
            Prototype targets for the Kickstarter field-test build. Final production ratings may be adjusted after
            shoreline durability testing.
          </p>
          <a className="specs-reserve-button" href={depositHref} onClick={onReserve}>
            Reserve for $1
          </a>
        </div>
      </div>
    </section>
  );
}

function SpecIcon({ type }) {
  const icons = {
    battery: (
      <>
        <rect x="3" y="8" width="15" height="8" rx="1.8" />
        <path d="M20 10.5v3" />
        <path d="M6 11.5h6" />
      </>
    ),
    weight: (
      <>
        <path d="M9 7a3 3 0 0 1 6 0" />
        <rect x="5" y="7" width="14" height="12" rx="3" />
        <path d="M9 13h6" />
      </>
    ),
    sonar: (
      <>
        <circle cx="12" cy="12" r="2.5" />
        <path d="M7.8 16.2a6 6 0 0 1 0-8.4" />
        <path d="M16.2 7.8a6 6 0 0 1 0 8.4" />
        <path d="M4.8 19.2a10.2 10.2 0 0 1 0-14.4" />
      </>
    ),
    speed: (
      <>
        <path d="M4 15a8 8 0 1 1 16 0" />
        <path d="M12 15l4-5" />
        <path d="M8 17h8" />
      </>
    ),
    wave: (
      <>
        <path d="M3 15c2.2 0 2.2-2 4.4-2s2.2 2 4.4 2 2.2-2 4.4-2 2.2 2 4.4 2" />
        <path d="M3 19c2.2 0 2.2-2 4.4-2s2.2 2 4.4 2 2.2-2 4.4-2 2.2 2 4.4 2" />
        <path d="M7 10l2-4 2 4" />
      </>
    ),
    connectivity: (
      <>
        <path d="M5 9a11 11 0 0 1 14 0" />
        <path d="M8 12a6.5 6.5 0 0 1 8 0" />
        <path d="M10.8 15a2.4 2.4 0 0 1 2.4 0" />
        <circle cx="12" cy="18" r="1" />
      </>
    ),
  };

  return (
    <svg className="spec-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {icons[type] || icons.sonar}
    </svg>
  );
}

function MediaScriptSection() {
  return (
    <section className="media-script-section" aria-labelledby="media-script-title">
      <div className="section-inner media-script-heading">
        <p className="section-kicker">Material direction</p>
        <h2 id="media-script-title">The next video assets should prove the workflow in seconds.</h2>
      </div>
      <div className="section-inner media-script-grid">
        {MEDIA_SCRIPT_CARDS.map((item) => (
          <article className="media-script-card" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PrivacyIcon({ type }) {
  if (type === "lock") {
    return (
      <svg className="privacy-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path d="M10 14v-3.5a6 6 0 0 1 12 0V14" />
        <path d="M8 14h16v13H8z" />
        <path d="M16 19v4" />
      </svg>
    );
  }

  return (
    <svg className="privacy-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M16 4 25 8v7c0 6.1-3.5 10.4-9 13-5.5-2.6-9-6.9-9-13V8l9-4Z" />
      <path d="m11.5 16 3 3 6-7" />
    </svg>
  );
}

function PrivacyAppVisual() {
  return (
    <div className="privacy-app-visual" aria-label="Kastave app private waypoint preview">
      <div className="privacy-device-shell">
        <div className="privacy-device-top">
          <span>Kastave</span>
          <strong>Private map</strong>
        </div>
        <div className="privacy-map-screen">
          <span className="privacy-contour privacy-contour-one" />
          <span className="privacy-contour privacy-contour-two" />
          <span className="privacy-contour privacy-contour-three" />
          <span className="privacy-private-route" />
          <span className="privacy-waypoint privacy-waypoint-one">Drop-off</span>
          <span className="privacy-waypoint privacy-waypoint-two">Brush</span>
          <span className="privacy-boat-dot" />
        </div>
        <div className="privacy-map-card">
          <strong>Waypoint saved</strong>
          <span>Only you can see this spot.</span>
        </div>
        <div className="privacy-toggle-row">
          <span>Public feed</span>
          <strong>Off</strong>
        </div>
        <div className="privacy-toggle-row">
          <span>Share location</span>
          <strong>Off</strong>
        </div>
      </div>
    </div>
  );
}

function PrivacySection() {
  return (
    <section className="privacy-section" id="privacy" aria-labelledby="privacy-title">
      <div className="section-inner privacy-simple-layout">
        <h2 id="privacy-title">Your Privacy Comes First</h2>
        <div className="privacy-statement-list">
          {PRIVACY_STATEMENTS.map((item) => (
            <article className="privacy-statement" key={item.icon}>
              <PrivacyIcon type={item.icon} />
              <p>{item.body}</p>
            </article>
          ))}
        </div>
        <PrivacyAppVisual />
      </div>
    </section>
  );
}

function ReservationSection({ depositHref, onSubscribe, onWaitlist, onReserve, message }) {
  return (
    <section className="reservation-section" id="special-offers" aria-labelledby="reservation-title">
      <div className="section-inner package-offer-layout">
        <figure className="package-product-media">
          <img src={depositHeroImage} alt="Kastave scout boat being carried at a lakeshore" loading="lazy" decoding="async" />
        </figure>
        <article className="package-offer-card">
          <p className="section-kicker">Launching soon on Kickstarter</p>
          <h2 id="reservation-title">Kastave</h2>
          <p className="package-tagline">Your shoreline fishing scout.</p>
          <p className="package-offer-copy">
            {RESERVATION_OFFER.discountLabel}: sign up and reserve to lock {RESERVATION_OFFER.productPrice}, down from{" "}
            {RESERVATION_OFFER.regularPrice}.
          </p>
          <EmailForm
            id="reservation-email"
            source="reservation"
            onSubscribe={onSubscribe}
            buttonLabel="Sign up"
          />
          {message && <p className="form-message">{message}</p>}
          <a className="package-reserve-button" href={depositHref} onClick={onReserve}>
            Reserve for $1 <span aria-hidden="true">-&gt;</span>
          </a>
          <div className="package-includes" aria-label="Package includes">
            <h3>Package includes</h3>
            <ul>
              {PACKAGE_INCLUDES.map((item) => (
                <li key={item}>
                  <span>{item}</span>
                  <strong aria-hidden="true">✓</strong>
                </li>
              ))}
            </ul>
          </div>
          <div className="package-reservation-note">
            <p>
              This is a {RESERVATION_OFFER.depositAmount} founder reservation, not a finished-unit purchase.
            </p>
            <small>
              {PAYPAL_PAYMENT_SETUP_PENDING
                ? "Stripe is active now. PayPal appears after its live link is connected. No long checkout form here."
                : "Choose Stripe or PayPal on the deposit page. No long checkout form here."}
            </small>
          </div>
          <button className="text-link package-waitlist-button" type="button" onClick={onWaitlist}>
            Not ready to reserve? Join Early Access instead
          </button>
        </article>
      </div>
    </section>
  );
}

function EmailForm({ id = "email", source = "inline_form", onSubscribe, buttonLabel = "Join updates" }) {
  const [email, setEmail] = useState("");
  const [inputStarted, setInputStarted] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      trackEvent("lead_submit_failed", { source, reason: "empty_email" });
      return;
    }

    onSubscribe(trimmedEmail, source);
    setEmail("");
  };

  const updateEmail = (event) => {
    if (!inputStarted) {
      setInputStarted(true);
      trackEvent("email_input_started", { source, field: "email" });
    }
    setEmail(event.target.value);
  };

  return (
    <form className="email-form light-form" onSubmit={submit}>
      <label className="sr-only" htmlFor={id}>
        Email address
      </label>
      <input
        id={id}
        name="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        value={email}
        onChange={updateEmail}
        required
      />
      <button type="submit">{buttonLabel}</button>
    </form>
  );
}

function FAQ() {
  return (
    <section className="faq" id="faq" aria-label="Kastave questions">
      <div className="section-inner faq-inner">
        <h2>FAQ</h2>
        <div className="faq-list">
          {FAQS.map((item, index) => (
            <details
              key={item.question}
              open={index === 0}
              onToggle={(event) => {
                if (event.currentTarget.open) {
                  trackEvent("faq_opened", { question: item.question });
                }
              }}
            >
              <summary>{item.question}</summary>
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer({ onSubscribe, message }) {
  const trackFooterLink = (link, href) => {
    trackEvent("link_click", { link, source: "footer", href });
  };

  return (
    <footer className="site-footer" aria-labelledby="footer-title">
      <img className="footer-background" src={depositHeroImage} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      <div className="footer-scrim" />
      <div className="footer-hero">
        <a className="footer-brand" href="/" onClick={() => trackFooterLink("brand", "/")}>
          <img className="brand-logo" src={logoImage} alt={SITE.name} />
        </a>
        <h2 id="footer-title">Kastave</h2>
        <p>Your shoreline fishing scout.</p>
        <span>
          {RESERVATION_OFFER.discountLabel}: lock {RESERVATION_OFFER.productPrice}, down from{" "}
          {RESERVATION_OFFER.regularPrice}.
        </span>
        <EmailForm id="footer-email" source="footer" onSubscribe={onSubscribe} buttonLabel="Sign up" />
        {message && <p className="form-message footer-form-message">{message}</p>}
      </div>
      <div className="footer-bottom">
        <nav className="footer-legal-links" aria-label="Footer links">
          <a href="/privacy" onClick={() => trackFooterLink("privacy_policy", "/privacy")}>
            Privacy Policy
          </a>
          <span aria-hidden="true">·</span>
          <a href="/terms" onClick={() => trackFooterLink("terms_of_service", "/terms")}>
            Terms of Service
          </a>
          <span aria-hidden="true">·</span>
          <a
            href={`mailto:${SITE.contactEmail}`}
            onClick={() => trackFooterLink("contact_email", `mailto:${SITE.contactEmail}`)}
          >
            Contact
          </a>
        </nav>
        <small>
          {SITE.name} © 2026
          <br />
          For bank anglers who read before they cast.
        </small>
        <div className="footer-social-links" aria-label="Social links">
          <a
            href={SITE.facebookUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Kastave on Facebook"
            onClick={() => trackFooterLink("facebook", SITE.facebookUrl)}
          >
            <span aria-hidden="true">f</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

function ThanksPage({ onSubscribe, message }) {
  const providerLabel = getPaymentMethodLabel(getThanksPaymentProvider());

  return (
    <main className="thanks-page">
      <section className="thanks-card">
        <a className="brand thanks-brand" href="/">
          <img className="brand-logo" src={logoImage} alt={SITE.name} />
        </a>
        <p className="section-kicker">Reservation received</p>
        <h1>You're in the Kastave Bank Fishing Scout Co-Creation Program.</h1>
        <p>
          Your $1 reservation is received. Your $100 launch credit will be applied toward your
          first Kastave when early units become available.
        </p>
        <div className="thanks-next-steps">
          <h2>What happens after payment?</h2>
          <ol>
            {PAYMENT_AFTER_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <div className="thanks-email-card">
          <h2>Make sure we can contact you.</h2>
          <p>{providerLabel} may not share the best product-update email with Kastave.</p>
          <EmailForm id="thanks-email" source="thanks" onSubscribe={onSubscribe} buttonLabel="Join Early Access" />
          <p className="form-message">{message}</p>
        </div>
        <a className="text-link" href="/">
          Back to Kastave
        </a>
      </section>
    </main>
  );
}

function SetupDialog({ open, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="dialog-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="setup-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog">
          x
        </button>
        <p className="section-kicker">Link needed</p>
        <h2 id="setup-title">Add your live tools when accounts are ready.</h2>
        <p>
          Set the Vite environment variables for Stripe, PayPal, Beehiiv, and the survey URL. The page already has the
          correct buttons and event tracking hooks.
        </p>
        <button className="primary-button dialog-action" type="button" onClick={onClose}>
          Got it
        </button>
      </section>
    </div>
  );
}

export default App;
