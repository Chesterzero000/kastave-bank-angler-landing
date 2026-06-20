const slides = [...document.querySelectorAll(".slide")];
const slideControls = document.querySelector(".slider-controls");
const currentSlide = document.querySelector(".current-slide");
const totalSlides = document.querySelector(".total-slides");
let activeSlide = 0;
let timer;

function showSlide(index) {
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle("active", i === activeSlide));
  if (currentSlide) currentSlide.textContent = String(activeSlide + 1);
}

function startSlider() {
  clearInterval(timer);
  timer = setInterval(() => {
    showSlide((activeSlide + 1) % slides.length);
  }, 5000);
}

if (totalSlides) totalSlides.textContent = String(slides.length);

slideControls?.querySelectorAll(".slide-arrow").forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.direction === "prev" ? -1 : 1;
    showSlide(activeSlide + direction);
    startSlider();
  });
});

if (slides.length > 1) startSlider();

const loopingModeVideos = [...document.querySelectorAll(".multirow video")];

function playModeVideo(video) {
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  const playAttempt = video.play();
  if (playAttempt && typeof playAttempt.catch === "function") {
    playAttempt.catch(() => {
      video.setAttribute("data-awaiting-play", "true");
    });
  }
}

loopingModeVideos.forEach((video) => {
  video.setAttribute("muted", "");
  video.setAttribute("loop", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");

  video.addEventListener("loadeddata", () => playModeVideo(video), { once: true });
  video.addEventListener("ended", () => {
    video.currentTime = 0;
    playModeVideo(video);
  });
  video.addEventListener("pause", () => {
    if (!video.closest(".video-placeholder")) playModeVideo(video);
  });
});

document.addEventListener(
  "visibilitychange",
  () => {
    if (!document.hidden) loopingModeVideos.forEach(playModeVideo);
  },
  false,
);

document.addEventListener(
  "click",
  () => {
    loopingModeVideos
      .filter((video) => video.dataset.awaitingPlay === "true")
      .forEach((video) => {
        delete video.dataset.awaitingPlay;
        playModeVideo(video);
      });
  },
  { once: true },
);

function trackMarketingEvent(eventName, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });

  if (typeof window.fbq === "function") {
    if (eventName.includes("checkout")) {
      window.fbq("track", "InitiateCheckout", params);
    } else if (eventName.includes("waitlist") || eventName.includes("lead")) {
      window.fbq("track", "Lead", params);
    } else {
      window.fbq("trackCustom", eventName, params);
    }
  }
}

function ensurePayPalCheckout() {
  const paypalUrl = "https://www.paypal.com/ncp/payment/6W9PTBNB267ZW";
  const stripeButton = document.querySelector('[data-track="stripe_checkout"]');
  const existingPayPalButton = document.querySelector('[data-track="paypal_checkout"]');

  if (stripeButton && !existingPayPalButton) {
    const paypalButton = document.createElement("a");
    paypalButton.className = stripeButton.className || "button primary payment-button";
    paypalButton.href = paypalUrl;
    paypalButton.target = "_blank";
    paypalButton.rel = "noopener";
    paypalButton.dataset.track = "paypal_checkout";
    paypalButton.textContent = "Reserve with PayPal";
    stripeButton.insertAdjacentElement("afterend", paypalButton);
  }

  document.querySelectorAll("p").forEach((paragraph) => {
    paragraph.textContent = paragraph.textContent
      .replace("You can reserve through Stripe using the checkout button on this page.", "You can reserve through Stripe or PayPal using the checkout buttons on this page.")
      .replace("Payments are processed by a third-party checkout provider, Stripe.", "Payments are processed by third-party checkout providers, Stripe or PayPal.");
  });
}

ensurePayPalCheckout();

document.querySelectorAll("[data-track]").forEach((link) => {
  link.addEventListener("click", () => {
    trackMarketingEvent(link.dataset.track, {
      label: link.textContent.trim(),
      href: link.href,
    });
  });
});
