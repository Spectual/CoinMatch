import { useMemo } from 'react';
import type { JSX } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  PhotoIcon,
  DocumentMagnifyingGlassIcon,
  MapPinIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import CoinImage from '../components/common/CoinImage';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import {
  formatAuctionEvent,
  formatAuthorityLine,
  formatCoinTitle,
  formatIsoDate,
  formatMeasurements
} from '../utils/coinFormatting';

export default function CoinDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { museumCoins, candidateCoins, matchHistory, loading } = useData();
  const { pushToast } = useToast();
  const coin = museumCoins.find((entry) => entry.coin_id === id) ?? null;

  if (!coin) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-stone-500">
        {loading ? 'Loading coin details…' : 'No coin data available.'}
      </div>
    );
  }

  const acceptedIds = useMemo(
    () =>
      new Set(
        matchHistory
          .filter((record) => record.status === 'Accepted' && record.candidateId)
          .map((record) => record.candidateId as string)
      ),
    [matchHistory]
  );
  const relatedMatches = useMemo(
    () => matchHistory.filter((record) => record.coinId === coin.coin_id),
    [coin.coin_id, matchHistory]
  );
  const suggestedCandidates = useMemo(() => {
    const related = candidateCoins
      .filter((candidate) => candidate.museumCoinId === coin.coin_id)
      .filter((candidate) => !acceptedIds.has(candidate.id));
    if (related.length > 0) return related;
    return [...candidateCoins]
      .filter((candidate) => !acceptedIds.has(candidate.id))
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 3);
  }, [candidateCoins, coin.coin_id, acceptedIds]);
  const referenceList = coin.reference_list ? coin.reference_list.split(';').map((item) => item.trim()).filter(Boolean) : [];

  return (
    <div className="space-y-10">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-gold-500"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to registry
      </button>

      <header className="flex flex-col gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Dewing catalog record</p>
          <h1 className="mt-2 text-4xl font-display text-stone-900">{formatCoinTitle(coin)}</h1>
          <p className="mt-1 text-sm text-stone-600">{formatAuthorityLine(coin)}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs uppercase tracking-wide text-stone-400">
            <span className="inline-flex items-center gap-2 text-stone-500">
              <MapPinIcon className="h-4 w-4" />
              {coin.mint}
            </span>
            <span className="inline-flex items-center gap-2 text-stone-500">
              <BookOpenIcon className="h-4 w-4" />
              {coin.catalog_number}
            </span>
            <span>{coin.source_database}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <ActionButton
            icon={<PhotoIcon className="h-5 w-5" />}
            label="Run Image Match"
            onClick={() => {
              pushToast({
                variant: 'info',
                title: 'Image search launching',
                description: 'Switching to candidate search workspace with image mode active.'
              });
              navigate('/search?mode=image');
            }}
          />
          <ActionButton
            icon={<DocumentMagnifyingGlassIcon className="h-5 w-5" />}
            label="Run Text Match"
            onClick={() => {
              pushToast({
                variant: 'info',
                title: 'Text search launching',
                description: 'Use catalog numbers, legends, or provenance cues to refine results.'
              });
              navigate('/search?mode=text');
            }}
          />
          <ActionButton icon={<ArrowPathIcon className="h-5 w-5" />} label="View Match History" onClick={() => navigate('/history')} variant="outline" />
        </div>
      </header>

      <section className="grid gap-8 xl:grid-cols-[1.8fr_1.2fr]">
        <article className="rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-card">
          <h2 className="text-2xl font-display text-stone-900">Summary</h2>
          <dl className="mt-6 grid gap-6 text-sm text-stone-700 md:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-400">Denomination</dt>
              <dd className="mt-1 font-medium text-stone-800">{coin.denomination}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-400">Metal</dt>
              <dd className="mt-1 font-medium text-stone-800">{coin.metal}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-400">Measurements</dt>
              <dd className="mt-1 font-medium text-stone-800">{formatMeasurements(coin)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-400">Source Type</dt>
              <dd className="mt-1 font-medium text-stone-800 capitalize">{coin.source_type}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-stone-400">Obverse Description</dt>
              <dd className="mt-2 leading-relaxed text-stone-700">{coin.obverse_description}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-stone-400">Reverse Description</dt>
              <dd className="mt-2 leading-relaxed text-stone-700">{coin.reverse_description}</dd>
            </div>
          </dl>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <MetadataBlock title="Inscriptions" value={[coin.obverse_inscription, coin.reverse_inscription].filter(Boolean).join(' · ') || '—'} />
            <MetadataBlock title="Monograms" value={coin.monograms ?? '—'} />
            <MetadataBlock title="Created" value={formatIsoDate(coin.created_at)} />
            <MetadataBlock title="Updated" value={formatIsoDate(coin.updated_at)} />
          </div>

          {referenceList.length > 0 ? (
            <div className="mt-8">
              <h3 className="text-xs uppercase tracking-[0.3em] text-stone-400">Reference Citations</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {referenceList.map((reference) => (
                  <li key={reference} className="rounded-full border border-stone-200 bg-parchment/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-stone-600">
                    {reference}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>

        <article className="rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-card">
          <h2 className="text-2xl font-display text-stone-900">Museum Imagery</h2>
          <div className="mt-6 grid gap-6">
            <CoinImage label="Obverse" subtitle={coin.catalog_number ?? coin.coin_id} src={coin.obverse_image_url} />
            <CoinImage label="Reverse" subtitle={coin.catalog_number ?? coin.coin_id} src={coin.reverse_image_url} />
          </div>
        </article>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.7fr_1.3fr]">
        <article className="rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-card">
          <h2 className="text-2xl font-display text-stone-900">Provenance & Notes</h2>
          <div className="mt-4 space-y-4 text-sm text-stone-600">
            <div>
              <p className="text-xs uppercase tracking-wide text-stone-400">Provenance Summary</p>
              <p className="mt-2 leading-relaxed">{coin.provenance_text ?? 'No provenance narrative recorded.'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-stone-400">Previous Owners</p>
              <p className="mt-2 leading-relaxed">{coin.previous_owners?.split(';').join(' · ') ?? '—'}</p>
            </div>
            {coin.lot_description_EN ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-stone-400">Auction Lot Excerpt</p>
                <p className="mt-2 whitespace-pre-line rounded-xl bg-parchment/70 p-4 text-sm leading-relaxed text-stone-700">
                  {coin.lot_description_EN}
                </p>
              </div>
            ) : null}
          </div>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-card">
          <h2 className="text-2xl font-display text-stone-900">Auction History</h2>
          <p className="mt-1 text-sm text-stone-500">Structured events compiled from internal research and public databases.</p>
          <ul className="mt-5 space-y-3">
            {coin.auction_history.map((event) => (
              <li key={`${event.house}-${event.lot}`} className="rounded-xl border border-stone-200 bg-white/70 px-4 py-3 text-sm text-stone-700">
                {formatAuctionEvent(event)}
              </li>
            ))}
            {coin.auction_history.length === 0 ? (
              <li className="rounded-xl border border-dashed border-stone-200 px-4 py-6 text-center text-xs text-stone-400">
                No confirmed auction appearances.
              </li>
            ) : null}
          </ul>
        </article>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <article className="rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-card">
          <h2 className="text-2xl font-display text-stone-900">Related Match History</h2>
          <p className="mt-1 text-sm text-stone-500">Decisions logged for this coin by the research team.</p>
          <ul className="mt-6 space-y-4">
            {relatedMatches.map((record) => (
              <li key={record.id} className="rounded-xl border border-stone-200 bg-white/70 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium text-stone-800">{record.candidateTitle}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(record.status)}`}>{record.status}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-stone-500">
                  <span>{record.source}</span>
                  <span>{formatIsoDate(record.savedAt)}</span>
                </div>
                {record.notes ? <p className="mt-2 text-xs text-stone-500">{record.notes}</p> : null}
              </li>
            ))}
            {relatedMatches.length === 0 ? (
              <li className="rounded-xl border border-dashed border-stone-200 px-4 py-6 text-center text-sm text-stone-500">
                No saved matches yet. Run a search to gather candidates and begin verification.
              </li>
            ) : null}
          </ul>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-card">
          <h2 className="text-2xl font-display text-stone-900">Suggested Candidates</h2>
          <p className="mt-1 text-sm text-stone-500">Top external listings aligned to this record.</p>
          <ul className="mt-6 space-y-4">
            {suggestedCandidates.map((candidate) => (
              <li
                key={candidate.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-stone-200 px-4 py-3 transition hover:border-gold-300"
              >
                <div>
                  <p className="text-sm font-semibold text-stone-800">{formatCoinTitle(candidate.metadata)}</p>
                  <p className="text-xs text-stone-500">{candidate.listingReference}</p>
                  <p className="mt-1 text-xs text-stone-400">{formatIsoDate(candidate.saleDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gold-500">{(candidate.similarityScore * 100).toFixed(0)}%</p>
                  <button
                    type="button"
                    className="mt-1 text-xs font-semibold uppercase tracking-wide text-gold-500 transition hover:text-gold-400"
                    onClick={() => navigate(`/comparison/${candidate.id}`)}
                  >
                    Compare
                  </button>
                </div>
              </li>
            ))}
            {suggestedCandidates.length === 0 ? (
              <li className="rounded-xl border border-dashed border-stone-200 px-4 py-6 text-center text-sm text-stone-500">
                No candidate listings linked yet. Run a search to populate suggestions.
              </li>
            ) : null}
          </ul>
        </article>
      </section>
    </div>
  );
}

interface ActionButtonProps {
  icon: JSX.Element;
  label: string;
  onClick: () => void;
  variant?: 'solid' | 'outline';
}

function ActionButton({ icon, label, onClick, variant = 'solid' }: ActionButtonProps) {
  const baseStyles = 'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition uppercase tracking-wide';
  const variants =
    variant === 'solid'
      ? 'bg-gold-500 text-white shadow-sm hover:bg-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-300'
      : 'border border-gold-300 text-gold-500 hover:border-gold-400 hover:text-gold-400';

  return (
    <button type="button" onClick={onClick} className={`${baseStyles} ${variants}`}>
      {icon}
      {label}
    </button>
  );
}

function MetadataBlock({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-stone-400">{title}</p>
      <p className="mt-2 text-sm font-medium text-stone-700">{value}</p>
    </div>
  );
}

function statusBadgeClass(status: string) {
  if (status === 'Accepted') return 'bg-gold-500/10 text-gold-600 border border-gold-300';
  if (status === 'Rejected') return 'bg-rose-100 text-rose-500 border border-rose-200';
  return 'bg-amber-50 text-amber-600 border border-amber-200';
}
