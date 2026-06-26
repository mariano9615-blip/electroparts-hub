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
    <div className="flex items-start gap-4">
      <div
        className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${ICON_CLASSES[color]}`}
      >
        <Icono size={20} stroke={1.5} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-ep-text-muted uppercase tracking-wide">{label}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-2xl font-bold font-mono text-ep-text-primary">{value}</span>
          {badge != null && badge > 0 && (
            <Badge color="amber">{badge} pendientes</Badge>
          )}
        </div>
        {sub && <p className="text-xs text-ep-text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  </Card>
);
