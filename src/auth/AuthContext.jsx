import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "./index.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: "loading", mustChangePin: false });

  const apply = useCallback((s) => setState({ status: s.signedIn ? "in" : "out", mustChangePin: s.mustChangePin }), []);

  useEffect(() => {
    auth.init().then(apply).catch(() => apply({ signedIn: false }));
    return auth.subscribe(apply);
  }, [apply]);

  const value = useMemo(
    () => ({
      ...state,
      login: async (pin) => apply(await auth.login(pin)),
      changePin: async (cur, next) => apply(await auth.changePin(cur, next)),
      logout: async () => {
        await auth.logout();
        apply({ signedIn: false });
      },
    }),
    [state, apply],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
