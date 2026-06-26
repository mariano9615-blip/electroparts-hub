import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icono: React.ComponentType<{ size?: number; stroke?: number }>;
  titulo: string;
  mensaje: string;
  accion?: { label: string; onClick: () => void };
}

export const EmptyState = ({ icono: Icono, titulo, mensaje, accion }: EmptyStateProps) => (
  <div className="text-center py-12 px-6">
    <div className="text-ep-text-muted flex justify-center mb-4">
      <Icono size={48} stroke={1.5} />
    </div>
    <p className="text-base font-semibold text-ep-text-primary mb-1">{titulo}</p>
    <p className="text-sm text-ep-text-secondary max-w-xs mx-auto">{mensaje}</p>
    {accion && (
      <div className="mt-4">
        <Button variant="primary" onClick={accion.onClick}>
          {accion.label}
        </Button>
      </div>
    )}
  </div>
);
