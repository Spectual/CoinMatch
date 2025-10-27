import type { AuctionEvent, CoinMetadata } from '../types';

export function formatCoinTitle(coin: CoinMetadata): string {
  const metalParts = coin.metal.split(' ');
  const metalShort = metalParts.length > 1 ? metalParts[0] : coin.metal;
  return `${coin.mint} · ${coin.denomination} (${metalShort})`;
}

export function formatAuthorityLine(coin: CoinMetadata): string {
  return `${coin.authority} · ${coin.date_range}`;
}

export function formatMeasurements(coin: CoinMetadata): string {
  const weight = coin.weight ? `${coin.weight.toFixed(2)} g` : '—';
  const diameter = coin.diameter ? `${coin.diameter.toFixed(1)} mm` : '—';
  const dieAxis = coin.die_axis ?? '—';
  return `${weight} · ${diameter} · die axis ${dieAxis}`;
}

export function formatAuctionEvent(event: AuctionEvent): string {
  const saleLabel = [event.house, event.sale].filter(Boolean).join(' ');
  const date = event.date ?? (event.year ? event.year.toString() : '');
  const lot = `Lot ${event.lot}`;
  const price = event.price_realized ? ` · ${event.price_realized}` : '';
  return `${saleLabel} (${date}) · ${lot}${price}`;
}

export function formatIsoDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
