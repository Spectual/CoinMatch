import { useState } from 'react';

interface CoinImageProps {
  label: string;
  subtitle?: string;
  src?: string;
}

export default function CoinImage({ label, subtitle, src }: CoinImageProps) {
  const [failed, setFailed] = useState(!src);

  return (
    <div className="group">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-stone-200 bg-stone-100 shadow-inner">
        {src && !failed ? (
          <img
            src={src}
            alt={label}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-parchment via-white to-stone-100 text-center">
            <span className="text-sm font-medium uppercase tracking-wide text-gold-400">{subtitle ?? 'Coin Face'}</span>
            <span className="mt-1 text-xs text-stone-400">Image placeholder</span>
          </div>
        )}
      </div>
      <p className="mt-3 text-sm font-medium text-stone-700">{label}</p>
      {subtitle ? <p className="text-xs uppercase tracking-widest text-stone-400">{subtitle}</p> : null}
    </div>
  );
}
