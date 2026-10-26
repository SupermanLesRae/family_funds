import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext.jsx";
import { Layout } from "./components/Layout.jsx";
import { btnPrimary, Spinner } from "./components/ui.jsx";
import { DataProvider, useData } from "./data/DataContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import SetPin from "./pages/SetPin.jsx";
import Settings from "./pages/Settings.jsx";
import Transactions from "./pages/Transactions.jsx";

function DataGate() {
  const { status, error, reload } = useData();
  if (status === "loading") return <Spinner label="Loading your data…" />;
  if (status === "error") {
    return (
      <div className="mx-auto max-w-sm p-10 text-center">
        <p role="alert" className="mb-4 text-danger">Could not load data: {error}</p>
        <button type="button" className={btnPrimary} onClick={reload}>Try again</button>
      </div>
    );
  }
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

// Protected: nothing but Login renders (and no data is requested) until signed in with a non-default PIN.
export default function App() {
  const { status, mustChangePin } = useAuth();
  if (status === "loading") return <Spinner />;
  if (status === "out") return <Login />;
  if (mustChangePin) return <SetPin />;
  return (
    <DataProvider>
      <DataGate />
    </DataProvider>
  );
}
