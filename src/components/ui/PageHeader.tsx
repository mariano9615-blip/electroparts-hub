import React from 'react';

interface PageHeaderProps {
  titulo: string;
  descripcion?: string;
  accion?: React.ReactNode;
}

export const PageHeader = ({ titulo, descripcion, accion }: PageHeaderProps) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-xl font-semibold text-ep-text-primary">{titulo}</h1>
      {descripcion && <p className="text-sm text-ep-text-secondary mt-0.5">{descripcion}</p>}
    </div>
    {accion && <div className="flex-shrink-0 ml-4">{accion}</div>}
  </div>
);
