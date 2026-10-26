import { PIN_LOGIN_RE } from "../src/lib/pin.js";
import { lockMessage } from "../src/lib/lockout.js";
import {
  ADMIN_EMAIL, adminClient, anonClient, clearFailures, derivePassword, initialPin, lockState,
  recordFailure, route, sessionPayload,
} from "./_lib.js";

export default route(async (req, res) => {
  const pin = String(req.body?.pin ?? "");
  if (!PIN_LOGIN_RE.test(pin)) return res.status(400).json({ error: "Enter your PIN (4 to 8 digits)." });

  const db = adminClient();
  const lock = await lockState(db);
  if (lock.locked) return res.status(429).json({ error: lockMessage(lock.retryAfterSec), retryAfter: lock.retryAfterSec });

  // First run only: create the admin with the initial PIN; must be changed before data is reachable.
  const { data: users } = await db.auth.admin.listUsers({ perPage: 1 });
  if (users.users.length === 0 && pin === initialPin()) {
    await db.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: derivePassword(pin),
      email_confirm: true,
      app_metadata: { role: "admin", must_change_pin: true },
    });
  }

  const { data, error } = await anonClient().auth.signInWithPassword({ email: ADMIN_EMAIL, password: derivePassword(pin) });
  if (error || !data.session || data.user.app_metadata?.role !== "admin") {
    await recordFailure(db);
    const after = await lockState(db);
    return res.status(after.locked ? 429 : 401).json({
      error: after.locked ? lockMessage(after.retryAfterSec) : "Incorrect PIN.",
      attemptsLeft: after.attemptsLeft,
    });
  }
  await clearFailures(db);
  res.json(sessionPayload(data));
});
