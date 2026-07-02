import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IconBolt,
  IconLayoutDashboard,
  IconClipboardList,
  IconFileInvoice,
  IconAlertTriangle,
  IconUsers,
  IconLogout,
} from '@tabler/icons-react';
import { Badge } from '../ui';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrdenesStore } from '../../store/useOrdenesStore';

interface NavItem {
  label: string;
  ruta: string;
  icono: React.ComponentType<{ size?: number; stroke?: number; className?: string }>;
  badge?: number;
}

export const SidebarAdmin = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const usuario = useAuthStore((s) => s.usuario);
  const nombre = useAuthStore((s) => s.nombre);
  const ordenes = useOrdenesStore((s) => s.ordenes);

  const disputasAbiertasBadge = ordenes.filter((o) => o.estado === 'disputada').length;

  const navItems: NavItem[] = [
    { label: 'Dashboard', ruta: '/admin', icono: IconLayoutDashboard },
    { label: 'Pedidos', ruta: '/admin/pedidos', icono: IconClipboardList },
    { label: 'Órdenes', ruta: '/admin/ordenes', icono: IconFileInvoice },
    { label: 'Disputas', ruta: '/admin/disputas', icono: IconAlertTriangle, badge: disputasAbiertasBadge },
    { label: 'Usuarios', ruta: '/admin/usuarios', icono: IconUsers },
  ];

  const handleLogout = () => {
    useAuthStore.getState().logout();
    navigate('/login');
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

      {/* Usuario logueado + badge de rol */}
      <div className="px-5 py-3 border-b border-white/10 flex-shrink-0">
        <p className="text-sm font-semibold text-white truncate">{nombre ?? usuario}</p>
        <div className="mt-1.5">
          <Badge color="red">Admin</Badge>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto pt-3 pb-2">
        {navItems.map((item) => {
          const esActivo = pathname === item.ruta;
          const Icono = item.icono;
          return (
            <div key={item.ruta} className="relative px-3 mb-0.5">
              {esActivo && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-ep-red rounded-r-full" />
              )}
              <button
                onClick={() => navigate(item.ruta)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-lg relative transition-colors duration-150 ${
                  esActivo
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <Icono size={17} stroke={esActivo ? 2 : 1.75} className={esActivo ? 'text-ep-red' : 'text-current'} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="bg-ep-red text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Footer: logout */}
      <div className="border-t border-white/10 px-3 py-3 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors duration-150 cursor-pointer"
        >
          <IconLogout size={17} stroke={1.75} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};
