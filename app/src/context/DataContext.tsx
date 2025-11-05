import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { fetchCandidates, fetchMatchHistory, fetchMuseumCoins, saveMatchDecision, type MatchRecordResponse } from '../api';
import { useAuth } from './AuthContext';
import type { CandidateCoin, CoinMetadata, MatchRecord, AuctionEvent } from '../types';

interface MatchDecisionPayload {
  museumCoinId: string;
  candidateId?: string;
  status: MatchRecord['status'];
  notes?: string;
}

interface DataContextValue {
  museumCoins: CoinMetadata[];
  candidateCoins: CandidateCoin[];
  matchHistory: MatchRecord[];
  loading: boolean;
  refreshData: () => Promise<void>;
  logMatchDecision: (payload: MatchDecisionPayload) => Promise<MatchRecord>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

function normalizeAuctionHistory(value: unknown): AuctionEvent[] {
  if (Array.isArray(value)) {
    return value as AuctionEvent[];
  }
  return [];
}

function normalizeCoin(coin: any): CoinMetadata {
  return {
    coin_id: coin.coin_id ?? coin.id ?? 'unknown-coin',
    mint: coin.mint ?? 'Unknown mint',
    authority: coin.authority ?? 'Unknown authority',
    date_range: coin.date_range ?? 'Unknown date',
    denomination: coin.denomination ?? 'Unknown denomination',
    metal: coin.metal ?? '—',
    weight: coin.weight ?? null,
    diameter: coin.diameter ?? null,
    die_axis: coin.die_axis ?? coin.dieAxis,
    obverse_description: coin.obverse_description ?? coin.obverseDescription ?? 'No description',
    reverse_description: coin.reverse_description ?? coin.reverseDescription ?? 'No description',
    obverse_inscription: coin.obverse_inscription ?? coin.obverseInscription,
    reverse_inscription: coin.reverse_inscription ?? coin.reverseInscription,
    monograms: coin.monograms,
    reference_list: coin.reference_list ?? coin.referenceList,
    catalog_number: coin.catalog_number ?? coin.catalogNumber,
    source_database: coin.source_database ?? coin.sourceDatabase,
    provenance_text: coin.provenance_text ?? coin.provenanceText,
    previous_owners: coin.previous_owners ?? coin.previousOwners,
    auction_history: normalizeAuctionHistory(coin.auction_history ?? coin.auctionHistory),
    estimate_value: coin.estimate_value ?? coin.estimateValue,
    sale_price: coin.sale_price ?? coin.salePrice,
    obverse_image_url: coin.obverse_image_url ?? coin.obverse_image_key ?? coin.obverseImageUrl,
    reverse_image_url: coin.reverse_image_url ?? coin.reverse_image_key ?? coin.reverseImageUrl,
    lot_description_raw: coin.lot_description_raw ?? coin.lotDescriptionRaw,
    lot_description_EN: coin.lot_description_EN ?? coin.lotDescriptionEn,
    created_at: coin.created_at ?? coin.createdAt ?? new Date().toISOString(),
    updated_at: coin.updated_at ?? coin.updatedAt ?? new Date().toISOString(),
    source_type: coin.source_type ?? coin.sourceType ?? 'museum'
  } as CoinMetadata;
}

function normalizeCandidate(candidate: any): CandidateCoin {
  const metadataRaw = candidate.metadata ?? {};
  const metadata = normalizeCoin({
    source_type: 'auction',
    ...metadataRaw,
    coin_id: metadataRaw.coin_id ?? candidate.id,
    created_at: metadataRaw.created_at ?? new Date().toISOString(),
    updated_at: metadataRaw.updated_at ?? new Date().toISOString()
  });

  return {
    id: candidate.id,
    museumCoinId: candidate.museumCoinId ?? metadata.coin_id,
    similarityScore: candidate.similarityScore ?? 0,
    listingReference: candidate.listingReference ?? metadata.catalog_number ?? 'Candidate listing',
    saleDate: candidate.saleDate ?? '',
    estimate_value: candidate.estimate_value ?? metadata.estimate_value,
    sale_price: candidate.sale_price ?? metadata.sale_price,
    metadata,
    listing_url: candidate.listing_url ?? metadata.obverse_image_url
  };
}

function normalizeMatch(record: MatchRecordResponse, coins: CoinMetadata[], candidates: CandidateCoin[]): MatchRecord {
  const status = (['Confirmed', 'Rejected', 'Pending'] as const).includes(record.status as any)
    ? (record.status as MatchRecord['status'])
    : 'Pending';

  const museumCoinTitle =
    record.museumCoinTitle ?? coins.find((coin) => coin.coin_id === record.coinId)?.catalog_number ?? record.coinId;
  const candidateTitle =
    record.candidateTitle ?? candidates.find((candidate) => candidate.id === record.candidateId)?.listingReference ?? 'Candidate';

  return {
    id: record.id.toString(),
    coinId: record.coinId,
    candidateId: record.candidateId,
    similarityScore: record.similarityScore ?? 0,
    status,
    savedAt: record.savedAt,
    source: record.source ?? candidateTitle,
    notes: record.notes ?? undefined,
    museumCoinTitle,
    candidateTitle
  };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [museumCoins, setMuseumCoins] = useState<CoinMetadata[]>([]);
  const [candidateCoins, setCandidateCoins] = useState<CandidateCoin[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshData = useCallback(async () => {
    if (!token) {
      setMuseumCoins([]);
      setCandidateCoins([]);
      setMatchHistory([]);
      return;
    }

    setLoading(true);
    try {
      const [coinsResponse, matchResponse, candidateResponse] = await Promise.all([
        fetchMuseumCoins(token),
        fetchMatchHistory(token),
        fetchCandidates(token)
      ]);

      const coins = coinsResponse.map((coin) => normalizeCoin(coin));
      const candidates = candidateResponse.map((candidate) => normalizeCandidate(candidate));
      const matches = matchResponse.items.map((item) => normalizeMatch(item, coins, candidates));

      setMuseumCoins(coins);
      setCandidateCoins(candidates);
      setMatchHistory(matches);
    } catch (error) {
      console.error('Failed to load data', error);
      setMuseumCoins([]);
      setCandidateCoins([]);
      setMatchHistory([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshData().catch((error) => {
      console.error('Unexpected error during data refresh', error);
    });
  }, [refreshData]);

  const logMatchDecision = useCallback(
    async ({ museumCoinId, candidateId, status, notes }: MatchDecisionPayload) => {
      if (!token) {
        throw new Error('No active session');
      }

      const response = await saveMatchDecision(token, {
        museum_coin_id: museumCoinId,
        candidate_id: candidateId,
        decision: status.toLowerCase(),
        notes
      });

      const normalized = normalizeMatch(response, museumCoins, candidateCoins);

      setMatchHistory((prev) => {
        const existingIndex = prev.findIndex((record) => record.id === normalized.id);
        if (existingIndex >= 0) {
          const clone = [...prev];
          clone[existingIndex] = normalized;
          return clone;
        }
        return [normalized, ...prev];
      });

      return normalized;
    },
    [token, museumCoins, candidateCoins]
  );

  const value = useMemo<DataContextValue>(
    () => ({ museumCoins, candidateCoins, matchHistory, loading, refreshData, logMatchDecision }),
    [museumCoins, candidateCoins, matchHistory, loading, refreshData, logMatchDecision]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
}
