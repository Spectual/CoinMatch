export interface AuctionEvent {
  house: string;
  sale?: string;
  year?: number;
  date?: string;
  lot: string;
  price_realized?: string;
}

export interface CoinMetadata {
  coin_id: string;
  mint: string;
  authority: string;
  date_range: string;
  denomination: string;
  metal: string;
  weight: number | null;
  diameter: number | null;
  die_axis?: string;
  obverse_description: string;
  reverse_description: string;
  obverse_inscription?: string;
  reverse_inscription?: string;
  monograms?: string;
  reference_list?: string;
  catalog_number?: string;
  source_database?: string;
  provenance_text?: string;
  previous_owners?: string;
  auction_history: AuctionEvent[];
  estimate_value?: string;
  sale_price?: string;
  obverse_image_url?: string;
  reverse_image_url?: string;
  lot_description_raw?: string;
  lot_description_EN?: string;
  created_at: string;
  updated_at: string;
  source_type: string;
}

export interface CandidateCoin {
  id: string;
  museumCoinId: string;
  similarityScore: number;
  listingReference: string;
  saleDate: string;
  estimate_value?: string;
  sale_price?: string;
  metadata: CoinMetadata;
  listing_url?: string;
}

export interface MatchRecord {
  id: string;
  coinId: string;
  museumCoinTitle: string;
  candidateTitle: string;
  candidateId?: string;
  similarityScore: number;
  status: 'Confirmed' | 'Rejected' | 'Pending';
  savedAt: string;
  source: string;
  notes?: string;
}
