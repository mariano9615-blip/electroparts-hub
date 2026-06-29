import React from 'react';
import { Badge } from './Badge';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string | number;
  icono: React.ComponentType<{ size?: number; stroke?: number }>;
  color: 'green' | 'blue' | 'amber' | 'red';
  badge?: number;
  sub?: string;
}

const ICON_CLASSES = {
  green: 'bg-ep-green-light text-ep-green',
  blue: 'bg-ep-blue-light text-ep-blue',
  amber: 'bg-ep-amber-light text-ep-amber',
  red: 'bg-ep-red-light text-ep-red',
};

export const StatCard = ({ label, value, icono: Icono, color, badge, sub }: StatCardProps) => (
  <Card hoverable={false}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-ep-text-muted uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-2.5 mt-1.5">
          <span className="text-3xl font-bold font-mono text-ep-text-primary leading-none">
            {value}
          </span>
          {badge != null && badge > 0 && <Badge color="amber">{badge} pendientes</Badge>}
        </div>
        {sub && <p className="text-xs text-ep-text-muted mt-1.5">{sub}</p>}
      </div>
      <div
        className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center ${ICON_CLASSES[color]}`}
      >
        <Icono size={22} stroke={1.5} />
      </div>
    </div>
  </Card>
);
