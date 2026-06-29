import React from 'react';

interface PageHeaderProps {
  titulo: string;
  descripcion?: string;
  accion?: React.ReactNode;
}

export const PageHeader = ({ titulo, descripcion, accion }: PageHeaderProps) => (
  <div className="flex items-start justify-between pb-5 mb-6 border-b border-ep-border">
    <div>
      <h1 className="text-2xl font-bold text-ep-text-primary leading-tight">{titulo}</h1>
      {descripcion && <p className="text-sm text-ep-text-secondary mt-1">{descripcion}</p>}
    </div>
    {accion && <div className="flex-shrink-0 ml-4">{accion}</div>}
  </div>
);
