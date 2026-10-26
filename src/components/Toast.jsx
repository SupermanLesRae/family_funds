import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((message, type = "success") => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div role="status" aria-live="polite" className="fixed inset-x-4 bottom-20 z-50 flex flex-col items-center gap-2 md:bottom-6">
        {toasts.map((t) => (
          <p
            key={t.id}
            className={`rounded-lg px-4 py-2 text-sm shadow-lg ${t.type === "error" ? "bg-danger text-white" : "bg-brand text-brand-fg"}`}
          >
            {t.message}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
