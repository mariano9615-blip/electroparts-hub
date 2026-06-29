import { useLocation, useNavigate } from 'react-router-dom';
import { IconMenu2, IconLogout } from '@tabler/icons-react';
import { Badge, Button } from '../ui';
import { useRolStore } from '../../store/useRolStore';
import { useAuthStore } from '../../store/useAuthStore';

interface TopBarProps {
  onToggleSidebar: () => void;
}

const BREADCRUMB_MAP: Record<string, string> = {
  '/comprador': 'Dashboard',
  '/comprador/publicar': 'Publicar pedido',
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

  const handleLogout = () => {
    useAuthStore.getState().logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-ep-surface border-b border-ep-border flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-1.5 rounded-lg text-ep-text-secondary hover:bg-ep-surface-raised transition-colors duration-150"
          onClick={onToggleSidebar}
          aria-label="Abrir menú"
        >
          <IconMenu2 size={20} />
        </button>
        <span className="text-sm font-medium text-ep-text-primary hidden md:block">{seccion}</span>
      </div>

      <div className="flex items-center gap-3">
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
  );
};
