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

export const ANNOUNCEMENT = "Coming soon · Kickstarter";

export const HERO = {
  eyebrow: "meet",
  title: "Kastave",
  body: "Your shoreline fishing scout. Scan the water, see the bottom, and pick your first cast.",
  note: "Coming soon on Kickstarter. Reserve $1 for a $100 launch credit.",
};

export const HOOK_VARIANTS = {
  default: {
    key: "default",
    eyebrow: HERO.eyebrow,
    title: HERO.title,
    body: HERO.body,
    sceneLabel: "Default",
    sceneCopy: "Scan reachable water, read the structure, then choose the cast that matches your risk.",
  },
  "obvious-cast": {
    key: "obvious-cast",
    eyebrow: "Wrong cast problem",
    title: "The obvious cast is not always the right cast.",
    body: "That grass line may look perfect from shore. The real drop-off could be 15 feet left. Kastave helps you scan before you commit the first cast.",
    sceneLabel: "Ad hook 01",
    sceneCopy: "Visible grass line: tempting. Real break: 15 feet left.",
  },
  "castable-sonar": {
    key: "castable-sonar",
    eyebrow: "Castable sonar workflow",
    title: "Stop casting your fish finder.",
    body: "Castable sonar can be useful, but from the bank it often means an extra rod, repeated casts, slow retrieves, and still having to turn data into a plan.",
    sceneLabel: "Ad hook 02",
    sceneCopy: "Less cast-retrieve-repeat. More scan, read, choose, cast.",
  },
  "three-casts": {
    key: "three-casts",
    eyebrow: "3 AI cast choices",
    title: "Safe Cast. Structure Cast. Risk / Reward Cast.",
    body: "Kastave is built to turn the scan into three practical options so you can decide whether to play safe, fish the structure, or take the high-risk shot.",
    sceneLabel: "Ad hook 03",
    sceneCopy: "Green, blue, or red: choose the cast before you waste the bank.",
  },
};

export const RESERVATION_OFFER = {
  depositAmount: "$1",
  creditAmount: "$100",
  productPrice: "$600-$1,000",
  title: "Reserve for $1. Get $100 launch credit.",
  body: "This is not a finished-unit purchase. It is a non-refundable founder reservation that unlocks a launch credit toward your first Kastave if you buy at launch.",
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

export const CASTABLE_WORKFLOW = {
  title: "Stop casting your fish finder.",
  body: "Castable sonar can be useful. The problem is the bank workflow: you may spend the first part of the session casting the tool instead of fishing the water.",
  castable: {
    title: "Castable sonar workflow",
    steps: [
      "Bring an extra rod or swap rigs",
      "Cast the sonar ball",
      "Retrieve slowly while watching the phone",
      "Repeat from another angle",
      "Still decide where to actually fish",
    ],
  },
  kastave: {
    title: "Kastave workflow",
    steps: [
      "Deploy from shore",
      "Auto-scan reachable water",
      "Build a 3D terrain read",
      "Compare Safe / Structure / Risk-Reward",
      "Then make the cast",
    ],
  },
};

export const PRIVACY_POINTS = [
  "Private by default",
  "No public spot burning",
  "We do not sell your spots",
  "Your exploration map stays yours",
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
