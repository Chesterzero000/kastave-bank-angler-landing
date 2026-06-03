function scrollToHashTarget(targetId, behavior = "smooth") {
  if (!targetId || targetId === "#") return false;
  if (targetId === "#top") {
    window.scrollTo({ top: 0, behavior });
    return true;
  }

  const target = document.querySelector(targetId);
  if (!target) return false;

  const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
  window.scrollTo({ top: Math.max(0, top), behavior });
  return true;
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#" || !document.querySelector(targetId)) return;

    event.preventDefault();
    scrollToHashTarget(targetId);
    history.pushState(null, "", targetId);
  });
});

function settleInitialHash() {
  if (!window.location.hash) return;
  requestAnimationFrame(() => {
    scrollToHashTarget(window.location.hash, "auto");
    setTimeout(() => scrollToHashTarget(window.location.hash, "auto"), 80);
    setTimeout(() => scrollToHashTarget(window.location.hash, "auto"), 240);
  });
}

window.addEventListener("load", settleInitialHash);
window.addEventListener("hashchange", settleInitialHash);

const canvas = document.getElementById("terrainCanvas");
if (canvas) {
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawTerrain(time = 0) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#effbf7");
  gradient.addColorStop(0.42, "#d8f4eb");
  gradient.addColorStop(1, "#72cbbb");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(7, 88, 91, 0.12)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 42) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 42) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const horizon = height * 0.34;
  for (let layer = 0; layer < 7; layer += 1) {
    const offset = layer * 28;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width; x += 12) {
      const wave =
        Math.sin(x * 0.014 + layer * 0.8 + time * 0.0007) * 24 +
        Math.cos(x * 0.027 + layer * 0.55) * 14;
      const slope = (x / width) * 96;
      const y = horizon + offset + wave + slope;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = `rgba(${10 + layer * 9}, ${127 + layer * 6}, ${131 + layer * 2}, ${0.18 + layer * 0.055})`;
    ctx.fill();
  }

  const scanX = ((time * 0.05) % (width + 160)) - 80;
  const beam = ctx.createLinearGradient(scanX - 80, 0, scanX + 80, 0);
  beam.addColorStop(0, "rgba(231, 173, 67, 0)");
  beam.addColorStop(0.5, "rgba(231, 173, 67, 0.28)");
  beam.addColorStop(1, "rgba(231, 173, 67, 0)");
  ctx.fillStyle = beam;
  ctx.fillRect(scanX - 80, 0, 160, height);

  const points = [
    [width * 0.62, height * 0.48],
    [width * 0.72, height * 0.56],
    [width * 0.42, height * 0.62],
    [width * 0.32, height * 0.5],
  ];
  points.forEach(([x, y], index) => {
    const pulse = 4 + Math.sin(time * 0.004 + index) * 2;
    ctx.beginPath();
    ctx.arc(x, y, pulse + 8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(239, 107, 82, 0.16)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, pulse, 0, Math.PI * 2);
    ctx.fillStyle = "#ef6b52";
    ctx.fill();
  });

    requestAnimationFrame(drawTerrain);
  }

  resizeCanvas();
  requestAnimationFrame(drawTerrain);
  window.addEventListener("resize", resizeCanvas);
}
