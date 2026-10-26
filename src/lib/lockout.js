export const MAX_ATTEMPTS = 5;
export const WINDOW_MS = 15 * 60 * 1000;

// failTimes: ms timestamps of failed attempts. Only those inside the window count.
export function lockoutStatus(failTimes, now = Date.now()) {
  const recent = failTimes.filter((t) => now - t < WINDOW_MS).sort((a, b) => a - b);
  if (recent.length < MAX_ATTEMPTS) return { locked: false, attemptsLeft: MAX_ATTEMPTS - recent.length, retryAfterSec: 0 };
  // Unlocks when the oldest counted failure leaves the window.
  const unlockAt = recent[recent.length - MAX_ATTEMPTS] + WINDOW_MS;
  return { locked: true, attemptsLeft: 0, retryAfterSec: Math.ceil((unlockAt - now) / 1000) };
}

export const lockMessage = (sec) => `Too many incorrect attempts. Try again in ${Math.max(1, Math.ceil(sec / 60))} min.`;
