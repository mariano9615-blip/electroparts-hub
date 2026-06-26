import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IconX } from '@tabler/icons-react';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const Modal = ({ open, onClose, title, children, footer, size = 'md' }: ModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const els = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!els.length) return;

      const first = els[0];
      const last = els[els.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const first = panel.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
  }, [open]);

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-150 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className={`bg-ep-surface rounded-2xl shadow-xl w-full overflow-hidden transition-all duration-150 ${SIZE_CLASSES[size]} ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-ep-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-ep-text-primary">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar">
            <IconX size={16} />
          </Button>
        </div>

        <div className="px-6 py-5">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-ep-border bg-ep-surface-raised flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
