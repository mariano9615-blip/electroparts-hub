import React from 'react';
import { Badge } from './Badge';

interface StatCardProps {
  label: string;
  value: string | number;
  icono: React.ComponentType<{ size?: number; stroke?: number }>;
  color: 'green' | 'blue' | 'amber' | 'red';
  badge?: number;
  sub?: string;
}

const ACCENT_BORDER: Record<string, string> = {
  green: 'border-l-ep-green',
  blue: 'border-l-ep-blue',
  amber: 'border-l-ep-amber',
  red: 'border-l-ep-red',
};

const ICON_COLOR: Record<string, string> = {
  green: 'text-ep-green',
  blue: 'text-ep-blue',
  amber: 'text-ep-amber',
  red: 'text-ep-red',
};

export const StatCard = ({ label, value, icono: Icono, color, badge, sub }: StatCardProps) => (
  <div
    className={`bg-ep-surface border border-ep-border border-l-4 ${ACCENT_BORDER[color]} rounded-xl shadow-sm px-4 py-3`}
  >
    <div className="flex items-center gap-1.5 mb-2">
      <div className={ICON_COLOR[color]}>
        <Icono size={13} stroke={1.75} />
      </div>
      <span className="text-xs font-semibold text-ep-text-muted uppercase tracking-wider">
        {label}
      </span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold font-mono text-ep-text-primary leading-none">
        {value}
      </span>
      {badge != null && badge > 0 && <Badge color="amber">{badge} pendientes</Badge>}
    </div>
    {sub && <p className="text-xs text-ep-text-muted mt-1">{sub}</p>}
  </div>
);
