import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IconBolt,
  IconLayoutDashboard,
  IconPlus,
  IconFileInvoice,
  IconShoppingCart,
  IconMessage,
  IconPackage,
} from '@tabler/icons-react';
import { useRolStore } from '../../store/useRolStore';
import { useCotizacionesStore } from '../../store/useCotizacionesStore';
import type { Rol } from '../../types';

interface NavItem {
  label: string;
  ruta: string;
  icono: React.ComponentType<{ size?: number; stroke?: number; className?: string }>;
  badge?: number;
}

const NAV_COMPRADOR: NavItem[] = [
  { label: 'Dashboard', ruta: '/comprador', icono: IconLayoutDashboard },
  { label: 'Publicar pedido', ruta: '/comprador/publicar', icono: IconPlus },
  { label: 'Cotizaciones', ruta: '/comprador/cotizaciones', icono: IconFileInvoice },
  { label: 'Mis órdenes', ruta: '/comprador/ordenes', icono: IconShoppingCart },
  { label: 'Chat activo', ruta: '/comprador/chat', icono: IconMessage },
];

const NAV_PROVEEDOR: NavItem[] = [
  { label: 'Dashboard', ruta: '/proveedor', icono: IconLayoutDashboard },
  { label: 'Pedidos disponibles', ruta: '/proveedor/pedidos', icono: IconPackage },
  { label: 'Mis cotizaciones', ruta: '/proveedor/cotizaciones', icono: IconFileInvoice },
  { label: 'Mis órdenes', ruta: '/proveedor/ordenes', icono: IconShoppingCart },
  { label: 'Chat activo', ruta: '/proveedor/chat', icono: IconMessage },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const rol = useRolStore((s) => s.rol);
  const setRol = useRolStore((s) => s.setRol);
  const cotizaciones = useCotizacionesStore((s) => s.cotizaciones);

  const pendientes = cotizaciones.filter((c) => c.estado === 'pendiente').length;

  const navItems: NavItem[] = (rol === 'comprador' ? NAV_COMPRADOR : NAV_PROVEEDOR).map((item) => {
    if (item.ruta === '/comprador/cotizaciones' || item.ruta === '/proveedor/cotizaciones') {
      return { ...item, badge: pendientes };
    }
    return item;
  });

  const handleSetRol = (nuevoRol: Rol) => {
    setRol(nuevoRol);
    navigate(nuevoRol === 'comprador' ? '/comprador' : '/proveedor');
  };

  return (
    <aside className="flex flex-col h-full bg-ep-surface border-r border-ep-border overflow-hidden">
      {/* Branding */}
      <div className="h-16 flex items-center gap-2.5 px-4 border-b border-ep-border flex-shrink-0">
        <IconBolt size={22} className="text-ep-green flex-shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold text-sm text-ep-text-primary leading-tight">
            ElectroParts Hub
          </p>
          <p className="text-xs text-ep-text-muted leading-tight">Marketplace B2B</p>
        </div>
      </div>

      {/* Toggle de rol */}
      <div className="px-3 py-3 flex-shrink-0">
        <div className="bg-ep-surface-raised rounded-lg p-1 flex">
          <button
            className={`flex-1 text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-150 ${
              rol === 'comprador'
                ? 'bg-ep-surface shadow-sm text-ep-text-primary'
                : 'text-ep-text-muted hover:text-ep-text-secondary'
            }`}
            onClick={() => handleSetRol('comprador')}
          >
            Comprador
          </button>
          <button
            className={`flex-1 text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-150 ${
              rol === 'proveedor'
                ? 'bg-ep-surface shadow-sm text-ep-text-primary'
                : 'text-ep-text-muted hover:text-ep-text-secondary'
            }`}
            onClick={() => handleSetRol('proveedor')}
          >
            Proveedor
          </button>
        </div>
      </div>

      {/* Etiqueta de sección */}
      <div className="px-3 pt-2 pb-1 flex-shrink-0">
        <span className="text-xs font-semibold text-ep-text-muted uppercase tracking-wider px-3">
          {rol === 'comprador' ? 'Comprador' : 'Proveedor'}
        </span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto py-1">
        {navItems.map((item) => {
          const esActivo = pathname === item.ruta;
          const Icono = item.icono;
          return (
            <button
              key={item.ruta}
              onClick={() => navigate(item.ruta)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium cursor-pointer rounded-lg mx-2 relative transition-colors duration-150 ${
                esActivo
                  ? 'bg-ep-green-light text-ep-green-dark'
                  : 'text-ep-text-secondary hover:bg-ep-surface-raised hover:text-ep-text-primary'
              }`}
              style={{ width: 'calc(100% - 16px)' }}
            >
              <Icono
                size={18}
                stroke={1.75}
                className={esActivo ? 'text-ep-green' : 'text-current'}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="absolute right-3 bg-ep-amber text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-ep-border px-4 py-3 flex-shrink-0">
        <span className="text-xs text-ep-text-muted">v0.1.0</span>
      </div>
    </aside>
  );
};
