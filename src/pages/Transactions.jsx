import { useEffect, useMemo, useState } from "react";
import { FilterBar } from "../components/FilterBar.jsx";
import { TransactionModal } from "../components/TransactionModal.jsx";
import { TransactionTable } from "../components/TransactionTable.jsx";
import { useToast } from "../components/Toast.jsx";
import { btnGhost, btnPrimary, cardCls, ConfirmDialog, EmptyState } from "../components/ui.jsx";
import { useData } from "../data/DataContext.jsx";
import { useTransactionFilters } from "../hooks/useTransactionFilters.js";
import { sortTransactions, sumCents } from "../lib/aggregate.js";
import { formatMoney } from "../lib/money.js";

const PAGE_SIZE = 25;

export default function Transactions() {
  const { transactions, deleteTransaction } = useData();
  const toast = useToast();
  const { filters, set, reset, filtered } = useTransactionFilters();
  const [sort, setSort] = useState({ key: "date", dir: "desc" });
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filterKey = JSON.stringify(filters);
  useEffect(() => setPage(1), [filterKey, sort]);

  const sorted = useMemo(() => sortTransactions(filtered, sort.key, sort.dir), [filtered, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const open = (mode, transaction) => setModal({ mode, transaction });
  const onSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteTransaction(toDelete.id);
      toast("Transaction deleted.");
      setToDelete(null);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="grid gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl tracking-tight">Transactions</h1>
        <button type="button" className={btnPrimary} onClick={() => open("create")}>+ Insert Spending</button>
      </header>
      <FilterBar filters={filters} set={set} reset={reset} showSearch />
      <p className="text-sm text-muted" aria-live="polite">
        {filtered.length} transaction{filtered.length === 1 ? "" : "s"} · Total <strong className="text-fg">{formatMoney(sumCents(filtered))}</strong>
      </p>

      {rows.length === 0 ? (
        <div className={cardCls}>
          <EmptyState
            title={transactions.length === 0 ? "No spending recorded yet" : "No transactions match these filters"}
            action={transactions.length === 0 ? <button type="button" className={btnPrimary} onClick={() => open("create")}>+ Insert Spending</button> : <button type="button" className={btnGhost} onClick={reset}>Reset filters</button>}
          />
        </div>
      ) : (
        <TransactionTable rows={rows} sort={sort} onSort={onSort} onView={(t) => open("view", t)} onEdit={(t) => open("edit", t)} onDelete={setToDelete} />
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-3 text-sm">
          <button type="button" className={btnGhost} disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</button>
          <span>Page {current} of {pages}</span>
          <button type="button" className={btnGhost} disabled={current === pages} onClick={() => setPage(current + 1)}>Next</button>
        </nav>
      )}

      {modal && (
        <TransactionModal key={`${modal.mode}-${modal.transaction?.id}`} mode={modal.mode} transaction={modal.transaction} onClose={() => setModal(null)} onEdit={(t) => open("edit", t)} />
      )}
      {toDelete && (
        <ConfirmDialog title="Delete transaction?" message={`Delete ${formatMoney(toDelete.amount_cents)}${toDelete.description ? ` (${toDelete.description})` : ""}? This cannot be undone.`} busy={deleting} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
      )}
    </div>
  );
}
