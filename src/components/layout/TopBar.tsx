import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconMenu2, IconLogout, IconBell } from '@tabler/icons-react';
import { Badge, Button } from '../ui';
import { useRolStore } from '../../store/useRolStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificacionesStore } from '../../store/useNotificacionesStore';
import { NotificacionesPanel } from './NotificacionesPanel';

interface TopBarProps {
  onToggleSidebar: () => void;
}

const BREADCRUMB_MAP: Record<string, string> = {
  '/comprador': 'Dashboard',
  '/comprador/publicar': 'Publicar pedido',
  '/comprador/pedidos': 'Mis pedidos',
  '/comprador/cotizaciones': 'Cotizaciones',
  '/comprador/ordenes': 'Mis órdenes',
  '/comprador/chat': 'Chat activo',
  '/proveedor': 'Dashboard',
  '/proveedor/pedidos': 'Pedidos disponibles',
  '/proveedor/cotizaciones': 'Mis cotizaciones',
  '/proveedor/ordenes': 'Mis órdenes',
  '/proveedor/chat': 'Chat activo',
};

export const TopBar = ({ onToggleSidebar }: TopBarProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const rol = useRolStore((s) => s.rol);
  const seccion = BREADCRUMB_MAP[pathname] ?? 'ElectroParts Hub';
  const [panelAbierto, setPanelAbierto] = useState(false);

  const cantidadNoLeidas = useNotificacionesStore(
    (s) => s.notificaciones.filter((n) => n.rolDestino === rol && !n.leida).length,
  );

  const handleLogout = () => {
    useAuthStore.getState().logout();
    navigate('/login');
  };

  return (
    <>
      <header className="h-14 bg-ep-surface border-b border-ep-border shadow-sm flex items-center justify-between px-6 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-1.5 rounded-lg text-ep-text-secondary hover:bg-ep-surface-raised transition-colors duration-150"
            onClick={onToggleSidebar}
            aria-label="Abrir menú"
          >
            <IconMenu2 size={20} />
          </button>
          <span className="text-sm font-semibold text-ep-text-primary hidden md:block">{seccion}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón de notificaciones con badge */}
          <div className="relative">
            <button
              className="p-1.5 rounded-lg text-ep-text-secondary hover:bg-ep-surface-raised transition-colors duration-150"
              onClick={() => setPanelAbierto((v) => !v)}
              aria-label="Notificaciones"
            >
              <IconBell size={20} />
              {cantidadNoLeidas > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 bg-ep-red text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                  {cantidadNoLeidas > 9 ? '9+' : cantidadNoLeidas}
                </span>
              )}
            </button>
          </div>

          <Badge color={rol === 'comprador' ? 'green' : 'blue'}>
            {rol === 'comprador' ? 'Comprador' : 'Proveedor'}
          </Badge>

          <div className="w-px h-5 bg-ep-border" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-ep-green-light rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-ep-green-dark">ME</span>
            </div>
            <span className="text-sm font-medium text-ep-text-primary hidden md:block">
              Mi Empresa
            </span>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <IconLogout size={16} />
            <span className="hidden sm:inline ml-1">Salir</span>
          </Button>
        </div>
      </header>

      <NotificacionesPanel abierto={panelAbierto} onCerrar={() => setPanelAbierto(false)} />
    </>
  );
};
