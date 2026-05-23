const STRIPE_PAYMENT_LINK =
  import.meta.env.VITE_STRIPE_PAYMENT_LINK || "https://buy.stripe.com/9B69AVbpieTIcPx9rBd7q00";
const PAYPAL_PAYMENT_LINK =
  import.meta.env.VITE_PAYPAL_PAYMENT_LINK || "https://www.paypal.com/ncp/payment/6W9PTBNB267ZW";

export const PAYMENT_METHODS = [
  STRIPE_PAYMENT_LINK
    ? {
        key: "stripe",
        label: "Stripe",
        paymentLink: STRIPE_PAYMENT_LINK,
        receiptNote:
          "After Stripe payment, Stripe sends your receipt. If Stripe does not redirect automatically, return to Kastave and join the email list so we can match updates to you.",
      }
    : null,
  PAYPAL_PAYMENT_LINK
    ? {
        key: "paypal",
        label: "PayPal",
        paymentLink: PAYPAL_PAYMENT_LINK,
        receiptNote:
          "After PayPal payment, PayPal sends your receipt. If PayPal does not redirect automatically, return to Kastave and join the email list so we can match updates to you.",
      }
    : null,
].filter(Boolean);

export const DEFAULT_PAYMENT_METHOD = PAYMENT_METHODS[0] || {
  key: "payment",
  label: "Payment",
  paymentLink: "",
  receiptNote: "Choose a payment method to reserve your early access spot.",
};

export const PAYMENT_PROVIDER = DEFAULT_PAYMENT_METHOD;

export function getPaymentMethodLabel(providerKey) {
  return PAYMENT_METHODS.find((method) => method.key === providerKey)?.label || DEFAULT_PAYMENT_METHOD.label;
}

export const SITE = {
  name: "Kastave",
  programName: "Kastave Bank Angler Scout Program",
  domain: "https://kastave.com",
  contactEmail: "Kastave@proton.me",
  priceRange: "$600-$1,000 target product price",
  productPrice: "$600-$1,000",
  stripePaymentLink: STRIPE_PAYMENT_LINK,
  paypalPaymentLink: PAYPAL_PAYMENT_LINK,
  reservationPaymentLink: DEFAULT_PAYMENT_METHOD.paymentLink,
  paymentProvider: DEFAULT_PAYMENT_METHOD.key,
  beehiivFormUrl: import.meta.env.VITE_BEEHIIV_FORM_URL || "",
  surveyUrl: import.meta.env.VITE_SURVEY_URL || "",
};

export const ANNOUNCEMENT =
  "Early access for serious bank anglers: join updates or reserve a $1 spot.";

export const HERO = {
  eyebrow: "Kastave Bank Angler Scout Program",
  title: "Scan before you cast.",
  body: "A smarter way for serious bank anglers to read unknown water, find structure, and make the first cast with a plan.",
  note: "Estimated product price: $600-$1,000. Early reservations help prioritize the first production run.",
};

export const RESERVATION_OFFER = {
  depositAmount: "$1",
  creditAmount: "$100",
  productPrice: "$600-$1,000",
  title: "Pay $1 today. Get $100 off Kastave.",
  body: "Your non-refundable early reservation is applied as a launch credit toward your first Kastave.",
};

export const BANK_PAIN_POINTS = [
  "Unknown water takes too long to figure out",
  "I cannot read structure from shore",
  "I do not know where fish are holding",
  "Sonar data is hard to turn into a fishing plan",
  "My first cast is mostly guessing",
];

export const LANDING_PAIN_POINTS = [
  "Unknown water takes time to figure out",
  "Bank anglers do not have boat electronics",
  "Structure matters, but it is hard to read from shore",
  "Sonar data is useful only if you know what it means",
];

export const FEATURE_GROUPS = [
  {
    title: "Find structure",
    items: ["water depth", "drop-off", "weed edge", "brush pile", "hard bottom", "soft bottom"],
  },
  {
    title: "Find fish zones",
    items: ["fish layer", "active zones", "baitfish signals"],
  },
  {
    title: "Get a plan",
    items: ["where to cast", "how deep to fish", "what bait type to try", "when to move"],
  },
  {
    title: "Save private map",
    items: ["private waypoints", "fishing log", "personal notes"],
  },
  {
    title: "Learn faster",
    items: ["AI explains sonar in plain fishing language"],
  },
];

export const PRIVACY_POINTS = ["Private by default", "No public spot burning", "User controls sharing"];

export const TRUST = {
  rating: "4.3 / 5 target launch benchmark",
  note: "Seed-user reservations, field-test updates, and transparent production progress.",
};

export const SCENARIOS = [
  {
    label: "Ponds",
    detail: "Scout shallow shelves, soft bottom, and small cover before you commit your first cast.",
  },
  {
    label: "Reservoir Banks",
    detail: "Find contour changes, hard transitions, and high-probability stretches from shore.",
  },
  {
    label: "Riprap",
    detail: "Read depth breaks and rock edges instead of guessing where bait and bass are holding.",
  },
  {
    label: "Grass Edges",
    detail: "Map the outside edge, openings, and pockets before working a long bank blind.",
  },
  {
    label: "Docks & Laydowns",
    detail: "Inspect shade, limbs, posts, and nearby depth so your first cast has a reason.",
  },
  {
    label: "Unknown Public Access",
    detail: "Scout unfamiliar water quickly and decide whether the spot deserves more time.",
  },
];

export const COMPARISON_ROWS = [
  {
    factor: "Depth",
    blind: "Guess from bank slope and visible clues",
    scout: "Build a shoreline scan plan before casting",
  },
  {
    factor: "Cover",
    blind: "Fish what you can see above the surface",
    scout: "Map structure targets below the surface",
  },
  {
    factor: "Fish Activity",
    blind: "Rely on timing, luck, and second-hand reports",
    scout: "Watch for activity signals that shape the route",
  },
  {
    factor: "First Cast",
    blind: "Start with instinct and adjust after misses",
    scout: "Choose a higher-confidence target first",
  },
];

export const PRODUCTS = [
  {
    name: "Kastave Scout",
    label: "Waitlist open",
    originalPrice: "",
    price: "$600-$1,000",
    sub: "$1 reservation unlocks a $100 launch credit",
  },
];

export const ACCESSORIES = [
  { name: "Waterproof Carry Case", price: "Planned add-on" },
  { name: "Battery Pack", price: "Planned add-on" },
  { name: "Bank Launch Tether", price: "Planned add-on" },
  { name: "Protective Hull Cover", price: "Planned add-on" },
  { name: "Phone Mount Kit", price: "Planned add-on" },
  { name: "Fast Charger", price: "Planned add-on" },
];

export const HOTSPOTS = [
  {
    label: "Carry handle",
    detail: "Integrated grip for bank missions and quick shoreline moves.",
    x: 54,
    y: 21,
  },
  {
    label: "Status light bar",
    detail: "Clear signal feedback for power, GPS, sonar, and connection state.",
    x: 36,
    y: 44,
  },
  {
    label: "Power button",
    detail: "One-touch startup designed for wet hands or gloves.",
    x: 50,
    y: 35,
  },
  {
    label: "Sonar module",
    detail: "High-clarity imaging for depth, terrain, fish activity, and cover.",
    x: 50,
    y: 73,
  },
  {
    label: "Protected propulsion",
    detail: "Guarded thrust hardware for weeds, shallow banks, and rough retrievals.",
    x: 83,
    y: 59,
  },
];

export const PROCESS_STEPS = [
  {
    label: "Search",
    title: "Scout the shoreline route.",
    body: "Run a smart search path around grass edges, riprap, docks, and laydowns before you commit to a pattern.",
  },
  {
    label: "Understand",
    title: "Read the water below.",
    body: "Build a usable picture of depth changes, hard cover, bait, fish activity, and water-condition clues.",
  },
  {
    label: "Cast",
    title: "Choose the highest-probability target.",
    body: "Turn the scan into a practical cast zone, presentation direction, and next move.",
  },
];

export const CAPABILITIES = [
  {
    title: "3D Terrain Maps",
    body: "Rebuild drops, humps, grass edges, brush, rocks, and bank transitions.",
  },
  {
    title: "Fish Activity",
    body: "Spot bait movement, fish position, and activity clues that shape the first cast.",
  },
  {
    title: "Water Conditions",
    body: "Combine temperature, clarity, oxygen, pressure, and local water clues.",
  },
  {
    title: "AI Strategy",
    body: "Translate structure and conditions into target zones and cast recommendations.",
  },
];

export const FEATURE_VISUALS = [
  {
    title: "3D Terrain",
    body: "Rebuild drop-offs, brush, rocks, grass edges, and bottom transitions from the bank.",
  },
  {
    title: "Fish Activity",
    body: "Read bait movement, fish position, and activity clues before choosing your first cast.",
  },
  {
    title: "Water Conditions",
    body: "Bring temperature, clarity, depth, oxygen, pressure, and local water clues into one view.",
  },
  {
    title: "AI Strategy",
    body: "Turn scan data into target zones, cast direction, and a practical next move.",
  },
];

export const PRODUCT_HIGHLIGHTS = [
  {
    title: "Portable",
    body: "Fits inside a fishing tackle box so bank anglers can carry it with normal shore gear.",
  },
  {
    title: "Bank-side control",
    body: "Deploy and control the unmanned scout boat from the shoreline instead of needing a full-size boat.",
  },
  {
    title: "3D underwater reconstruction",
    body: "Scan terrain in about 5 seconds and rebuild the underwater shape into a usable 3D view.",
  },
  {
    title: "AI spot marking",
    body: "Identify 3D terrain features and mark likely fish-holding spots before you commit the first cast.",
  },
];

export const HIGHLIGHT_CAROUSEL = [
  {
    step: "01",
    image: "recognition",
    title: "Pack it in your tackle box",
    body: "Carry the scout with the gear you already bring to the bank, without adding a full boat setup.",
  },
  {
    step: "02",
    image: "hero",
    title: "Launch from the bank",
    body: "Control the unmanned scout boat from shore and inspect water you cannot read by sight.",
  },
  {
    step: "03",
    image: "process",
    title: "Scan 3D terrain in seconds",
    body: "Run a quick scan and turn the underwater shape into a 3D view before choosing a cast lane.",
  },
  {
    step: "04",
    image: "recognition",
    title: "AI marks likely holding spots",
    body: "Use terrain recognition to flag likely cover, breaks, and fish-holding points before your first cast.",
  },
];

export const OFFER_ITEMS = [
  "$100 launch credit toward your first Kastave",
  "$600-$1,000 estimated product price",
  "Production progress and field-test updates",
  "Priority access when early units become available",
  "Production-in-progress: not a finished-unit shipping claim",
];

export const PAYMENT_NOTE =
  "Choose Stripe or PayPal. After payment, your receipt is the first confirmation; return to Kastave if the payment page does not redirect automatically.";

export const PAYMENT_AFTER_STEPS = [
  "Stripe or PayPal sends your payment receipt.",
  "Kastave records your $1 reservation.",
  "Join the early access email list so we can send product progress and launch-credit updates.",
];

export const FAQS = [
  {
    question: "Is this for boat anglers or bank anglers?",
    answer:
      "Kastave is focused on serious bank anglers who need a way to read water without full boat electronics.",
  },
  {
    question: "Does it publicly share my fishing spots?",
    answer:
      "No. Spots are private by default. You can save waypoints and notes without publishing your locations.",
  },
  {
    question: "Does it guarantee I will catch fish?",
    answer:
      "No. It does not guarantee fish. It helps you find structure faster, understand what the scan means, and start with a better plan.",
  },
  {
    question: "How is this different from a castable sonar?",
    answer:
      "A castable sonar gives readings from where you throw it. Kastave is a smart RC scout boat built to scan a bank spot, map structure, and turn that scan into a fishing plan.",
  },
  {
    question: "What species is it designed for?",
    answer:
      "Early access is focused on bass fishing and exploratory bank-fishing scenarios first.",
  },
  {
    question: "When will early access start?",
    answer:
      "Kastave is production-in-progress. Join early access or reserve for $1 to get test invites, product updates, and launch pricing details as they open.",
  },
  {
    question: "What if Stripe or PayPal does not redirect after payment?",
    answer:
      "Your Stripe or PayPal receipt is the first confirmation. Kastave also records valid $1 reservation events in the backend. If the payment page leaves you there, return to kastave.com/thanks and join the email list so we can contact you with product updates.",
  },
];
