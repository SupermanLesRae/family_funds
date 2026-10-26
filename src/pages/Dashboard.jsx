import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CategoryBreakdown, CategoryDonut, DailySpending, PersonBars, SpendingOverTime } from "../components/Charts.jsx";
import { FilterBar } from "../components/FilterBar.jsx";
import { TransactionModal } from "../components/TransactionModal.jsx";
import { TransactionTable } from "../components/TransactionTable.jsx";
import { useToast } from "../components/Toast.jsx";
import { btnGhost, btnPrimary, cardCls, ConfirmDialog, EmptyState } from "../components/ui.jsx";
import { useData } from "../data/DataContext.jsx";
import { useTransactionFilters } from "../hooks/useTransactionFilters.js";
import { applyFilters, dailySeries, rankBy, remainingCents, sortTransactions, sumCents } from "../lib/aggregate.js";
import { formatDate, getRange, rangeLabel, todayISO } from "../lib/dates.js";
import { formatMoney } from "../lib/money.js";

const RECENT_LIMIT = 10;

// "▲ 12% vs last month"; null when last month had no spending to compare against.
function vsLastMonth(current, previous) {
  if (previous <= 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct > 0 ? "▲" : pct < 0 ? "▼" : "="} ${Math.abs(pct)}% vs last month`;
}

function Stat({ label, value, sub }) {
  return (
    <div className={`${cardCls} p-4`}>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 break-words text-xl">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { transactions, settings, nameOf, deleteTransaction } = useData();
  const salary = settings?.salary_cents ?? 0;
  const salaryDay = settings?.salary_day ?? 1;
  const toast = useToast();
  const { filters, set, reset, filtered } = useTransactionFilters();
  const [modal, setModal] = useState(null); // { mode, transaction }
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const stats = useMemo(() => {
    const today = todayISO();
    const scope = { categoryId: filters.categoryId, personId: filters.personId };
    const month = getRange("this_month", today, {}, salaryDay);
    const monthList = applyFilters(transactions, { ...scope, ...month });
    const cats = rankBy(filtered, "category_id").map((r) => ({ ...r, name: nameOf("categories", r.id) }));
    const ppl = rankBy(filtered, "person_id").map((r) => ({ ...r, name: nameOf("people", r.id) }));
    return {
      total: sumCents(filtered),
      month: sumCents(monthList),
      daily: dailySeries(monthList, month.from, month.to),
      period: month,
      lastMonth: sumCents(applyFilters(transactions, { ...scope, ...getRange("last_month", today, {}, salaryDay) })),
      today: sumCents(applyFilters(transactions, { ...scope, from: today, to: today })),
      cats,
      ppl,
    };
  }, [filtered, transactions, filters.categoryId, filters.personId, nameOf, salaryDay]);

  const recent = useMemo(() => sortTransactions(filtered, "date", "desc").slice(0, RECENT_LIMIT), [filtered]);
  const period = rangeLabel(filters.range);
  const open = (mode, transaction) => setModal({ mode, transaction });
  const addBtn = <button type="button" className={btnPrimary} onClick={() => open("create")}>+ Insert Spending</button>;

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
        <h1 className="text-2xl tracking-tight">Dashboard</h1>
        {addBtn}
      </header>

      <FilterBar filters={filters} set={set} reset={reset} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Total Spending" value={formatMoney(stats.total)} sub={period} />
        <Stat label="Spending This Month" value={formatMoney(stats.month)} sub={vsLastMonth(stats.month, stats.lastMonth)} />
        {salary > 0 && (
          <Stat label="Remaining This Month" value={formatMoney(remainingCents(salary, stats.month))} sub={`of ${formatMoney(salary)} salary`} />
        )}
        <Stat label="Spending Today" value={formatMoney(stats.today)} />
        <Stat label="Transactions" value={filtered.length} sub={period} />
        <Stat label="Top Category" value={stats.cats[0]?.name ?? "—"} sub={stats.cats[0] && formatMoney(stats.cats[0].total)} />
        <Stat label="Top Person" value={stats.ppl[0]?.name ?? "—"} sub={stats.ppl[0] && formatMoney(stats.ppl[0].total)} />
      </div>

      <DailySpending data={stats.daily} today={todayISO()} periodLabel={`${formatDate(stats.period.from, settings.date_format)} – ${formatDate(stats.period.to, settings.date_format)}`} />

      {filtered.length === 0 ? (
        <div className={cardCls}>
          {transactions.length === 0 ? (
            <EmptyState title="No spending recorded yet" text="Add your first transaction to see where your money goes." action={addBtn} />
          ) : (
            <EmptyState title="No transactions match these filters" text="Try a wider date range or reset the filters." action={<button type="button" className={btnGhost} onClick={reset}>Reset filters</button>} />
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            <CategoryDonut data={stats.cats} />
            <CategoryBreakdown data={stats.cats} />
            <PersonBars data={stats.ppl} />
            <SpendingOverTime key={filters.range} list={filtered} defaultGranularity={["this_year", "all_time"].includes(filters.range) ? "month" : "day"} />
          </div>
          <section aria-labelledby="recent-h" className="grid gap-3">
            <div className="flex items-center justify-between">
              <h2 id="recent-h" className="">Recent transactions</h2>
              <Link to="/transactions" className="text-sm text-accent underline">View all</Link>
            </div>
            <TransactionTable rows={recent} onView={(t) => open("view", t)} onEdit={(t) => open("edit", t)} onDelete={setToDelete} />
          </section>
        </>
      )}

      {modal && (
        <TransactionModal
          key={`${modal.mode}-${modal.transaction?.id}`}
          mode={modal.mode}
          transaction={modal.transaction}
          onClose={() => setModal(null)}
          onEdit={(t) => open("edit", t)}
        />
      )}
      {toDelete && (
        <ConfirmDialog title="Delete transaction?" message={`Delete ${formatMoney(toDelete.amount_cents)}${toDelete.description ? ` (${toDelete.description})` : ""}? This cannot be undone.`} busy={deleting} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
      )}
    </div>
  );
}
