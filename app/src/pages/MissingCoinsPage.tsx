import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdjustmentsHorizontalIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { museumCoins } from '../data/mockData';
import { formatAuthorityLine, formatCoinTitle, formatIsoDate, formatMeasurements } from '../utils/coinFormatting';

export default function MissingCoinsPage() {
  const [query, setQuery] = useState('');
  const [mintFilter, setMintFilter] = useState('All Mints');
  const [authorityFilter, setAuthorityFilter] = useState('All Authorities');

  const mints = useMemo(() => ['All Mints', ...new Set(museumCoins.map((coin) => coin.mint))], []);
  const authorities = useMemo(() => ['All Authorities', ...new Set(museumCoins.map((coin) => coin.authority))], []);

  const filteredCoins = useMemo(() => {
    return museumCoins.filter((coin) => {
      const matchesQuery = [
        coin.catalog_number,
        coin.mint,
        coin.authority,
        coin.denomination,
        coin.date_range,
        coin.reference_list ?? '',
        coin.provenance_text ?? ''
      ]
        .join(' ')
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchesMint = mintFilter === 'All Mints' || coin.mint === mintFilter;
      const matchesAuthority = authorityFilter === 'All Authorities' || coin.authority === authorityFilter;
      return matchesQuery && matchesMint && matchesAuthority;
    });
  }, [query, mintFilter, authorityFilter]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Catalog</p>
        <h1 className="mt-1 text-3xl font-display text-stone-900">Missing Coins Registry</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          Browse the Dewing collection entries flagged as missing or potentially displaced. Filter by mint or issuing authority, scan inscriptions, and inspect provenance notes before launching a match search.
        </p>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-xl">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            placeholder="Search by catalog number, mint, authority, or reference…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 w-full rounded-lg border border-stone-200 bg-white/80 pl-10 pr-4 text-sm text-stone-800 shadow-sm focus:border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-200"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect label="Mint" value={mintFilter} options={mints} onChange={setMintFilter} />
          <FilterSelect label="Authority" value={authorityFilter} options={authorities} onChange={setAuthorityFilter} />
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-stone-200 px-4 py-2 text-sm text-stone-600 transition hover:border-gold-300 hover:text-gold-500"
            onClick={() => {
              setQuery('');
              setMintFilter('All Mints');
              setAuthorityFilter('All Authorities');
            }}
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white/80 shadow-card">
        <table className="min-w-full divide-y divide-stone-200 text-left text-sm text-stone-700">
          <thead className="bg-parchment/70 text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-5 py-3">Catalog No.</th>
              <th className="px-5 py-3">Coin</th>
              <th className="px-5 py-3">Authority & Date</th>
              <th className="px-5 py-3">Metal</th>
              <th className="px-5 py-3">Measurements</th>
              <th className="px-5 py-3">Updated</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 bg-white">
            {filteredCoins.map((coin) => (
              <tr key={coin.coin_id} className="transition hover:bg-parchment/50">
                <td className="px-5 py-3 font-medium text-stone-800">{coin.catalog_number}</td>
                <td className="px-5 py-3">
                  <p className="font-semibold text-stone-900">{formatCoinTitle(coin)}</p>
                  <p className="text-xs text-stone-500">{coin.obverse_description}</p>
                </td>
                <td className="px-5 py-3 text-sm text-stone-600">{formatAuthorityLine(coin)}</td>
                <td className="px-5 py-3 text-sm text-stone-600">{coin.metal}</td>
                <td className="px-5 py-3 text-sm text-stone-600">{formatMeasurements(coin)}</td>
                <td className="px-5 py-3 text-sm text-stone-500">{formatIsoDate(coin.updated_at)}</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    to={`/coin/${coin.coin_id}`}
                    className="inline-flex items-center gap-2 rounded-md border border-gold-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold-500 transition hover:border-gold-400 hover:text-gold-400"
                  >
                    View Detail
                  </Link>
                </td>
              </tr>
            ))}
            {filteredCoins.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-stone-500">
                  No coins matched your filters. Try adjusting the mint or authority selections.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
      {label}
      <select
        className="mt-1 min-w-[10rem] rounded-md border border-stone-200 bg-white/80 px-3 py-2 text-sm text-stone-700 shadow-sm focus:border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-200"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
