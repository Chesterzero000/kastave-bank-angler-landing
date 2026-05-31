import React, { useEffect, useState } from "react";
import {
  ANNOUNCEMENT,
  BANK_PAIN_POINTS,
  CASTABLE_WORKFLOW,
  DEFAULT_PAYMENT_METHOD,
  FAQS,
  HERO,
  HOOK_VARIANTS,
  LANDING_PAIN_POINTS,
  PAYMENT_AFTER_STEPS,
  PAYMENT_METHODS,
  PRIVACY_POINTS,
  PROCESS_STEPS,
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
import {
  recordPainPointAnswer,
  recordReservationIntent,
  recordWaitlistSignup,
} from "./supabaseBackend.js";
import heroImage from "../assets/kastave-new-hero.jpg";
import logoImage from "../assets/kastave-logo-wordmark.png";
import processImage from "../assets/kastave-new-process.jpg";
import recognitionImage from "../assets/kastave-new-recognition.jpg";
import depositHeroImage from "../assets/kastave-deposit-hand-carry-product-match.jpg";
import appSonarImage from "../assets/kastave-app-sonar.jpg";
import productDetailImage from "../assets/kastave-product-detail.jpg";
import redditPondHasFishImage from "../assets/reddit-proof-pond-has-fish.png";
import redditSnagFrustrationImage from "../assets/reddit-proof-snag-frustration.png";
import redditStockedPondImage from "../assets/reddit-proof-stocked-pond.png";
import redditTrebleWeedsImage from "../assets/reddit-proof-treble-weeds.png";
import terrainFeatureImage from "../assets/kastave-feature-3d-terrain.jpg";
import waterFeatureImage from "../assets/kastave-feature-water-conditions.jpg";
import strategyFeatureImage from "../assets/kastave-feature-ai-strategy.jpg";
import audienceBankAnglerImage from "../assets/kastave-audience-bank-angler.jpg";
import audiencePondHopperImage from "../assets/kastave-audience-pond-hopper.jpg";
import audienceHiddenSnagImage from "../assets/kastave-audience-hidden-snag-first-person-v4.jpg";
import audienceCastableVsKastaveImage from "../assets/kastave-audience-castable-auto-scan-ui-v7.jpg";

const V2_PROOF_POINTS = [
  { value: "$1", label: "founder reservation" },
  { value: "$100", label: "launch credit" },
  { value: "3", label: "AI cast calls" },
  { value: "Private", label: "spot log by default" },
];

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
  { label: "Product type", value: "Autonomous bank-fishing scout boat" },
  { label: "Primary use", value: "Shoreline scan, 3D bottom read, cast-point planning" },
  { label: "Control modes", value: "Auto / Silent / Performance" },
  { label: "Core reads", value: "Depth, terrain change, water clues, snag risk, private spots" },
  { label: "App workflow", value: "Scan route, live map, 3 AI cast calls, private log" },
  { label: "Launch plan", value: "Coming soon on Kickstarter" },
  { label: "Target price", value: RESERVATION_OFFER.productPrice },
  { label: "Founder offer", value: `${RESERVATION_OFFER.depositAmount} deposit unlocks ${RESERVATION_OFFER.creditAmount} credit` },
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

const REDDIT_PAIN_PROOFS = [
  {
    title: "Unknown pond",
    image: redditPondHasFishImage,
    source: "https://www.reddit.com/r/FishingForBeginners/comments/1erghut/how_do_i_know_if_a_pond_has_fish/",
    alt: "Reddit post asking how to know if a pond has fish.",
  },
  {
    title: "Pressured stocked pond",
    image: redditStockedPondImage,
    source: "https://www.reddit.com/r/FishingForBeginners/comments/1emb79p/cant_catch_anything_on_stocked_pond/",
    alt: "Reddit post about not catching anything on a stocked pond.",
  },
  {
    title: "Weeds and treble hooks",
    image: redditTrebleWeedsImage,
    source: "https://www.reddit.com/r/FishingForBeginners/comments/1nwpaq3/how_would_you_fish_this/",
    alt: "Reddit comment about tall vegetation and not being able to run a trebled lure through it.",
  },
  {
    title: "Snags and lost lures",
    image: redditSnagFrustrationImage,
    source: "https://www.reddit.com/r/FishingForBeginners/comments/1mwkcd3/yeah_ive_about_had_it/",
    alt: "Reddit post about snapping a rod, losing lures, and feeling discouraged.",
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
    body: `Your ${RESERVATION_OFFER.depositAmount} reservation unlocks ${RESERVATION_OFFER.creditAmount} launch credit toward your first Kastave.`,
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

const DEPOSIT_FAQS = [
  {
    question: "Is this the full Kastave price?",
    answer: `No. This is a ${RESERVATION_OFFER.depositAmount} founder reservation, not a finished-unit purchase. The target product price is ${RESERVATION_OFFER.productPrice}.`,
  },
  {
    question: "What do I get for $1?",
    answer: `You reserve a founder spot and unlock ${RESERVATION_OFFER.creditAmount} launch credit toward your first Kastave if you buy at launch.`,
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
    answer: "Yes. The page keeps both routes simple: credit card through Stripe, or PayPal checkout.",
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
      `If you later buy Kastave at launch, the reservation is intended to unlock ${RESERVATION_OFFER.creditAmount} launch credit toward your first unit.`,
      `The current estimated product price is ${RESERVATION_OFFER.productPrice}. Final pricing, specifications, accessories, availability, launch date, and campaign details may change.`,
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
  const [painCtaOpen, setPainCtaOpen] = useState(false);
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

  useEffect(() => {
    if (isThanksPage || isDepositPage || isPrivacyPage || isTermsPage) {
      return undefined;
    }

    if (sessionStorage.getItem("kastave_pain_cta_seen") === "true") {
      return undefined;
    }

    const timer = setTimeout(() => {
      setPainCtaOpen(true);
      sessionStorage.setItem("kastave_pain_cta_seen", "true");
      trackEvent("pain_point_cta_view");
    }, 5000);

    return () => clearTimeout(timer);
  }, [isDepositPage, isPrivacyPage, isTermsPage, isThanksPage]);

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

  const submitPainPoint = ({ painPoint, customAnswer }) => {
    trackEvent("pain_point_submit", { painPoint, hasCustomAnswer: Boolean(customAnswer) });
    recordPainPointAnswer({ painPoint, customAnswer });
    const answers = JSON.parse(localStorage.getItem("kastave_pain_points") || "[]");
    answers.push({
      painPoint,
      customAnswer,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("kastave_pain_points", JSON.stringify(answers));
    setPainCtaOpen(false);
    focusWaitlist("pain_point_cta");
  };

  const closePainCta = () => {
    trackEvent("pain_point_cta_close");
    setPainCtaOpen(false);
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
        <LaunchOfferBar
          depositHref={withUtm("/deposit")}
          onWaitlist={() => focusWaitlist("launch_offer_bar")}
          onReserve={(event) => openDepositPage("launch_offer_bar", event)}
        />
        <CastOptionsSection />
        <AudienceSection />
        <AppExperienceSection />
        <ProductSpecsSection depositHref={withUtm("/deposit")} onReserve={(event) => openDepositPage("specs", event)} />
        <MediaScriptSection />
        <HowItWorksSection />
        <CastableComparisonSection />
        <PainSection />
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
      <Footer />
      <SetupDialog open={setupDialogOpen} onClose={() => setSetupDialogOpen(false)} />
      <PainPointCta open={painCtaOpen} onClose={closePainCta} onSubmit={submitPainPoint} />
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
                {RESERVATION_OFFER.creditAmount} launch credit toward the {RESERVATION_OFFER.productPrice} Kastave
                Scout.
              </span>
            </div>
          </div>
        )}
        <p className="hero-signup-copy">Sign up and reserve to get {RESERVATION_OFFER.creditAmount} launch credit.</p>
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

function LaunchOfferBar({ depositHref, onWaitlist, onReserve }) {
  return (
    <section className="launch-offer-bar" aria-label="Kastave founder reservation offer">
      <div className="launch-offer-inner">
        <div className="launch-offer-copy">
          <p className="launch-mini-status">
            <span>Coming soon</span>
            <small aria-hidden="true">·</small>
            <em>Kickstarter</em>
          </p>
          <strong>$1 deposit now. $100 credit later.</strong>
        </div>
        <div className="launch-proof-row" aria-label="Founder offer highlights">
          {V2_PROOF_POINTS.map((point) => (
            <div className="launch-proof-pill" key={point.label}>
              <strong>{point.value}</strong>
              <span>{point.label}</span>
            </div>
          ))}
        </div>
        <div className="launch-offer-actions">
          <button type="button" className="launch-email-button" onClick={onWaitlist}>
            Join Early Access
          </button>
          <a className="launch-reserve-button" href={depositHref} onClick={onReserve}>
            Reserve for $1
          </a>
        </div>
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
            <strong>{RESERVATION_OFFER.creditAmount}</strong> Credit Later
          </h1>
          <p className="deposit-lock-label">Founder launch credit</p>
          <div className="deposit-lock-price" aria-label="Kastave launch credit">
            <strong>{RESERVATION_OFFER.creditAmount}</strong>
            <span>launch credit</span>
          </div>
          <p className="deposit-price-note">
            Estimated product price: {RESERVATION_OFFER.productPrice}. This is a reservation credit, not the full product
            price.
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
        <p>with {RESERVATION_OFFER.depositAmount} deposit</p>
        <div className="deposit-mondo-payment-row" aria-label="Choose payment method">
          {PAYMENT_METHODS.map((method) => (
            <button
              className={`deposit-mondo-pay-button deposit-mondo-pay-${method.key}`}
              type="button"
              onClick={() => onPayment(method.key)}
              key={method.key}
            >
              {method.key === "stripe" ? "Credit Card" : method.label} <span aria-hidden="true">-&gt;</span>
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
            <span>Secure Stripe or PayPal checkout.</span>
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
  const scrollAudience = (direction) => {
    const track = document.getElementById("audience-track");
    if (!track) {
      return;
    }

    track.scrollBy({ left: direction * track.clientWidth * 0.82, behavior: "smooth" });
    trackEvent("audience_carousel_scroll", { direction: direction > 0 ? "next" : "previous" });
  };

  return (
    <section className="audience-section" id="audience" aria-labelledby="audience-title">
      <div className="audience-inner">
        <h2 className="audience-heading" id="audience-title">
          Who is Kastave For
        </h2>
        <div className="audience-card-row" id="audience-track" aria-label="Kastave target anglers">
          {TARGET_AUDIENCES.map((audience) => (
            <article className={`audience-card audience-card-${audience.animation}`} key={audience.title}>
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
          ))}
        </div>
        <div className="audience-controls" aria-label="Audience carousel controls">
          <button type="button" onClick={() => scrollAudience(-1)} aria-label="Previous audience">
            &lt;
          </button>
          <button type="button" onClick={() => scrollAudience(1)} aria-label="Next audience">
            &gt;
          </button>
        </div>
      </div>
    </section>
  );
}

function AppExperienceSection() {
  const [activeModeKey, setActiveModeKey] = useState(APP_MODES[0].key);
  const activeMode = APP_MODES.find((mode) => mode.key === activeModeKey) || APP_MODES[0];
  const activeModeIndex = APP_MODES.findIndex((mode) => mode.key === activeMode.key);
  const activeModeTabId = `app-mode-tab-${activeMode.key}`;

  const selectAppMode = (modeKey) => {
    setActiveModeKey(modeKey);
    trackEvent("app_mode_preview", { mode: modeKey });
  };

  const handleModeKeyDown = (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();

    let nextIndex = activeModeIndex;
    if (event.key === "ArrowLeft") {
      nextIndex = (activeModeIndex - 1 + APP_MODES.length) % APP_MODES.length;
    }
    if (event.key === "ArrowRight") {
      nextIndex = (activeModeIndex + 1) % APP_MODES.length;
    }
    if (event.key === "Home") {
      nextIndex = 0;
    }
    if (event.key === "End") {
      nextIndex = APP_MODES.length - 1;
    }

    selectAppMode(APP_MODES[nextIndex].key);
  };

  return (
    <section className="app-ui-section" id="app-ui" aria-labelledby="app-ui-title">
      <div className="section-inner app-ui-layout">
        <div className="app-ui-copy">
          <p className="section-kicker">Kastave app UI</p>
          <h2 id="app-ui-title">Scan mode, cast calls, and private spots in one fishing screen.</h2>
          <p>
            The app should feel like a fishing tool, not a raw sonar puzzle. Pick the boat behavior, watch the scan
            path, then choose the first cast from a clean map.
          </p>
          <div className="mode-tab-row" role="tablist" aria-label="Kastave boat modes">
            {APP_MODES.map((mode) => (
              <button
                className={activeMode.key === mode.key ? "is-active" : ""}
                id={`app-mode-tab-${mode.key}`}
                key={mode.key}
                type="button"
                role="tab"
                aria-selected={activeMode.key === mode.key}
                aria-controls="app-mode-panel"
                tabIndex={activeMode.key === mode.key ? 0 : -1}
                onClick={() => selectAppMode(mode.key)}
                onKeyDown={handleModeKeyDown}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <article
            className={`app-mode-card app-mode-${activeMode.key}`}
            id="app-mode-panel"
            role="tabpanel"
            aria-labelledby={activeModeTabId}
          >
            <span>{activeMode.title}</span>
            <p>{activeMode.body}</p>
            <div>
              {activeMode.metrics.map((metric) => (
                <strong key={metric}>{metric}</strong>
              ))}
            </div>
          </article>
        </div>
        <div className="app-ui-visual" aria-label="Kastave mobile app interface concept">
          <div className={`phone-shell phone-mode-${activeMode.key}`}>
            <div className="phone-camera" aria-hidden="true" />
            <div className="phone-screen">
              <div className="app-topbar">
                <span>Kastave</span>
                <strong>{activeMode.label}</strong>
              </div>
              <div className="app-status-strip">
                <span>{activeMode.status}</span>
                <strong>{activeMode.action}</strong>
              </div>
              <div className="lake-map">
                <span className="map-contour map-contour-one" />
                <span className="map-contour map-contour-two" />
                <span className="map-contour map-contour-three" />
                <span className="map-route" />
                <span className="map-scan-fan" />
                <span className="map-boat" />
                <span className="cast-pin cast-pin-safe" />
                <span className="cast-pin cast-pin-structure" />
                <span className="cast-pin cast-pin-risk" />
              </div>
              <div className="app-readout-grid">
                {activeMode.readouts.map((readout) => (
                  <span key={readout.label}>
                    {readout.label}
                    <strong>{readout.value}</strong>
                  </span>
                ))}
              </div>
              <div className="cast-call-list">
                <span>Safe</span>
                <span>Structure</span>
                <span>Risk / Reward</span>
              </div>
            </div>
          </div>
          <img src={appSonarImage} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="how-section" id="how-it-works" aria-labelledby="how-title">
      <div className="section-inner how-layout">
        <div className="how-media">
          <img
            src={processImage}
            alt="Kastave workflow from bank scan to cast choice"
            loading="lazy"
            decoding="async"
          />
          <div className="how-media-label">Deploy / Scan / 3D Read / Choose Cast</div>
        </div>
        <div className="how-copy">
          <p className="section-kicker">How it works</p>
          <h2 id="how-title">From unknown bank water to a first-cast plan.</h2>
          <div className="how-steps">
            {PROCESS_STEPS.map((step) => (
              <article className="how-step" key={step.label}>
                <span>{step.label}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductSpecsSection({ depositHref, onReserve }) {
  return (
    <section className="product-specs-section" id="specs" aria-labelledby="specs-title">
      <div className="section-inner specs-layout">
        <div className="specs-media">
          <img src={productDetailImage} alt="Kastave scout boat product detail" loading="lazy" decoding="async" />
          <div className="specs-media-badges" aria-label="Kastave product pillars">
            <span>Auto scan</span>
            <span>3D bottom</span>
            <span>Private log</span>
          </div>
        </div>
        <div className="specs-copy">
          <p className="section-kicker">Product details</p>
          <h2 id="specs-title">A bank-fishing scout built around the first cast.</h2>
          <p>
            These are launch-positioning specs for the v2 landing page. Exact battery, range, sensor package, and
            waterproof ratings should be finalized after field testing.
          </p>
          <div className="spec-table" aria-label="Kastave product specifications">
            {PRODUCT_SPECS.map((spec) => (
              <div className="spec-row" key={spec.label}>
                <span>{spec.label}</span>
                <strong>{spec.value}</strong>
              </div>
            ))}
          </div>
          <a className="specs-reserve-button" href={depositHref} onClick={onReserve}>
            Reserve founder credit
          </a>
        </div>
      </div>
    </section>
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

function CastableComparisonSection() {
  return (
    <section
      className="castable-comparison-section"
      id="castable-comparison"
      aria-labelledby="castable-comparison-title"
    >
      <div className="section-inner castable-heading">
        <p className="section-kicker">Workflow comparison</p>
        <h2 id="castable-comparison-title">{CASTABLE_WORKFLOW.title}</h2>
        <p>{CASTABLE_WORKFLOW.body}</p>
      </div>
      <div className="section-inner workflow-grid">
        <WorkflowCard tone="castable" workflow={CASTABLE_WORKFLOW.castable} />
        <WorkflowCard tone="kastave" workflow={CASTABLE_WORKFLOW.kastave} />
      </div>
    </section>
  );
}

function WorkflowCard({ tone, workflow }) {
  return (
    <article className={`workflow-card workflow-card-${tone}`}>
      <h3>{workflow.title}</h3>
      <ol>
        {workflow.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </article>
  );
}

function PainSection() {
  const [activeProof, setActiveProof] = useState(null);

  const openProof = (proof, painPoint) => {
    setActiveProof({ ...proof, painPoint });
    trackEvent("pain_reddit_proof_open", {
      proof: proof.title.toLowerCase().replace(/\s+/g, "_"),
      href: proof.source,
    });
  };

  return (
    <section className="pain-section" id="pain" aria-labelledby="pain-title">
      <div className="section-inner pain-grid">
        <div>
          <p className="section-kicker">Bank angler problem</p>
          <h2 id="pain-title">Stop guessing where to start.</h2>
        </div>
        <div className="pain-card-grid" aria-label="Reddit-backed pain point cards">
          {REDDIT_PAIN_PROOFS.map((proof, index) => (
            <button
              className="pain-evidence-card"
              key={proof.title}
              type="button"
              onClick={() => openProof(proof, LANDING_PAIN_POINTS[index])}
            >
              <div className="pain-evidence-copy">
                <span>Reddit proof</span>
                <p>{LANDING_PAIN_POINTS[index]}</p>
              </div>
              <div className="pain-proof-preview">
                <img src={proof.image} alt={proof.alt} loading="lazy" decoding="async" />
              </div>
              <span className="pain-proof-action">View comment detail</span>
            </button>
          ))}
        </div>
      </div>
      <PainEvidenceDialog proof={activeProof} onClose={() => setActiveProof(null)} />
    </section>
  );
}

function PainEvidenceDialog({ proof, onClose }) {
  useEffect(() => {
    if (!proof) {
      return undefined;
    }

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [proof, onClose]);

  if (!proof) {
    return null;
  }

  const linkName = proof.title.toLowerCase().replace(/\s+/g, "_");

  return (
    <div className="dialog-backdrop pain-proof-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="pain-proof-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pain-proof-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close Reddit proof detail">
          x
        </button>
        <div className="pain-proof-dialog-copy">
          <p className="section-kicker">Reddit proof</p>
          <h3 id="pain-proof-dialog-title">{proof.painPoint}</h3>
          <a
            className="text-link"
            href={proof.source}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              trackEvent("link_click", {
                link: linkName,
                source: "pain_reddit_detail",
                href: proof.source,
              })
            }
          >
            Open original Reddit thread
          </a>
        </div>
        <div className="pain-proof-dialog-image">
          <img src={proof.image} alt={proof.alt} loading="lazy" decoding="async" />
        </div>
      </section>
    </div>
  );
}

function PrivacyAppVisual() {
  return (
    <figure className="privacy-app-visual" aria-label="Kastave app screen saving a private fishing waypoint">
      <div className="privacy-app-topbar">
        <span>Private Map</span>
        <strong>Only you</strong>
      </div>
      <div className="privacy-map-screen">
        <span className="privacy-map-shore" />
        <span className="privacy-map-contour privacy-contour-one" />
        <span className="privacy-map-contour privacy-contour-two" />
        <span className="privacy-map-contour privacy-contour-three" />
        <span className="privacy-route-line" />
        <span className="privacy-waypoint privacy-waypoint-primary">
          <strong>Saved</strong>
        </span>
        <span className="privacy-waypoint privacy-waypoint-secondary" />
        <span className="privacy-waypoint privacy-waypoint-third" />
        <div className="privacy-save-card">
          <span>Waypoint saved</span>
          <strong>North grass edge</strong>
          <small>Private by default</small>
        </div>
      </div>
      <figcaption>
        <strong>Private waypoint log</strong>
        <span>Save fishable structure, notes, and return spots without posting them to a public feed.</span>
      </figcaption>
    </figure>
  );
}

function PrivacySection() {
  return (
    <section className="privacy-section" id="privacy" aria-labelledby="privacy-title">
      <div className="section-inner privacy-layout">
        <div>
          <p className="section-kicker">Private maps</p>
          <h2 id="privacy-title">Your spots stay yours.</h2>
          <p>
            Save private waypoints and build your own exploration log. Kastave is not a public spot
            feed, and we do not sell your spots. Sharing is your choice.
          </p>
        </div>
        <div className="privacy-visual-stack">
          <PrivacyAppVisual />
          <div className="privacy-points">
            {PRIVACY_POINTS.map((point) => (
              <span key={point}>{point}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReservationSection({ depositHref, onSubscribe, onWaitlist, onReserve, message }) {
  return (
    <section className="reservation-section" id="special-offers" aria-labelledby="reservation-title">
      <div className="section-inner reservation-heading">
        <p className="section-kicker">Founder access</p>
        <h2 id="reservation-title">Join the list. Reserve the credit when you are ready.</h2>
      </div>
      <div className="section-inner reservation-options">
        <article className="reservation-card email-card">
          <span className="option-label">Email</span>
          <h3>Get launch updates</h3>
          <p>Field tests, app progress, and Kickstarter timing.</p>
          <EmailForm
            id="reservation-email"
            source="reservation"
            onSubscribe={onSubscribe}
            buttonLabel="Sign up"
          />
          <p className="form-message">{message}</p>
        </article>
        <article className="reservation-card payment-card">
          <span className="option-label">Deposit</span>
          <div className="payment-logo-row" aria-label="Stripe and PayPal payment options">
            {PAYMENT_METHODS.map((method) => (
              <span className={`payment-wordmark payment-provider-${method.key}`} key={method.key}>
                {method.label}
              </span>
            ))}
          </div>
          <h3>$1 today. $100 credit later.</h3>
          <p>Secure your founder record through Stripe or PayPal.</p>
          <p className="reservation-clarity">{RESERVATION_OFFER.body}</p>
          <a className="checkout-button payment-choice reservation-deposit-button" href={depositHref} onClick={onReserve}>
            Reserve for $1 <span aria-hidden="true">-&gt;</span>
          </a>
          <p className="payment-after-note">Choose Stripe or PayPal on the deposit page. No long checkout form here.</p>
        </article>
      </div>
      <div className="section-inner reservation-secondary">
        <button className="text-link" type="button" onClick={onWaitlist}>
          Not ready to reserve? Join Early Access instead
        </button>
        <small>Production-in-progress. This is not a finished-unit purchase or shipping claim yet.</small>
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
      <div className="section-inner">
        <p className="section-kicker">FAQ</p>
        <h2>Clear answers before early access.</h2>
        <div className="faq-list">
          {FAQS.map((item) => (
            <details
              key={item.question}
              onToggle={(event) => {
                if (event.currentTarget.open) {
                  trackEvent("faq_opened", { question: item.question });
                }
              }}
            >
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const trackFooterLink = (link, href) => {
    trackEvent("link_click", { link, source: "footer", href });
  };

  return (
    <footer className="site-footer">
      <div>
        <a className="brand" href="/" onClick={() => trackFooterLink("brand", "/")}>
          <img className="brand-logo" src={logoImage} alt={SITE.name} />
        </a>
        <p>
          {SITE.programName}: early access for bank anglers scouting unknown water before they cast.
        </p>
      </div>
      <div className="footer-links">
        <a href="#cast-options" onClick={() => trackFooterLink("cast_options", "#cast-options")}>
          Highlights
        </a>
        <a href="#audience" onClick={() => trackFooterLink("audience", "#audience")}>
          Who it's for
        </a>
        <a href="#app-ui" onClick={() => trackFooterLink("app_ui", "#app-ui")}>
          App
        </a>
        <a href="#specs" onClick={() => trackFooterLink("specs", "#specs")}>
          Specs
        </a>
        <a href="#castable-comparison" onClick={() => trackFooterLink("comparison", "#castable-comparison")}>
          Compare
        </a>
        <a href="#pain" onClick={() => trackFooterLink("proof", "#pain")}>
          Proof
        </a>
        <a href="#special-offers" onClick={() => trackFooterLink("reserve", "#special-offers")}>
          Reserve
        </a>
        <a href="#faq" onClick={() => trackFooterLink("faq", "#faq")}>
          FAQ
        </a>
        <a href="/privacy" onClick={() => trackFooterLink("privacy_policy", "/privacy")}>
          Privacy Policy
        </a>
        <a href="/terms" onClick={() => trackFooterLink("terms_of_service", "/terms")}>
          Terms of Service
        </a>
      </div>
      <div>
        <strong>Transparent pretest</strong>
        <small>Production-in-progress. No finished-unit shipping claim yet.</small>
        <a
          className="footer-contact"
          href={`mailto:${SITE.contactEmail}`}
          onClick={() => trackFooterLink("contact_email", `mailto:${SITE.contactEmail}`)}
        >
          Contact: {SITE.contactEmail}
        </a>
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

function PainPointCta({ open, onClose, onSubmit }) {
  const [selected, setSelected] = useState(BANK_PAIN_POINTS[0]);
  const [customAnswer, setCustomAnswer] = useState("");

  if (!open) {
    return null;
  }

  const submit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    onSubmit({
      painPoint: formData.get("pain-point") || selected,
      customAnswer: String(formData.get("custom-answer") || customAnswer).trim(),
    });
  };

  return (
    <div className="pain-cta-backdrop" role="presentation">
      <section className="pain-cta-card" role="dialog" aria-modal="true" aria-labelledby="pain-cta-title">
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close pain point question">
          x
        </button>
        <p className="section-kicker">Quick question</p>
        <h2 id="pain-cta-title">What is your biggest pain point when fishing from the bank?</h2>
        <form onSubmit={submit}>
          <div className="pain-options">
            {BANK_PAIN_POINTS.map((point) => (
              <label className={selected === point ? "is-selected" : ""} key={point}>
                <input
                  type="radio"
                  name="pain-point"
                  value={point}
                  checked={selected === point}
                  onChange={() => setSelected(point)}
                />
                <span>{point}</span>
              </label>
            ))}
          </div>
          <label className="custom-answer">
            <span>Other / custom answer</span>
            <textarea
              name="custom-answer"
              value={customAnswer}
              onChange={(event) => setCustomAnswer(event.target.value)}
              placeholder="Tell us what slows you down on the bank..."
              rows="3"
            />
          </label>
          <div className="pain-cta-actions">
            <button className="checkout-button" type="submit">
              Submit and join Early Access
            </button>
            <button className="text-link" type="button" onClick={onClose}>
              Skip for now
            </button>
          </div>
        </form>
      </section>
    </div>
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
