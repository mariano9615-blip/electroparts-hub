import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IconBolt,
  IconLayoutDashboard,
  IconPlus,
  IconFileInvoice,
  IconShoppingCart,
  IconPackage,
  IconClipboardList,
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
  { label: 'Mis pedidos', ruta: '/comprador/pedidos', icono: IconClipboardList },
  { label: 'Cotizaciones', ruta: '/comprador/cotizaciones', icono: IconFileInvoice },
  { label: 'Mis órdenes', ruta: '/comprador/ordenes', icono: IconShoppingCart },
];

const NAV_PROVEEDOR: NavItem[] = [
  { label: 'Dashboard', ruta: '/proveedor', icono: IconLayoutDashboard },
  { label: 'Pedidos disponibles', ruta: '/proveedor/pedidos', icono: IconPackage },
  { label: 'Mis cotizaciones', ruta: '/proveedor/cotizaciones', icono: IconFileInvoice },
  { label: 'Mis órdenes', ruta: '/proveedor/ordenes', icono: IconShoppingCart },
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
    <aside className="flex flex-col h-full bg-ep-blue-dark overflow-hidden">
      {/* Branding */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10 flex-shrink-0">
        <div className="w-8 h-8 bg-ep-green rounded-lg flex items-center justify-center flex-shrink-0">
          <IconBolt size={18} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm text-white leading-tight tracking-tight">
            ElectroParts Hub
          </p>
          <p className="text-xs text-slate-400 leading-tight">Marketplace B2B</p>
        </div>
      </div>

      {/* Toggle de rol */}
      <div className="px-4 py-3 border-b border-white/10 flex-shrink-0">
        <div className="bg-white/10 rounded-lg p-1 flex">
          <button
            className={`flex-1 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-150 ${
              rol === 'comprador'
                ? 'bg-white/20 shadow-sm text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => handleSetRol('comprador')}
          >
            Comprador
          </button>
          <button
            className={`flex-1 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-150 ${
              rol === 'proveedor'
                ? 'bg-white/20 shadow-sm text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => handleSetRol('proveedor')}
          >
            Proveedor
          </button>
        </div>
      </div>

      {/* Etiqueta de sección */}
      <div className="px-5 pt-4 pb-1.5 flex-shrink-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {rol === 'comprador' ? 'Comprador' : 'Proveedor'}
        </span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto pb-2">
        {navItems.map((item) => {
          const esActivo =
            pathname === item.ruta ||
            (item.ruta === '/comprador/pedidos' && pathname.startsWith('/comprador/pedidos/'));
          const Icono = item.icono;
          return (
            <div key={item.ruta} className="relative px-3 mb-0.5">
              {esActivo && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-ep-green rounded-r-full" />
              )}
              <button
                onClick={() => navigate(item.ruta)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-lg relative transition-colors duration-150 ${
                  esActivo
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <Icono
                  size={17}
                  stroke={esActivo ? 2 : 1.75}
                  className={esActivo ? 'text-ep-green' : 'text-current'}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="bg-ep-amber text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-5 py-3 flex-shrink-0">
        <span className="text-xs text-slate-500">v0.1.0</span>
      </div>
    </aside>
  );
};
