import type { ReactNode } from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: ReactNode;
}

export default function SummaryCard({ title, value, description, icon }: SummaryCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">{title}</p>
          <p className="mt-3 text-3xl font-display text-stone-900">{value}</p>
        </div>
        {icon ? <div className="text-gold-400">{icon}</div> : null}
      </div>
      {description ? <p className="mt-4 text-sm text-stone-500">{description}</p> : null}
    </div>
  );
}
