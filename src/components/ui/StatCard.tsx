import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icono: React.ComponentType<{ size?: number; stroke?: number }>;
  color: 'green' | 'blue' | 'amber' | 'red';
  sub?: string;
}

const ACCENT_BORDER: Record<string, string> = {
  green: 'border-l-ep-green',
  blue: 'border-l-ep-blue',
  amber: 'border-l-ep-amber',
  red: 'border-l-ep-red',
};

const ACCENT_COLOR: Record<string, string> = {
  green: 'text-ep-green',
  blue: 'text-ep-blue',
  amber: 'text-ep-amber',
  red: 'text-ep-red',
};

export const StatCard = ({ label, value, icono: Icono, color, sub }: StatCardProps) => (
  <div
    className={`bg-ep-surface border border-ep-border border-l-4 ${ACCENT_BORDER[color]} rounded-lg px-4 py-3`}
  >
    <div className={`flex items-center gap-1.5 ${ACCENT_COLOR[color]}`}>
      <Icono size={13} stroke={1.75} />
      <span className="text-[10px] font-medium uppercase tracking-[0.06em]">
        {label}
      </span>
    </div>
    <div className="text-[26px] font-medium font-mono text-ep-text-primary mt-1 leading-none">
      {value}
    </div>
    {sub && <p className="text-[11px] text-ep-text-muted mt-0.5">{sub}</p>}
  </div>
);
