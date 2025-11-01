import { useEffect, useMemo, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckIcon, XMarkIcon, BookmarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import CoinImage from '../components/common/CoinImage';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { formatCoinTitle, formatAuthorityLine, formatMeasurements, formatAuctionEvent, formatIsoDate } from '../utils/coinFormatting';
import type { MatchRecord } from '../types';

export default function ComparisonPage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const { candidateCoins, museumCoins, matchHistory, logMatchDecision } = useData();
  const { pushToast } = useToast();
  const candidate = candidateCoins.find((item) => item.id === candidateId) ?? candidateCoins[0];
  const museumCoin = museumCoins.find((coin) => coin.coin_id === candidate.museumCoinId) ?? museumCoins[0];
  const [notes, setNotes] = useState('');

  const priorDecisions = useMemo(() => matchHistory.filter((record) => record.coinId === museumCoin.coin_id), [matchHistory, museumCoin.coin_id]);
  const existingDecision = useMemo(
    () =>
      priorDecisions.find(
        (record) => record.candidateId === candidate.id || record.candidateTitle === candidate.listingReference
      ),
    [candidate.id, candidate.listingReference, priorDecisions]
  );

  useEffect(() => {
    setNotes(existingDecision?.notes ?? '');
  }, [existingDecision]);

  const handleDecision = (status: MatchRecord['status']) => {
    try {
      const record = logMatchDecision({
        museumCoinId: museumCoin.coin_id,
        candidateId: candidate.id,
        status,
        notes: notes.trim() ? notes : undefined
      });
      const statusLabel =
        status === 'Confirmed' ? 'Match confirmed' : status === 'Rejected' ? 'Match rejected' : 'Saved for later review';
      pushToast({
        variant: 'success',
        title: statusLabel,
        description: `${record.candidateTitle} · ${formatIsoDate(record.savedAt)}`
      });
    } catch (error) {
      pushToast({
        variant: 'error',
        title: 'Unable to record decision',
        description: error instanceof Error ? error.message : 'Unexpected error'
      });
    }
  };

  return (
    <div className="space-y-10">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-gold-500"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to results
      </button>

      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Side-by-side Review</p>
          <h1 className="text-4xl font-display text-stone-900">{formatCoinTitle(museumCoin)}</h1>
          <p className="text-sm text-stone-600">Comparing against {candidate.listingReference}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-stone-400">{formatAuthorityLine(museumCoin)}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <DecisionButton
            icon={<CheckIcon className="h-5 w-5" />}
            label="Confirm Match"
            variant="confirm"
            active={existingDecision?.status === 'Confirmed'}
            onClick={() => handleDecision('Confirmed')}
          />
          <DecisionButton
            icon={<BookmarkIcon className="h-5 w-5" />}
            label="Save for Later"
            variant="save"
            active={existingDecision?.status === 'Pending'}
            onClick={() => handleDecision('Pending')}
          />
          <DecisionButton
            icon={<XMarkIcon className="h-5 w-5" />}
            label="Reject"
            variant="reject"
            active={existingDecision?.status === 'Rejected'}
            onClick={() => handleDecision('Rejected')}
          />
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-2">
        <ComparisonPanel
          title="Museum Coin"
          subtitle={`${museumCoin.catalog_number ?? museumCoin.coin_id}`}
          description={`${formatAuthorityLine(museumCoin)} · ${museumCoin.denomination}`}
          metadata={{
            Mint: museumCoin.mint,
            Metal: museumCoin.metal,
            Measurements: formatMeasurements(museumCoin),
            'Die Axis': museumCoin.die_axis ?? '—',
            Inscriptions: [museumCoin.obverse_inscription, museumCoin.reverse_inscription].filter(Boolean).join(' · ') || '—',
            References: museumCoin.reference_list ?? '—'
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <CoinImage label="Obverse" subtitle={museumCoin.catalog_number ?? museumCoin.coin_id} src={museumCoin.obverse_image_url} />
            <CoinImage label="Reverse" subtitle={museumCoin.catalog_number ?? museumCoin.coin_id} src={museumCoin.reverse_image_url} />
          </div>
        </ComparisonPanel>
        <ComparisonPanel
          title="Candidate Coin"
          subtitle={candidate.listingReference}
          description={`${formatAuthorityLine(candidate.metadata)} · ${candidate.metadata.denomination}`}
          metadata={{
            'Similarity Score': `${(candidate.similarityScore * 100).toFixed(0)}%`,
            'Sale Date': formatIsoDate(candidate.saleDate),
            Estimate: candidate.estimate_value ?? '—',
            'Sale Price': candidate.sale_price ?? '—',
            'Auction Event':
              candidate.metadata.auction_history.length > 0
                ? formatAuctionEvent(candidate.metadata.auction_history[0])
                : candidate.listingReference,
            Measurements: formatMeasurements(candidate.metadata),
            Inscriptions: [candidate.metadata.obverse_inscription, candidate.metadata.reverse_inscription].filter(Boolean).join(' · ') || '—'
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <CoinImage label="Obverse" subtitle={candidate.listingReference} src={candidate.metadata.obverse_image_url} />
              <CoinImage label="Reverse" subtitle={candidate.listingReference} src={candidate.metadata.reverse_image_url} />
            </div>
            {candidate.metadata.lot_description_EN ? (
              <div className="rounded-xl border border-stone-200 bg-parchment/60 p-4 text-xs leading-relaxed text-stone-600">
                {candidate.metadata.lot_description_EN}
              </div>
            ) : null}
          </div>
        </ComparisonPanel>
      </section>

      <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-card">
          <h2 className="text-2xl font-display text-stone-900">Match Notes</h2>
          <p className="mt-1 text-sm text-stone-500">Record provenance observations, die matches, or discrepancies before confirming.</p>
          <textarea
            placeholder="Die axis: 6h. Obverse die matches Dewing 4224 plate. Reverse legend partially worn..."
            rows={6}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-4 w-full resize-none rounded-xl border border-stone-200 bg-white/70 px-4 py-3 text-sm text-stone-700 shadow-inner focus:border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-200"
          />
          <p className="mt-2 text-xs text-stone-400">Automatically saved with your decision.</p>
        </article>
        <article className="rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-card">
          <h2 className="text-xl font-display text-stone-900">Previous Decisions</h2>
          <ul className="mt-4 space-y-3 text-sm text-stone-600">
            {priorDecisions.map((record) => (
              <li key={record.id} className="rounded-lg border border-stone-200 bg-white/70 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-stone-800">{record.candidateTitle}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(record.status)}`}>{record.status}</span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-stone-400">
                  <span>{record.source}</span>
                  <span>{formatIsoDate(record.savedAt)}</span>
                </div>
                {record.notes ? <p className="mt-2 text-xs text-stone-500">{record.notes}</p> : null}
              </li>
            ))}
            {priorDecisions.length === 0 ? (
              <li className="rounded-lg border border-dashed border-stone-200 px-3 py-6 text-center text-xs text-stone-400">
                No prior decisions recorded.
              </li>
            ) : null}
          </ul>
        </article>
      </section>
    </div>
  );
}

interface ComparisonPanelProps {
  title: string;
  subtitle: string;
  description: string;
  metadata: Record<string, string>;
  children: ReactNode;
}

function ComparisonPanel({ title, subtitle, description, metadata, children }: ComparisonPanelProps) {
  return (
    <article className="flex flex-col gap-6 rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-card">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-stone-400">{title}</p>
        <h2 className="mt-1 text-xl font-display text-stone-900">{subtitle}</h2>
        <p className="mt-2 text-sm text-stone-600">{description}</p>
      </div>
      {children}
      <dl className="grid gap-4 text-sm text-stone-700 sm:grid-cols-2">
        {Object.entries(metadata).map(([key, value]) => (
          <div key={key}>
            <dt className="text-xs uppercase tracking-wide text-stone-400">{key}</dt>
            <dd className="mt-1 font-medium text-stone-800">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

interface DecisionButtonProps {
  icon: JSX.Element;
  label: string;
  variant: 'confirm' | 'reject' | 'save';
  active?: boolean;
  onClick: () => void;
}

function DecisionButton({ icon, label, variant, active = false, onClick }: DecisionButtonProps) {
  const styles = {
    confirm: 'bg-gold-500 text-white hover:bg-gold-400',
    reject: 'bg-rose-500 text-white hover:bg-rose-400',
    save: 'border border-stone-200 text-stone-600 hover:border-gold-300 hover:text-gold-500'
  } as const;

  const activeStyles =
    variant === 'save'
      ? 'border-gold-400 text-gold-600 bg-gold-500/10'
      : 'ring-2 ring-offset-2 ring-gold-400';

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold uppercase tracking-wide transition ${styles[variant]} ${
        active ? activeStyles : ''
      }`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function statusBadgeClass(status: string) {
  if (status === 'Confirmed') return 'bg-gold-500/10 text-gold-600 border border-gold-300';
  if (status === 'Rejected') return 'bg-rose-100 text-rose-500 border border-rose-200';
  return 'bg-amber-50 text-amber-600 border border-amber-200';
}
