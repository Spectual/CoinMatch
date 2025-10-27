import { useMemo, useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { candidateCoins, matchHistory, museumCoins } from '../data/mockData';
import { formatIsoDate, formatCoinTitle } from '../utils/coinFormatting';

const statusFilters = ['All statuses', 'Confirmed', 'Pending', 'Rejected'] as const;

export default function MatchHistoryPage() {
  const [status, setStatus] = useState<(typeof statusFilters)[number]>('All statuses');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return matchHistory.filter((record) => {
      const matchesStatus = status === 'All statuses' || record.status === status;
      const matchesQuery = [record.museumCoinTitle, record.candidateTitle, record.source]
        .join(' ')
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [status, search]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Verification ledger</p>
        <h1 className="mt-1 text-3xl font-display text-stone-900">Match History</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          Review and export all curator decisions. Each record captures the Dewing catalog reference, auction source, similarity score, and final verification state.
        </p>
      </header>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Status
            <select
              className="mt-1 rounded-md border border-stone-200 bg-white/80 px-3 py-2 text-sm text-stone-700 focus:border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-200"
              value={status}
              onChange={(event) => setStatus(event.target.value as (typeof statusFilters)[number])}
            >
              {statusFilters.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Search
            <div className="mt-1">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by catalog number or auction source…"
                className="h-10 rounded-md border border-stone-200 bg-white/80 px-3 text-sm text-stone-700 focus:border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-200"
              />
            </div>
          </label>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-gold-300 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-gold-500 transition hover:border-gold-400 hover:text-gold-400"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          Export CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white/80 shadow-card">
        <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
          <thead className="bg-parchment/70 text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-5 py-3">Museum Coin</th>
              <th className="px-5 py-3">Candidate</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Similarity</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Saved</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 bg-white">
            {filtered.map((record) => {
              const museum = museumCoins.find((coin) => coin.coin_id === record.coinId);
              const candidate = candidateCoins.find((entry) => entry.id === record.candidateId);
              return (
                <tr key={record.id} className="transition hover:bg-parchment/60">
                  <td className="px-5 py-3 font-medium text-stone-800">{museum ? formatCoinTitle(museum) : record.museumCoinTitle}</td>
                  <td className="px-5 py-3 text-stone-600">{candidate ? formatCoinTitle(candidate.metadata) : record.candidateTitle}</td>
                  <td className="px-5 py-3 text-xs text-stone-500">{candidate ? candidate.listingReference : record.source}</td>
                  <td className="px-5 py-3 font-semibold text-gold-500">{(record.similarityScore * 100).toFixed(0)}%</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(record.status)}`}>{record.status}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-stone-500">{formatIsoDate(record.savedAt)}</td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-stone-500">
                  No history records match your filters. Adjust the status and search terms.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function statusBadgeClass(status: string) {
  if (status === 'Confirmed') return 'bg-gold-500/10 text-gold-600 border border-gold-300';
  if (status === 'Rejected') return 'bg-rose-100 text-rose-500 border border-rose-200';
  return 'bg-amber-50 text-amber-600 border border-amber-200';
}
