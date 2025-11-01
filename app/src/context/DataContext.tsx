import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  museumCoins as initialMuseumCoins,
  candidateCoins as initialCandidateCoins,
  matchHistory as initialMatchHistory
} from '../data/mockData';
import type { CandidateCoin, CoinMetadata, MatchRecord } from '../types';
import { formatCoinTitle } from '../utils/coinFormatting';

interface MatchDecisionPayload {
  museumCoinId: string;
  candidateId: string;
  status: MatchRecord['status'];
  notes?: string;
}

interface DataContextValue {
  museumCoins: CoinMetadata[];
  candidateCoins: CandidateCoin[];
  matchHistory: MatchRecord[];
  logMatchDecision: (payload: MatchDecisionPayload) => MatchRecord;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

function generateId(prefix: string) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 10_000)}`;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [museumCoins] = useState<CoinMetadata[]>(initialMuseumCoins);
  const [candidateCoins] = useState<CandidateCoin[]>(initialCandidateCoins);
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>(initialMatchHistory);

  const logMatchDecision = useCallback(
    ({ museumCoinId, candidateId, status, notes }: MatchDecisionPayload) => {
      const candidate = candidateCoins.find((item) => item.id === candidateId);
      if (!candidate) {
        throw new Error('Candidate record not found');
      }
      const museumCoin = museumCoins.find((coin) => coin.coin_id === museumCoinId);
      if (!museumCoin) {
        throw new Error('Museum coin record not found');
      }

      let result: MatchRecord | undefined;
      setMatchHistory((prev) => {
        const timestamp = new Date().toISOString();
        const existingIndex = prev.findIndex((record) => record.coinId === museumCoinId && record.candidateId === candidateId);
        const baseRecord: MatchRecord = {
          id: existingIndex >= 0 ? prev[existingIndex].id : generateId('match'),
          coinId: museumCoinId,
          candidateId,
          similarityScore: candidate.similarityScore,
          status,
          savedAt: timestamp,
          source: candidate.listingReference,
          museumCoinTitle: formatCoinTitle(museumCoin),
          candidateTitle: candidate.listingReference,
          notes
        };
        result = baseRecord;
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], ...baseRecord, notes };
          return updated;
        }
        return [baseRecord, ...prev];
      });

      if (!result) {
        throw new Error('Unable to persist match decision');
      }
      return result;
    },
    [candidateCoins, museumCoins]
  );

  const value = useMemo<DataContextValue>(
    () => ({ museumCoins, candidateCoins, matchHistory, logMatchDecision }),
    [museumCoins, candidateCoins, matchHistory, logMatchDecision]
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
