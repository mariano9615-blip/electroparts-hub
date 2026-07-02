import { useState } from 'react';
import { IconStarFilled, IconStar, IconStarHalfFilled } from '@tabler/icons-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

const SIZE_PX = { sm: 14, md: 20, lg: 32 };

const COLOR_POR_ESTRELLA: Record<number, string> = {
  1: 'text-ep-red',
  2: 'text-ep-amber-dark',
  3: 'text-ep-amber',
  4: 'text-ep-green',
  5: 'text-ep-green-dark',
};

export function StarRating({ value, onChange, size = 'md', showValue = false }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const interactivo = onChange !== undefined;
  const px = SIZE_PX[size];
  const valorMostrado = hover ?? value;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((estrella) => {
          const lleno = estrella <= Math.floor(valorMostrado);
          const medio = !lleno && estrella - 0.5 <= valorMostrado;
          const colorActivo = hover !== null ? COLOR_POR_ESTRELLA[hover] : 'text-ep-amber';
          const Icono = lleno ? IconStarFilled : medio ? IconStarHalfFilled : IconStar;

          return (
            <button
              key={estrella}
              type="button"
              disabled={!interactivo}
              onClick={() => onChange?.(estrella)}
              onMouseEnter={() => interactivo && setHover(estrella)}
              onMouseLeave={() => interactivo && setHover(null)}
              className={interactivo ? 'cursor-pointer' : 'cursor-default'}
            >
              <Icono
                size={px}
                className={lleno || medio ? colorActivo : 'text-ep-border'}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs font-mono text-ep-text-secondary">({value.toFixed(1)})</span>
      )}
    </div>
  );
}
