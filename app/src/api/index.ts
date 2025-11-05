import type { CoinMetadata } from '../types';
import { apiRequest } from './http';

interface LoginResponse {
  token: string;
  user: {
    name: string;
    email: string;
    role?: string;
  };
}

interface MatchHistoryResponse {
  items: Array<{
    id: number;
    coinId: string;
    candidateId?: string;
    similarityScore: number;
    status: string;
    savedAt: string;
    notes?: string;
    source?: string;
    museumCoinTitle?: string;
    candidateTitle?: string;
  }>;
  total: number;
}

interface SearchCandidateResponse {
  id: string;
  museumCoinId?: string;
  similarityScore: number;
  listingReference: string;
  saleDate?: string;
  estimate_value?: string;
  sale_price?: string;
  listing_url?: string;
  metadata?: Record<string, unknown>;
}

export interface MatchRecordResponse {
  id: number | string;
  coinId: string;
  candidateId?: string;
  similarityScore: number;
  status: string;
  savedAt: string;
  notes?: string;
  source?: string;
  museumCoinTitle?: string;
  candidateTitle?: string;
}

export async function loginRequest(email: string, password: string) {
  return apiRequest<LoginResponse>('/api/login', {
    method: 'POST',
    body: { email, password }
  });
}

export async function logoutRequest(token: string) {
  return apiRequest<{ detail: string }>('/api/logout', {
    method: 'POST',
    token
  });
}

export async function fetchProfile(token: string) {
  return apiRequest<LoginResponse['user']>('/api/user/profile', {
    token
  });
}

export async function fetchMuseumCoins(token: string) {
  return apiRequest<CoinMetadata[]>('/api/museum-coins', {
    token
  });
}

export async function fetchMatchHistory(token: string) {
  return apiRequest<MatchHistoryResponse>('/api/match/history', {
    token
  });
}

export async function fetchCandidates(token: string, query = '') {
  const payload = query ? { query } : { query: '' };
  const results = await apiRequest<SearchCandidateResponse[]>('/api/search/text', {
    method: 'POST',
    body: payload,
    token
  });
  return results;
}

export async function saveMatchDecision(
  token: string,
  body: {
    museum_coin_id: string;
    candidate_id?: string;
    decision: string;
    notes?: string;
  }
) {
  return apiRequest<MatchRecordResponse>('/api/match/save', {
    method: 'POST',
    body,
    token
  });
}

