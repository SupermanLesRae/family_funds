import { PIN_LOGIN_RE, validateNewPin } from "../src/lib/pin.js";
import { lockMessage } from "../src/lib/lockout.js";
import {
  ADMIN_EMAIL, adminClient, anonClient, clearFailures, derivePassword, lockState, recordFailure,
  route, sessionPayload,
} from "./_lib.js";

export default route(async (req, res) => {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const db = adminClient();
  const { data: auth } = token ? await db.auth.getUser(token) : { data: {} };
  const user = auth?.user;
  if (!user || user.app_metadata?.role !== "admin") return res.status(401).json({ error: "Please sign in again." });

  const currentPin = String(req.body?.currentPin ?? "");
  const newPin = String(req.body?.newPin ?? "");
  if (!PIN_LOGIN_RE.test(currentPin)) return res.status(400).json({ error: "Enter your current PIN." });
  const policyError = validateNewPin(newPin, currentPin);
  if (policyError) return res.status(400).json({ error: policyError });

  const lock = await lockState(db);
  if (lock.locked) return res.status(429).json({ error: lockMessage(lock.retryAfterSec), retryAfter: lock.retryAfterSec });

  const { error: verifyError } = await anonClient().auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: derivePassword(currentPin),
  });
  if (verifyError) {
    await recordFailure(db);
    return res.status(401).json({ error: "Current PIN is incorrect." });
  }

  const { error: updateError } = await db.auth.admin.updateUserById(user.id, {
    password: derivePassword(newPin),
    app_metadata: { ...user.app_metadata, must_change_pin: false },
  });
  if (updateError) throw updateError;
  await db.auth.admin.signOut(token, "global"); // revoke every older session

  const { data, error } = await anonClient().auth.signInWithPassword({ email: ADMIN_EMAIL, password: derivePassword(newPin) });
  if (error || !data.session) throw error || new Error("Re-login failed");
  await clearFailures(db);
  res.json(sessionPayload(data));
});
