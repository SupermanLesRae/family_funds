// Shared by the browser and api/ functions.
export const PIN_LOGIN_RE = /^\d{4,8}$/;

// Policy for a NEW pin. Returns error text or null.
export function validateNewPin(pin, currentPin) {
  if (!/^\d{6,8}$/.test(pin)) return "PIN must be 6 to 8 digits.";
  if (/^(\d)\1+$/.test(pin)) return "PIN cannot be a single repeated digit.";
  if ("0123456789".includes(pin) || "9876543210".includes(pin)) return "PIN cannot be a simple sequence.";
  if (pin === currentPin) return "New PIN must differ from the current PIN.";
  return null;
}
