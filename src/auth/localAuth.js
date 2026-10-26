// LOCAL DEVELOPMENT MODE ONLY. The PIN is stored as a salted PBKDF2 hash in this browser; anyone with
// access to the browser can bypass or reset it. Never use for real financial data.
import { PIN_LOGIN_RE, validateNewPin } from "../lib/pin.js";
import { lockMessage, lockoutStatus } from "../lib/lockout.js";

const KEY = "fintrack.local.auth";
const SESSION = "fintrack.local.session";
const INITIAL_PIN = "0000";
const ITER = 150_000;

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
async function hash(pin, saltHex) {
  const salt = Uint8Array.from(saltHex.match(/../g).map((h) => parseInt(h, 16)));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITER }, key, 256));
}

async function load() {
  const raw = localStorage.getItem(KEY);
  if (raw) return JSON.parse(raw);
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  return { salt, hash: await hash(INITIAL_PIN, salt), mustChangePin: true, fails: [] };
}
const save = (a) => localStorage.setItem(KEY, JSON.stringify(a));

// Throws on lockout/wrong PIN; records failures.
async function verify(pin) {
  const a = await load();
  const lock = lockoutStatus(a.fails);
  if (lock.locked) throw new Error(lockMessage(lock.retryAfterSec));
  if ((await hash(pin, a.salt)) !== a.hash) {
    a.fails.push(Date.now());
    save(a);
    const after = lockoutStatus(a.fails);
    throw new Error(after.locked ? lockMessage(after.retryAfterSec) : "Incorrect PIN.");
  }
  a.fails = [];
  return a;
}

const state = (a) => ({ signedIn: true, mustChangePin: a.mustChangePin });

export const localAuth = {
  async init() {
    if (sessionStorage.getItem(SESSION) !== "1") return { signedIn: false, mustChangePin: false };
    return state(await load());
  },
  subscribe: () => () => {},
  async login(pin) {
    if (!PIN_LOGIN_RE.test(pin)) throw new Error("Enter your PIN (4 to 8 digits).");
    const a = await verify(pin);
    save(a);
    sessionStorage.setItem(SESSION, "1");
    return state(a);
  },
  async changePin(currentPin, newPin) {
    if (!PIN_LOGIN_RE.test(currentPin)) throw new Error("Enter your current PIN.");
    const policy = validateNewPin(newPin, currentPin);
    if (policy) throw new Error(policy);
    const a = await verify(currentPin).catch((e) => {
      throw new Error(e.message === "Incorrect PIN." ? "Current PIN is incorrect." : e.message);
    });
    a.salt = hex(crypto.getRandomValues(new Uint8Array(16)));
    a.hash = await hash(newPin, a.salt);
    a.mustChangePin = false;
    save(a);
    return state(a);
  },
  async logout() {
    sessionStorage.removeItem(SESSION);
  },
};
