import { ArrowUpRightIcon, ClockIcon, RectangleStackIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import SummaryCard from '../components/cards/SummaryCard';
import { useData } from '../context/DataContext';
import { formatCoinTitle, formatIsoDate } from '../utils/coinFormatting';

export default function DashboardPage() {
  const { museumCoins, candidateCoins, matchHistory, loading } = useData();
  const pendingReviews = matchHistory.filter((m) => m.status === 'Pending');
  const confirmedMatches = matchHistory.filter((m) => m.status === 'Confirmed');
  const topCandidates = [...candidateCoins].sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 3);
  const latestHistory = [...matchHistory].sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1)).slice(0, 5);

  if (loading && museumCoins.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-stone-500">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Welcome back</p>
        <h1 className="text-4xl font-display text-stone-900">Research Dashboard</h1>
        <p className="max-w-2xl text-stone-600">
          Track the Dewing collection&apos;s missing coins, review potential matches, and coordinate verification work across the team.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Missing Coins"
          value={museumCoins.length.toString()}
          description="Records awaiting verification in the Dewing ledger."
          icon={<RectangleStackIcon className="h-10 w-10" />}
        />
        <SummaryCard
          title="Pending Reviews"
          value={pendingReviews.length.toString()}
          description="Matches flagged for curator review before publication."
          icon={<ClockIcon className="h-10 w-10" />}
        />
        <SummaryCard
          title="Confirmed Matches"
          value={confirmedMatches.length.toString()}
          description="Verified identifications saved this quarter."
          icon={<SparklesIcon className="h-10 w-10" />}
        />
        <SummaryCard
          title="Top Similarity"
          value={`${Math.round((topCandidates[0]?.similarityScore ?? 0) * 100)}%`}
          description={
            topCandidates[0]
              ? `Best current candidate: ${formatCoinTitle(topCandidates[0].metadata)}`
              : 'Run a search to populate candidates.'
          }
          icon={<ArrowUpRightIcon className="h-10 w-10" />}
        />
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <article className="rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display text-stone-900">Action Center</h2>
              <p className="mt-1 text-sm text-stone-500">Jump into the most common tasks for the curatorial team.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ActionCard title="Browse Missing Coins" description="Review 19th century catalogued entries" to="/missing-coins" />
            <ActionCard title="Run Image Search" description="Upload obverse & reverse scans" to="/search?mode=image" />
            <ActionCard title="Run Text Query" description="Search by catalog number or inscription" to="/search?mode=text" />
            <ActionCard title="Review History" description="Validate saved or pending match decisions" to="/history" />
          </div>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-card">
          <h2 className="text-2xl font-display text-stone-900">Top Candidate Matches</h2>
          <p className="mt-1 text-sm text-stone-500">Highest similarity scores returned this week.</p>
          <ul className="mt-6 space-y-4">
            {topCandidates.map((candidate) => (
              <li
                key={candidate.id}
                className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3 transition hover:border-gold-300"
              >
                <div>
                  <p className="text-sm font-semibold text-stone-800">{formatCoinTitle(candidate.metadata)}</p>
                  <p className="text-xs text-stone-500">{candidate.listingReference}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gold-500">{(candidate.similarityScore * 100).toFixed(0)}%</p>
                  <p className="text-xs text-stone-400">{formatIsoDate(candidate.saleDate)}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-card">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-display text-stone-900">Latest Match Activity</h2>
            <p className="text-sm text-stone-500">Summary of confirmations and pending reviews logged by the team.</p>
          </div>
          <Link
            to="/history"
            className="inline-flex items-center gap-2 rounded-md border border-gold-300 px-4 py-2 text-sm font-medium text-gold-500 transition hover:border-gold-400 hover:text-gold-400"
          >
            View full history
            <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 overflow-hidden rounded-xl border border-stone-200">
          <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
            <thead className="bg-parchment/60 text-xs uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-4 py-3">Museum Coin</th>
                <th className="px-4 py-3">Candidate Source</th>
                <th className="px-4 py-3">Similarity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white/70">
              {latestHistory.map((record) => {
                  const museum = museumCoins.find((coin) => coin.coin_id === record.coinId);
                const candidate = candidateCoins.find((entry) => entry.id === record.candidateId);
                return (
                  <tr key={record.id} className="transition hover:bg-parchment/40">
                    <td className="px-4 py-3 font-medium text-stone-800">{museum ? formatCoinTitle(museum) : record.museumCoinTitle}</td>
                    <td className="px-4 py-3 text-stone-600">
                      {candidate ? candidate.listingReference : record.source}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gold-500">{(record.similarityScore * 100).toFixed(0)}%</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(record.status)}`}>{record.status}</span>
                    </td>
                    <td className="px-4 py-3 text-stone-500">{formatIsoDate(record.savedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function statusBadgeClass(status: string) {
  if (status === 'Confirmed') return 'bg-gold-500/10 text-gold-600 border border-gold-300';
  if (status === 'Rejected') return 'bg-rose-100 text-rose-500 border border-rose-200';
  return 'bg-amber-50 text-amber-600 border border-amber-200';
}

interface ActionCardProps {
  title: string;
  description: string;
  to: string;
}

function ActionCard({ title, description, to }: ActionCardProps) {
  return (
    <Link
      to={to}
      className="flex flex-col rounded-xl border border-stone-200 bg-white/80 p-4 text-left transition hover:border-gold-300 hover:shadow-md"
    >
      <span className="text-sm font-semibold text-stone-800">{title}</span>
      <span className="mt-2 text-xs text-stone-500">{description}</span>
    </Link>
  );
}
