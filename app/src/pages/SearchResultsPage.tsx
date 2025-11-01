import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdjustmentsHorizontalIcon, ArrowPathIcon, PhotoIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import CoinImage from '../components/common/CoinImage';
import { useData } from '../context/DataContext';
import { formatAuthorityLine, formatCoinTitle, formatIsoDate, formatMeasurements } from '../utils/coinFormatting';
import type { CandidateCoin } from '../types';

const sortOptions = [
  { label: 'Similarity Score', value: 'score' },
  { label: 'Auction Date', value: 'date' }
];

export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const mode = params.get('mode') === 'text' ? 'text' : 'image';
  const navigate = useNavigate();
  const { candidateCoins, museumCoins } = useData();
  const DEFAULT_MIN_SCORE = 0.7;
  const [sort, setSort] = useState<'score' | 'date'>('score');
  const [minScore, setMinScore] = useState(DEFAULT_MIN_SCORE);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCandidates = useMemo(() => {
    return candidateCoins.filter((candidate) => candidate.similarityScore >= minScore);
  }, [minScore]);

  const sortedCandidates = useMemo(() => {
    return [...filteredCandidates].sort((a, b) => {
      if (sort === 'score') {
        return b.similarityScore - a.similarityScore;
      }
      return new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime();
    });
  }, [filteredCandidates, sort]);
  const topSimilarity = sortedCandidates.length ? (sortedCandidates[0].similarityScore * 100).toFixed(0) : '0';

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">{mode === 'image' ? 'Image Retrieval' : 'Text Retrieval'}</p>
          <h1 className="text-3xl font-display text-stone-900">Candidate Match Results</h1>
          <p className="text-sm text-stone-600">{mode === 'image' ? 'Side-by-side comparison based on obverse & reverse similarity.' : 'Results ranked by description, inscriptions, and catalog references.'}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold uppercase tracking-wide transition ${
              mode === 'image' ? 'bg-gold-500 text-white shadow-sm' : 'border border-stone-200 text-stone-600'
            }`}
            onClick={() => navigate('/search?mode=image')}
          >
            <PhotoIcon className="h-5 w-5" />
            Image search
          </button>
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold uppercase tracking-wide transition ${
              mode === 'text' ? 'bg-gold-500 text-white shadow-sm' : 'border border-stone-200 text-stone-600'
            }`}
            onClick={() => navigate('/search?mode=text')}
          >
            <DocumentTextIcon className="h-5 w-5" />
            Text search
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-dashed border-gold-300 bg-white/70 p-6 shadow-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-display text-stone-900">New {mode === 'image' ? 'image' : 'text'} query</h2>
            <p className="text-sm text-stone-500">Upload museum photography or provide descriptive keywords to re-run the search.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-gold-300 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-gold-500 transition hover:border-gold-400 hover:text-gold-400"
            >
              {mode === 'image' ? <PhotoIcon className="h-5 w-5" /> : <DocumentTextIcon className="h-5 w-5" />}
              {mode === 'image' ? 'Upload obverse & reverse' : 'Enter new query'}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-stone-200 px-4 py-2 text-sm text-stone-600 transition hover:border-gold-300 hover:text-gold-500"
              onClick={() => {
                setSort('score');
                setMinScore(DEFAULT_MIN_SCORE);
                setViewMode('grid');
              }}
            >
              <ArrowPathIcon className="h-5 w-5" />
              Clear filters
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-stone-500">
          Showing {sortedCandidates.length} candidates ≥{' '}
          <span className="font-semibold text-gold-500">{Math.round(minScore * 100)}%</span>. Highest similarity in view:{' '}
          <span className="font-semibold text-gold-500">{topSimilarity}%</span>.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            Sort by
            <select
              className="rounded-md border border-stone-200 bg-white/80 px-3 py-2 text-sm text-stone-700 focus:border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-200"
              value={sort}
              onChange={(event) => setSort(event.target.value as 'score' | 'date')}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
            Min score
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={Math.round(minScore * 100)}
              onChange={(event) => setMinScore(Number(event.target.value) / 100)}
              className="h-2 w-32 cursor-pointer rounded-lg accent-gold-500"
            />
            <span className="text-stone-600">{Math.round(minScore * 100)}%</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                viewMode === 'grid'
                  ? 'border-gold-300 bg-gold-500/10 text-gold-600'
                  : 'border-stone-200 text-stone-500 hover:border-gold-300 hover:text-gold-500'
              }`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              type="button"
              className={`rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                viewMode === 'list'
                  ? 'border-gold-300 bg-gold-500/10 text-gold-600'
                  : 'border-stone-200 text-stone-500 hover:border-gold-300 hover:text-gold-500'
              }`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {sortedCandidates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white/70 p-12 text-center text-sm text-stone-500">
          No candidate listings meet the current filters. Lower the minimum similarity score or change sort preferences.
        </div>
      ) : viewMode === 'grid' ? (
        <section className="grid gap-6 lg:grid-cols-3">
          {sortedCandidates.map((candidate) => {
            const museumCoin = museumCoins.find((coin) => coin.coin_id === candidate.museumCoinId);
            return (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                museumCoinId={museumCoin?.coin_id}
                onViewMuseum={() => museumCoin && navigate(`/coin/${museumCoin.coin_id}`)}
                onCompare={() => navigate(`/comparison/${candidate.id}`)}
              />
            );
          })}
        </section>
      ) : (
        <section className="space-y-4">
          {sortedCandidates.map((candidate) => {
            const museumCoin = museumCoins.find((coin) => coin.coin_id === candidate.museumCoinId);
            return (
              <CandidateRow
                key={candidate.id}
                candidate={candidate}
                museumCoinId={museumCoin?.coin_id}
                onViewMuseum={() => museumCoin && navigate(`/coin/${museumCoin.coin_id}`)}
                onCompare={() => navigate(`/comparison/${candidate.id}`)}
              />
            );
          })}
        </section>
      )}
    </div>
  );
}

interface CandidateLayoutProps {
  candidate: CandidateCoin;
  museumCoinId?: string;
  onCompare: () => void;
  onViewMuseum: () => void;
}

function CandidateCard({ candidate, museumCoinId, onCompare, onViewMuseum }: CandidateLayoutProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-stone-200 bg-white/80 shadow-card transition hover:border-gold-300">
      <div className="border-b border-stone-200 bg-parchment/60 px-6 py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-400">{candidate.listingReference}</p>
        <h2 className="mt-1 text-lg font-display text-stone-900">{formatCoinTitle(candidate.metadata)}</h2>
        <p className="text-xs text-stone-500">{formatAuthorityLine(candidate.metadata)}</p>
      </div>
      <div className="flex flex-1 flex-col gap-6 px-6 py-5">
        <div className="grid grid-cols-2 gap-4">
          <CoinImage label="Obverse" subtitle={candidate.listingReference} src={candidate.metadata.obverse_image_url} />
          <CoinImage label="Reverse" subtitle={candidate.listingReference} src={candidate.metadata.reverse_image_url} />
        </div>
        <div className="flex items-center justify-between rounded-xl bg-parchment/70 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-400">Similarity Score</p>
            <p className="text-xl font-display text-gold-500">{(candidate.similarityScore * 100).toFixed(0)}%</p>
            <p className="mt-1 text-xs text-stone-500">{formatMeasurements(candidate.metadata)}</p>
          </div>
          <div className="text-right text-xs text-stone-400">
            Estimate<br />
            {candidate.estimate_value ?? '—'}
            <br />
            Sale date {formatIsoDate(candidate.saleDate)}
          </div>
        </div>
      </div>
      <div className="flex gap-3 border-t border-stone-200 px-6 py-4">
        <button
          type="button"
          className="flex-1 rounded-md bg-gold-500 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-gold-400"
          onClick={onCompare}
        >
          Open comparison
        </button>
        <button
          type="button"
          className={`rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
            museumCoinId
              ? 'border-stone-200 text-stone-600 hover:border-gold-300 hover:text-gold-500'
              : 'cursor-not-allowed border-stone-100 text-stone-300'
          }`}
          onClick={() => museumCoinId && onViewMuseum()}
          disabled={!museumCoinId}
        >
          View museum record
        </button>
      </div>
    </article>
  );
}

function CandidateRow({ candidate, museumCoinId, onCompare, onViewMuseum }: CandidateLayoutProps) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white/80 p-5 shadow-card transition hover:border-gold-300 md:flex-row md:items-center">
      <div className="flex flex-1 flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-400">{candidate.listingReference}</p>
        <h2 className="text-xl font-display text-stone-900">{formatCoinTitle(candidate.metadata)}</h2>
        <p className="text-sm text-stone-600">{formatAuthorityLine(candidate.metadata)}</p>
        <p className="text-xs text-stone-500">Measurements · {formatMeasurements(candidate.metadata)}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
          <span>Similarity {Math.round(candidate.similarityScore * 100)}%</span>
          <span>Estimate {candidate.estimate_value ?? '—'}</span>
          <span>Sale {formatIsoDate(candidate.saleDate)}</span>
        </div>
      </div>
      <div className="flex flex-col items-stretch gap-3 md:w-64">
        <div className="flex gap-3">
          <div className="w-1/2">
            <CoinImage label="Obverse" subtitle="" src={candidate.metadata.obverse_image_url} />
          </div>
          <div className="w-1/2">
            <CoinImage label="Reverse" subtitle="" src={candidate.metadata.reverse_image_url} />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 rounded-md bg-gold-500 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-gold-400"
            onClick={onCompare}
          >
            Compare
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md border py-2 text-xs font-semibold uppercase tracking-wide transition ${
              museumCoinId
                ? 'border-stone-200 text-stone-600 hover:border-gold-300 hover:text-gold-500'
                : 'cursor-not-allowed border-stone-100 text-stone-300'
            }`}
            onClick={() => museumCoinId && onViewMuseum()}
            disabled={!museumCoinId}
          >
            Museum record
          </button>
        </div>
      </div>
    </article>
  );
}
