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
  programName: "Kastave Bank Fishing Scout Co-Creation Program",
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
  "Crowdfunding early access: help build the scout for exploratory bank anglers.";

export const HERO = {
  eyebrow: "Crowdfunding for exploratory bank anglers",
  title: "Scout unknown water before you cast.",
  body: "Kastave auto-scans reachable water from shore, builds a 3D underwater terrain view, reads water-condition clues, and turns the scan into 3 cast choices: safe, structure, and high-risk, high-reward.",
  note: "Estimated product price: $600-$1,000. Founder reservations help decide field-test priorities, accessories, and the first production run.",
};

export const RESERVATION_OFFER = {
  depositAmount: "$1",
  creditAmount: "$100",
  productPrice: "$600-$1,000",
  title: "Back the first run for $1.",
  body: "Your non-refundable founder reservation is applied as a launch credit toward your first Kastave.",
};

export const BANK_PAIN_POINTS = [
  "After-work pond sessions are too short for blind searching",
  "Public ponds are pressured, but I do not know if I should move",
  "Grass and snag risk make treble hooks feel like a gamble",
  "Without a boat, I only care about water I can actually reach",
  "My first cast needs a reason, not just a hunch",
];

export const LANDING_PAIN_POINTS = [
  "Unknown bank water burns the first half of a short session",
  "Public ponds get hammered, and the bank gives few clues",
  "Weeds, ledges, channels, rocks, and hard bottom change the lure choice",
  "Most sonar data still needs to become a first-cast decision",
];

export const FEATURE_GROUPS = [
  {
    title: "Auto scan",
    items: ["reachable bank water", "quick shoreline route", "hands-off sweep", "repeatable scan path"],
  },
  {
    title: "3D terrain model",
    items: ["depth change", "drop-off", "ledge", "channel", "rock pile", "hard or soft bottom"],
  },
  {
    title: "Water-condition clues",
    items: ["water temperature", "clarity cues", "weed edge", "muck", "snag risk", "reachable depth"],
  },
  {
    title: "3 AI cast choices",
    items: ["safe point", "structure point", "high-risk, high-reward point"],
  },
  {
    title: "Private exploration map",
    items: ["auto spot log", "private waypoints", "trip notes", "no public spot feed"],
  },
];

export const PRIVACY_POINTS = [
  "Private by default",
  "No public spot burning",
  "We do not sell your spots",
  "Your exploration map stays yours",
];

export const TRUST = {
  rating: "4.3 / 5 target launch benchmark",
  note: "Seed-user reservations, field-test updates, and transparent production progress.",
};

export const SCENARIOS = [
  {
    label: "40-minute pond run",
    detail: "After work, scan the reachable bank first so the session starts with a safe cast, a structure cast, and one high-risk shot instead of twenty minutes of guessing.",
  },
  {
    label: "Quick stop with kids",
    detail: "When the rods are in the car during a grocery run or family errand, carry a small scout, check one shoreline pocket, and leave with a saved private note.",
  },
  {
    label: "Pressured public pond",
    detail: "If the obvious bank has been hammered all week, use the scan to decide whether to stay, change angle, or walk before you burn the whole window.",
  },
  {
    label: "Grass and snag risk",
    detail: "See weed edges, muck, rocks, and drop-offs before throwing a treble hook into water that may cost you two lures in ten minutes.",
  },
  {
    label: "No boat, reachable water",
    detail: "Focus on the water your bank cast can actually reach: the first shelf, the channel swing, the outside weed edge, or the rock transition in range.",
  },
];

export const COMPARISON_ROWS = [
  {
    factor: "Reachable water",
    blind: "Guess from bank slope and visible clues",
    scout: "Auto-scan the water you can actually cast to",
  },
  {
    factor: "Structure",
    blind: "Fish what you can see above the surface",
    scout: "Build a 3D model of ledges, channels, rocks, and weed edges",
  },
  {
    factor: "Lure risk",
    blind: "Find grass, muck, and snags after losing time or tackle",
    scout: "Read water-condition clues before choosing trebles, single hooks, or a safer lane",
  },
  {
    factor: "Cast plan",
    blind: "Start with instinct and adjust after misses",
    scout: "Choose between safe, structure, and high-risk, high-reward targets",
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
    label: "Scan",
    title: "Auto-scan the reachable bank water.",
    body: "Run a repeatable sweep across the water you can actually fish from shore, even when the surface tells you almost nothing.",
  },
  {
    label: "Model",
    title: "Build the 3D underwater picture.",
    body: "Turn depth, ledges, channels, rocks, weeds, and bottom hardness into a practical terrain view for the spot in front of you.",
  },
  {
    label: "Choose",
    title: "Pick 1 of 3 cast choices.",
    body: "Start with a safe point, a structure point, or a high-risk, high-reward target based on terrain, depth, conditions, and your history.",
  },
];

export const CAPABILITIES = [
  {
    title: "Auto Scan",
    body: "Run a quick shoreline sweep across the water a bank angler can actually reach.",
  },
  {
    title: "3D Terrain Model",
    body: "Rebuild drops, ledges, channels, rock piles, weed edges, and bottom transitions.",
  },
  {
    title: "Water Conditions",
    body: "Turn depth, temperature, clarity cues, weeds, muck, and snag risk into fishing context.",
  },
  {
    title: "AI Cast Choices",
    body: "Translate the scan into a safe point, a structure point, and a high-risk, high-reward point.",
  },
];

export const FEATURE_VISUALS = [
  {
    title: "Auto Scan",
    body: "Start a quick sweep from shore and cover the water you can actually cast to.",
  },
  {
    title: "3D Terrain",
    body: "Rebuild drop-offs, ledges, channels, rocks, weed edges, and bottom transitions from the bank.",
  },
  {
    title: "Water Conditions",
    body: "Bring depth, temperature, clarity cues, weeds, muck, and snag risk into one view.",
  },
  {
    title: "AI Cast Choices",
    body: "Turn scan data into 3 practical options: safe point, structure point, and high-risk, high-reward point.",
  },
];

export const PRODUCT_HIGHLIGHTS = [
  {
    title: "Auto scan",
    body: "Set a quick shoreline sweep and let Kastave map the bank water before your first real cast.",
  },
  {
    title: "3D underwater terrain",
    body: "Rebuild ledges, channels, rocks, weed edges, hard bottom, and soft bottom into a usable 3D view.",
  },
  {
    title: "Water-condition information",
    body: "Read depth, temperature, clarity cues, weeds, muck, and snag risk before choosing your lure path.",
  },
  {
    title: "3 AI cast choices",
    body: "Get a safe point, a structure point, and a high-risk, high-reward point for the water in front of you.",
  },
  {
    title: "Private spot record",
    body: "Every exploration can leave a private spot log. It is not a public spot, and it is not sold to other anglers.",
  },
];

export const HIGHLIGHT_CAROUSEL = [
  {
    step: "01",
    image: "process",
    title: "Auto-scan the bank water",
    body: "Launch a quick 360-style sweep around the reachable water instead of reading the pond only from the surface.",
  },
  {
    step: "02",
    image: "hero",
    title: "Build a 3D terrain view",
    body: "See ledges, channels, rocks, hard bottom, soft bottom, and weed edges as a fishing map, not a raw sonar puzzle.",
  },
  {
    step: "03",
    image: "recognition",
    title: "Choose the first 3 casts",
    body: "AI labels one safe point, one structure point, and one high-risk, high-reward shot for the spot you are standing on.",
  },
  {
    step: "04",
    image: "recognition",
    title: "Save a private spot log",
    body: "Each scan can become your own exploration record. Kastave is not a public spot feed, and it does not sell your fishing map.",
  },
];

export const OFFER_ITEMS = [
  "$100 launch credit toward your first Kastave",
  "$600-$1,000 estimated product price",
  "Founder feedback on scan paths, cast-choice labels, and private spot logs",
  "Production progress, field-test updates, and co-creation polls",
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
      "No. Spots are private by default. Kastave is not a public spot feed, and it does not sell your locations. You can save waypoints, scan history, and notes as your own exploration map.",
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
    question: "Is this a crowdfunding product?",
    answer:
      "Yes. Kastave is a crowdfunding-style co-creation program, not a finished-unit shipping claim. Founder reservations help us prioritize field tests, accessories, app workflow, and the first production run.",
  },
  {
    question: "How do founders help shape the product?",
    answer:
      "We will ask early users to react to scan behavior, 3D map readability, the 3 cast-choice labels, private log fields, carrying kit ideas, and real bank-fishing scenarios.",
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
