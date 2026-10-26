# Auth & security

## Model
Single admin = one Supabase Auth user (`admin@fintrack.local`) whose **password is `HMAC-SHA256(pin, PIN_PEPPER)`** (server-derived; Supabase's min-length rule never sees the short PIN). Role/state live in `app_metadata` (only service role can set): `{role:'admin', must_change_pin:bool}`.

- `api/login.js`: validate → lockout check → (first run only) create admin if PIN equals `INITIAL_PIN` (default `0000`) → sign in → return tokens + `mustChangePin`.
- `api/change-pin.js`: bearer token must belong to admin → lockout check → verify current PIN → policy check → update password, clear `must_change_pin`, revoke old sessions → new tokens.
- Lockout: 5 failures / 15 min across the single admin (table `login_attempts`, service-role only). Logic in `src/lib/lockout.js` shared with local mode. Trade-off: global lockout lets an attacker lock the owner out temporarily.
- PIN policy (`src/lib/pin.js`): login accepts 4–8 digits; **new** PIN 6–8 digits, not all-same, not sequential, not the current PIN.
- RLS: every table `using/with check (public.is_admin())`; `is_admin()` requires role=admin **and** `must_change_pin` not true. `login_attempts` has RLS on and no policies.

## Env vars
| Var | Where | Notes |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | client+server | public by design |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | never `VITE_` |
| `PIN_PEPPER` | server only | long random; changing it invalidates all PINs |
| `INITIAL_PIN` | server, optional | first-run default; fallback `0000` |
| `VITE_APP_TIMEZONE` | client, optional | IANA tz |

## Supabase dashboard
Disable public sign-ups; keep email confirmations irrelevant (user created confirmed by service role).

## Local mode
PBKDF2 hash + salt in localStorage, same lockout/policy, forced change from `0000`. Dev only, not secure; labelled in UI.
