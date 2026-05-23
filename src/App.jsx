import React, { useEffect, useState } from "react";
import {
  ANNOUNCEMENT,
  BANK_PAIN_POINTS,
  DEFAULT_PAYMENT_METHOD,
  FAQS,
  FEATURE_VISUALS,
  FEATURE_GROUPS,
  HERO,
  HIGHLIGHT_CAROUSEL,
  LANDING_PAIN_POINTS,
  OFFER_ITEMS,
  PAYMENT_AFTER_STEPS,
  PAYMENT_METHODS,
  PAYMENT_NOTE,
  PRIVACY_POINTS,
  PRODUCT_HIGHLIGHTS,
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
  recordPurchaseEvent,
  recordReservationIntent,
  recordWaitlistSignup,
} from "./supabaseBackend.js";
import heroImage from "../assets/kastave-new-hero.png";
import processImage from "../assets/kastave-new-process.png";
import recognitionImage from "../assets/kastave-new-recognition.png";
import terrainFeatureImage from "../assets/kastave-feature-3d-terrain.png";
import fishFeatureImage from "../assets/kastave-feature-fish-activity.png";
import waterFeatureImage from "../assets/kastave-feature-water-conditions.png";
import strategyFeatureImage from "../assets/kastave-feature-ai-strategy.png";

const featureImages = [terrainFeatureImage, fishFeatureImage, waterFeatureImage, strategyFeatureImage];

function getThanksPaymentProvider() {
  const params = new URLSearchParams(window.location.search);
  return params.get("provider") || (params.has("session_id") ? "stripe" : DEFAULT_PAYMENT_METHOD.key);
}

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [painCtaOpen, setPainCtaOpen] = useState(false);
  const [signupMessage, setSignupMessage] = useState("");
  const isThanksPage = window.location.pathname === "/thanks";

  useEffect(() => {
    initAnalytics();
  }, []);

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
      recordPurchaseEvent({
        eventId,
        amountCents: 100,
        currency: "USD",
        provider,
        source: "thanks_page",
      });
    }
  }, [isThanksPage]);

  useEffect(() => {
    if (sessionStorage.getItem("kastave_pain_cta_seen") === "true") {
      return undefined;
    }

    const timer = setTimeout(() => {
      setPainCtaOpen(true);
      sessionStorage.setItem("kastave_pain_cta_seen", "true");
      trackEvent("pain_point_cta_view");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const showReservationOptions = (source = "unknown") => {
    trackLeadIntent({ cta: "reserve_options", cta_location: source, source });
    const reservationSection = document.getElementById("special-offers");
    if (reservationSection) {
      reservationSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
    setDialogOpen(true);
  };

  const subscribe = (email, source = "inline_form") => {
    trackLeadIntent({ cta: "join_early_access_submit", cta_location: source, source });
    trackLead({
      source,
      cta: "join_early_access_submit",
      cta_location: source,
      content_name: "Kastave early access waitlist",
      lead_type: "email_waitlist",
    });
    recordWaitlistSignup(email, { source });

    if (SITE.beehiivFormUrl) {
      window.location.href = withUtm(SITE.beehiivFormUrl);
      return;
    }

    const subscribers = JSON.parse(localStorage.getItem("kastave_subscribers") || "[]");
    if (!subscribers.includes(email)) {
      subscribers.push(email);
      localStorage.setItem("kastave_subscribers", JSON.stringify(subscribers));
    }

    setSignupMessage("You're on the Kastave Bank Angler Scout Program list.");
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

  return (
    <>
      <AnnouncementBar />
      <SiteNav onWaitlist={() => focusWaitlist("nav")} onReserve={() => showReservationOptions("nav")} />
      <main>
        <Hero
          onSubscribe={(email) => subscribe(email, "hero")}
          onReserve={() => showReservationOptions("hero")}
          message={signupMessage}
        />
        <PainSection />
        <FeaturesSection />
        <PrivacySection />
        <ReservationSection
          onSubscribe={(email) => subscribe(email, "reservation")}
          onWaitlist={() => focusWaitlist("reservation")}
          onPayment={(providerKey) => reserveWithPayment(providerKey, "reservation")}
          message={signupMessage}
        />
        <FAQ />
      </main>
      <Footer />
      <CheckoutDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      <PainPointCta open={painCtaOpen} onClose={closePainCta} onSubmit={submitPainPoint} />
    </>
  );
}

function AnnouncementBar() {
  return <div className="announcement">{ANNOUNCEMENT}</div>;
}

function SiteNav({ onWaitlist, onReserve }) {
  const [open, setOpen] = useState(false);
  const navItems = ["Pain", "Features", "Privacy", "FAQ"];

  return (
    <header className="site-nav">
      <a
        className="brand dark-brand"
        href={SITE.domain}
        aria-label="Kastave home"
        onClick={() => trackEvent("link_click", { link: "brand", source: "nav", href: SITE.domain })}
      >
        <span className="brand-mark">K</span>
        <span>{SITE.name}</span>
      </a>
      <button className="hamburger" type="button" onClick={() => setOpen((value) => !value)} aria-label="Open menu">
        <span />
        <span />
      </button>
      <nav className={open ? "main-nav is-open" : "main-nav"} aria-label="Primary navigation">
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
        <button className="nav-reserve-button" type="button" onClick={onReserve}>
          Reserve for $1
        </button>
      </div>
    </header>
  );
}

function navHref(item) {
  const hrefs = {
    Pain: "#pain",
    Features: "#features",
    Privacy: "#privacy",
    FAQ: "#faq",
  };

  return hrefs[item] || `#${item.toLowerCase().replaceAll(" ", "-")}`;
}

function Hero({ onSubscribe, onReserve, message }) {
  return (
    <section className="hero commerce-hero" aria-labelledby="hero-title">
      <img className="hero-image" src={heroImage} alt="Kastave fish finder boat scanning a shoreline" />
      <div className="hero-scrim" />
      <div className="hero-scan-overlay" aria-hidden="true">
        <span className="scan-line scan-line-one" />
        <span className="scan-line scan-line-two" />
        <span className="scan-pin scan-pin-depth">drop-off</span>
        <span className="scan-pin scan-pin-cover">weed edge</span>
      </div>
      <div className="hero-content hero-centered">
        <p className="eyebrow">{HERO.eyebrow}</p>
        <h1 id="hero-title">{HERO.title}</h1>
        <p className="hero-copy">{HERO.body}</p>
        <div className="hero-offer-card" aria-label={`${RESERVATION_OFFER.depositAmount} reservation credit offer`}>
          <div className="hero-offer-icon" aria-hidden="true">
            <span className="ticket-cut ticket-cut-left" />
            <span className="ticket-cut ticket-cut-right" />
            <span>{RESERVATION_OFFER.depositAmount}</span>
          </div>
          <div className="hero-offer-copy">
            <strong>{RESERVATION_OFFER.title}</strong>
            <span>
              {RESERVATION_OFFER.creditAmount} launch credit toward the {RESERVATION_OFFER.productPrice} Kastave Scout.
            </span>
          </div>
        </div>
        <div className="hero-actions" id="reserve">
          <EmailForm id="hero-email" source="hero" onSubscribe={onSubscribe} buttonLabel="Join Early Access" />
          <button className="secondary-link hero-reserve-button" type="button" onClick={onReserve}>
            Reserve for $1
          </button>
        </div>
        <p className="form-message hero-form-message">{message}</p>
        <p className="microcopy">{HERO.note}</p>
      </div>
    </section>
  );
}

function PainSection() {
  return (
    <section className="pain-section" id="pain" aria-labelledby="pain-title">
      <div className="section-inner pain-grid">
        <div>
          <p className="section-kicker">Bank angler problem</p>
          <h2 id="pain-title">Stop guessing where to start.</h2>
        </div>
        <div className="pain-list">
          {LANDING_PAIN_POINTS.map((point) => (
            <div className="pain-item" key={point}>
              <span />
              <p>{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const activeFeature = FEATURE_VISUALS[activeFeatureIndex];
  const activeFeatureImage = featureImages[activeFeatureIndex];

  const showPreviousFeature = () => {
    setActiveFeatureIndex((index) => (index === 0 ? FEATURE_VISUALS.length - 1 : index - 1));
  };

  const showNextFeature = () => {
    setActiveFeatureIndex((index) => (index + 1) % FEATURE_VISUALS.length);
  };

  return (
    <section className="features-section" id="features" aria-labelledby="features-title">
      <div className="section-inner">
        <div className="section-heading compact-heading">
          <p className="section-kicker">Core capabilities</p>
          <h2 id="features-title">Built to find structure, fish zones, and a first-cast plan.</h2>
        </div>
        <div className="feature-carousel" aria-label="Kastave core capability carousel">
          <article className="feature-carousel-stage">
            <div className="feature-carousel-media">
              <img src={activeFeatureImage} alt={`${activeFeature.title} product feature visual`} />
              <span>{activeFeature.title}</span>
            </div>
            <div className="feature-carousel-copy">
              <p className="carousel-count">
                {String(activeFeatureIndex + 1).padStart(2, "0")} / {String(FEATURE_VISUALS.length).padStart(2, "0")}
              </p>
              <h3>{activeFeature.title}</h3>
              <p>{activeFeature.body}</p>
              <div className="feature-carousel-controls" aria-label="Feature carousel controls">
                <button type="button" onClick={showPreviousFeature} aria-label="Previous feature">
                  Prev
                </button>
                <button type="button" onClick={showNextFeature} aria-label="Next feature">
                  Next
                </button>
              </div>
            </div>
          </article>
          <div className="feature-carousel-tabs" role="tablist" aria-label="Select capability">
            {FEATURE_VISUALS.map((feature, index) => (
              <button
                aria-selected={activeFeatureIndex === index}
                className={activeFeatureIndex === index ? "is-active" : ""}
                key={feature.title}
                role="tab"
                type="button"
                onClick={() => setActiveFeatureIndex(index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {feature.title}
              </button>
            ))}
          </div>
        </div>
        <div className="feature-detail-grid" aria-label="Additional capability details">
          {FEATURE_GROUPS.map((group) => (
            <article className="feature-group" key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
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
            Save private waypoints and build your own fishing log. Nothing is shared unless you
            choose to share it.
          </p>
        </div>
        <div className="privacy-points">
          {PRIVACY_POINTS.map((point) => (
            <span key={point}>{point}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReservationSection({ onSubscribe, onWaitlist, onPayment, message }) {
  return (
    <section className="reservation-section" id="special-offers" aria-labelledby="reservation-title">
      <div className="section-inner reservation-heading">
        <p className="section-kicker">Early access</p>
        <h2 id="reservation-title">Help build the next tool for serious bank anglers.</h2>
      </div>
      <div className="section-inner reservation-options">
        <article className="reservation-card email-card">
          <span className="option-label">Option A</span>
          <h3>Email waitlist</h3>
          <p>Join early access and get product updates, test invites, and launch pricing.</p>
          <EmailForm
            id="reservation-email"
            source="reservation"
            onSubscribe={onSubscribe}
            buttonLabel="Join Early Access"
          />
          <p className="form-message">{message}</p>
        </article>
        <article className="reservation-card payment-card">
          <span className="option-label">Option B</span>
          <div className="payment-logo-row" aria-label="Stripe and PayPal payment options">
            {PAYMENT_METHODS.map((method) => (
              <span className={`payment-wordmark payment-provider-${method.key}`} key={method.key}>
                {method.label}
              </span>
            ))}
          </div>
          <h3>Reserve early for $1</h3>
          <p>Get first access updates plus early-bird pricing as the scout program opens.</p>
          <ul>
            {OFFER_ITEMS.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="payment-choice-grid" aria-label="Choose payment method">
            {PAYMENT_METHODS.map((method) => (
              <button
                className={`checkout-button payment-choice payment-choice-${method.key}`}
                type="button"
                onClick={() => onPayment(method.key)}
                key={method.key}
              >
                Pay with {method.label}
              </button>
            ))}
          </div>
          <p className="payment-after-note">{PAYMENT_NOTE}</p>
        </article>
      </div>
      <div className="section-inner reservation-secondary">
        <button className="text-link" type="button" onClick={onWaitlist}>
          Not ready to reserve? Join Early Access instead
        </button>
        <small>Production-in-progress. No finished-unit shipping claim yet.</small>
      </div>
    </section>
  );
}

const carouselImages = {
  hero: heroImage,
  process: processImage,
  recognition: recognitionImage,
};

function HighlightCarousel({ onReserve }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = HIGHLIGHT_CAROUSEL[activeIndex];
  const activeImage = carouselImages[activeItem.image] || recognitionImage;

  const move = (direction) => {
    setActiveIndex((current) => {
      const next = current + direction;
      if (next < 0) {
        return HIGHLIGHT_CAROUSEL.length - 1;
      }
      if (next >= HIGHLIGHT_CAROUSEL.length) {
        return 0;
      }
      return next;
    });
  };

  return (
    <div className="highlight-carousel" aria-label="Product highlight carousel">
      <div className="carousel-image-panel">
        <img src={activeImage} alt={activeItem.title} />
      </div>
      <div className="carousel-content-panel">
        <div className="carousel-copy" aria-live="polite">
          <span>{activeItem.step}</span>
          <h3>{activeItem.title}</h3>
          <p>{activeItem.body}</p>
          <button className="checkout-button carousel-buy-button" type="button" onClick={onReserve}>
            Reserve for $1
          </button>
        </div>
        <div className="carousel-controls">
          <button type="button" onClick={() => move(-1)} aria-label="Previous highlight">
            &lt;
          </button>
          <div className="carousel-dots" aria-label="Highlight position">
            {HIGHLIGHT_CAROUSEL.map((item, index) => (
              <button
                className={index === activeIndex ? "is-active" : ""}
                key={item.step}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show highlight ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
              />
            ))}
          </div>
          <button type="button" onClick={() => move(1)} aria-label="Next highlight">
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

function TrustBar() {
  return (
    <section className="trust-bar" aria-label="Trust signal">
      <strong>Early test signal</strong>
      <span aria-label="Transparent pretest">Open</span>
      <p>Seed-user reservations, field-test updates, and transparent production progress.</p>
    </section>
  );
}

function ScenarioSelector({ selected, onSelect }) {
  const activeScenario = SCENARIOS.find((scenario) => scenario.label === selected) || SCENARIOS[0];

  return (
    <section className="scenario-section" id="scout-program" aria-labelledby="scenario-title">
      <div className="section-inner">
        <div className="scenario-heading">
          <p className="section-kicker">Scout program fit</p>
          <h2 id="scenario-title">Where do you fish from the bank?</h2>
          <p>
            Pick the water you care about most. The program is built around real shoreline
            scouting problems, not generic boat electronics.
          </p>
        </div>
        <div className="scenario-grid" role="list" aria-label="Fishing scenarios">
          {SCENARIOS.map((scenario) => (
            <button
              className={selected === scenario.label ? "scenario-button is-active" : "scenario-button"}
              key={scenario.label}
              type="button"
              onClick={() => onSelect(scenario.label)}
            >
              {scenario.label}
            </button>
          ))}
        </div>
        <div className="scenario-readout" aria-live="polite">
          <strong>{activeScenario.label}</strong>
          <span>{activeScenario.detail}</span>
        </div>
      </div>
    </section>
  );
}

function ProductGrid({ onWaitlist }) {
  return (
    <section className="shop-section" id="products">
      <div className="section-heading">
        <p className="section-kicker">Flagship product</p>
        <h2>Best AI fish finders for bank water.</h2>
      </div>
      <div className="product-card-grid">
        {PRODUCTS.map((product, index) => (
          <article className="product-card" key={product.name}>
            <span className="sale-pill">{product.label}</span>
            <img src={index === 3 ? appImage : productImage} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.sub}</p>
            <div className="price-line">
              <s>{product.originalPrice}</s>
              <strong>{product.price}</strong>
            </div>
            <button type="button" onClick={onWaitlist}>
              Join waitlist
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function InteractiveProductVisual() {
  const [active, setActive] = useState(HOTSPOTS[0].label);
  const activeHotspot = HOTSPOTS.find((item) => item.label === active) || HOTSPOTS[0];

  return (
    <section className="interactive-product" id="flagship-product">
      <div className="section-inner two-column">
        <div>
          <p className="section-kicker">Explore the hardware</p>
          <h2>Built like outdoor gear, not a desk gadget.</h2>
          <p>
            Hover the product on desktop or tap a point on mobile to inspect the physical details
            that matter when you fish from the bank.
          </p>
          <div className="hotspot-readout">
            <strong>{activeHotspot.label}</strong>
            <span>{activeHotspot.detail}</span>
          </div>
        </div>
        <div className="hotspot-stage">
          <img src={valueImage} alt="Kastave product value visual" />
          {HOTSPOTS.map((spot) => (
            <button
              className={active === spot.label ? "hotspot is-active" : "hotspot"}
              key={spot.label}
              style={{ "--x": `${spot.x}%`, "--y": `${spot.y}%` }}
              type="button"
              onClick={() => setActive(spot.label)}
              onMouseEnter={() => setActive(spot.label)}
              aria-label={spot.label}
            >
              <span>{spot.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function PremiumApp({ onWaitlist, onSubscribe, message }) {
  return (
    <section className="premium-app" id="app">
      <img src={emailImage} alt="Kastave boat and app early access" />
      <div className="premium-copy">
        <p className="section-kicker">Premium Maps</p>
        <h2>Analyze 3D terrain and fish activity for prime spots.</h2>
        <p>
          Hardware and software work together: scan water, save routes, revisit productive zones,
          and build a smarter bank-fishing map over time.
        </p>
        <button className="primary-button buy-button" type="button" onClick={onWaitlist}>
          Join the premium waitlist
          <span>Early software updates</span>
        </button>
        <EmailForm id="premium-email" onSubscribe={(email) => onSubscribe(email, "premium_app")} />
        <p className="form-message">{message}</p>
      </div>
    </section>
  );
}

function ScoutComparison() {
  return (
    <section className="comparison-section" aria-labelledby="comparison-title">
      <div className="section-inner">
        <div className="section-heading">
          <p className="section-kicker">Scout first</p>
          <h2 id="comparison-title">Scout first. Stop guessing.</h2>
        </div>
        <div className="comparison-table" role="table" aria-label="Fishing blind compared with Kastave Scout Program">
          <div className="comparison-row comparison-header" role="row">
            <span role="columnheader">Factor</span>
            <span role="columnheader">Fishing Blind</span>
            <span role="columnheader">Kastave Scout Program</span>
          </div>
          {COMPARISON_ROWS.map((row) => (
            <div className="comparison-row" role="row" key={row.factor}>
              <strong role="cell">{row.factor}</strong>
              <span role="cell">{row.blind}</span>
              <span role="cell">{row.scout}</span>
            </div>
          ))}
        </div>
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

function ProcessVisual() {
  const [active, setActive] = useState(PROCESS_STEPS[0].label);

  return (
    <section className="process-section" id="how-it-works">
      <div className="section-heading">
        <p className="section-kicker">Video demo</p>
        <h2>See the scout workflow.</h2>
      </div>
      <div className="process-media">
        <img src={processImage} alt="Kastave Search Understand Cast process" />
        <button className="play-button" type="button" aria-label="Play product video">
          ▶
        </button>
      </div>
      <div className="process-grid">
        {PROCESS_STEPS.map((step) => (
          <article
            className={active === step.label ? "process-card is-active" : "process-card"}
            key={step.label}
            onMouseEnter={() => setActive(step.label)}
            onClick={() => setActive(step.label)}
          >
            <span>{step.label}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductHighlights({ onReserve }) {
  const [active, setActive] = useState(PRODUCT_HIGHLIGHTS[0].title);

  return (
    <section className="capabilities" id="highlights">
      <div className="section-inner two-column">
        <div className="capability-image">
          <img src={recognitionImage} alt="Kastave 3D underwater terrain recognition visual" />
        </div>
        <div>
          <p className="section-kicker">Product highlights</p>
          <h2>Portable scouting for bank anglers.</h2>
          <div className="capability-list">
            {PRODUCT_HIGHLIGHTS.map((capability) => (
              <button
                className={active === capability.title ? "capability-card is-active" : "capability-card"}
                key={capability.title}
                type="button"
                onMouseEnter={() => setActive(capability.title)}
                onClick={() => setActive(capability.title)}
              >
                <strong>{capability.title}</strong>
                <span>{capability.body}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <HighlightCarousel onReserve={onReserve} />
    </section>
  );
}

function Accessories() {
  return (
    <section className="accessories" id="accessories">
      <div className="section-heading">
        <p className="section-kicker">Planned kit add-ons</p>
        <h2>Gear concepts for the bank-ready kit.</h2>
      </div>
      <div className="accessory-grid">
        {ACCESSORIES.map((item) => (
          <article className="accessory-card" key={item.name}>
            <img src={productImage} alt={item.name} />
            <h3>{item.name}</h3>
            <strong>{item.price}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function Offer({ onPayment, message }) {
  return (
    <section className="offer" id="special-offers">
      <div className="offer-copy">
        <p className="section-kicker">Special offer</p>
        <h2>Reserve your scout program spot for $1.</h2>
        <p>
          This is a real non-refundable early reservation deposit for bank anglers who want
          Kastave to exist. It helps prioritize production decisions and includes a $100
          launch credit when early units become available.
        </p>
      </div>

      <div className="checkout-panel" aria-live="polite">
        <div className="payment-logo-row" aria-label="Stripe and PayPal payment options">
          {PAYMENT_METHODS.map((method) => (
            <span className={`payment-wordmark payment-provider-${method.key}`} key={method.key}>
              {method.label}
            </span>
          ))}
        </div>
        <div className="price-row">
          <span>$1</span>
          <small>non-refundable reservation</small>
        </div>
        <ul>
          {OFFER_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="payment-choice-grid" aria-label="Choose payment method">
          {PAYMENT_METHODS.map((method) => (
            <button
              className={`checkout-button payment-choice payment-choice-${method.key}`}
              type="button"
              onClick={() => onPayment(method.key)}
              key={method.key}
            >
              Pay with {method.label}
            </button>
          ))}
        </div>
        <p className="form-message">{message}</p>
      </div>
    </section>
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
          <span className="brand-mark">K</span>
          <span>{SITE.name}</span>
        </a>
        <p>
          {SITE.programName}: early access for serious bank anglers learning how to scan before
          they cast.
        </p>
      </div>
      <div className="footer-links">
        <a href="#pain" onClick={() => trackFooterLink("pain", "#pain")}>
          Pain
        </a>
        <a href="#features" onClick={() => trackFooterLink("features", "#features")}>
          Features
        </a>
        <a href="#special-offers" onClick={() => trackFooterLink("reserve", "#special-offers")}>
          Reserve
        </a>
        <a href="#faq" onClick={() => trackFooterLink("faq", "#faq")}>
          FAQ
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
          <span className="brand-mark">K</span>
          <span>{SITE.name}</span>
        </a>
        <p className="section-kicker">Reservation received</p>
        <h1>You're in the Kastave Bank Angler Scout Program.</h1>
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

function CheckoutDialog({ open, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="dialog-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog">
          x
        </button>
        <p className="section-kicker">Link needed</p>
        <h2 id="checkout-title">Add your live tools when accounts are ready.</h2>
        <p>
          Set the Vite environment variables for Stripe, PayPal, Beehiiv, and the survey URL. The
          page already has the correct buttons and event tracking hooks.
        </p>
        <button className="primary-button dialog-action" type="button" onClick={onClose}>
          Got it
        </button>
      </section>
    </div>
  );
}

export default App;
