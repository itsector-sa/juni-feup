import confetti from "canvas-confetti";

export function fireConfettiOnce() {
  confetti({ particleCount: 110, spread: 70, origin: { y: 0.65 } });
  setTimeout(() => {
    confetti({ particleCount: 70, spread: 55, origin: { y: 0.6 } });
  }, 180);
}

export function fireMicroConfetti() {
  confetti({
    particleCount: 22,
    spread: 45,
    startVelocity: 22,
    gravity: 0.9,
    scalar: 0.9,
    origin: { y: 0.72 },
  });
}
