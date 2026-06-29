import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icono: React.ComponentType<{ size?: number; stroke?: number }>;
  titulo: string;
  mensaje: string;
  accion?: { label: string; onClick: () => void };
}

export const EmptyState = ({ icono: Icono, titulo, mensaje, accion }: EmptyStateProps) => (
  <div className="text-center py-14 px-6 bg-ep-surface border border-ep-border rounded-xl shadow-sm">
    <div className="text-ep-text-disabled flex justify-center mb-4">
      <Icono size={44} stroke={1.25} />
    </div>
    <p className="text-sm font-semibold text-ep-text-primary mb-1">{titulo}</p>
    <p className="text-sm text-ep-text-secondary max-w-xs mx-auto leading-relaxed">{mensaje}</p>
    {accion && (
      <div className="mt-5">
        <Button variant="primary" onClick={accion.onClick}>
          {accion.label}
        </Button>
      </div>
    )}
  </div>
);
