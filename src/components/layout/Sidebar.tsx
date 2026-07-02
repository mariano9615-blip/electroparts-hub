import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IconBolt,
  IconLayoutDashboard,
  IconPlus,
  IconFileInvoice,
  IconShoppingCart,
  IconClipboardList,
  IconSearch,
  IconLogout,
} from '@tabler/icons-react';
import { Badge } from '../ui';
import { useAuthStore } from '../../store/useAuthStore';
import { useCotizacionesStore } from '../../store/useCotizacionesStore';
import { usePedidosStore } from '../../store/usePedidosStore';
import { COMPRADOR_ID, PROV_IDS } from '../../utils/constants';

interface NavItem {
  label: string;
  ruta: string;
  icono: React.ComponentType<{ size?: number; stroke?: number; className?: string }>;
  badge?: number;
  matchPrefix?: string;
}

export const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const usuario = useAuthStore((s) => s.usuario);
  const nombre = useAuthStore((s) => s.nombre);
  const rol = useAuthStore((s) => s.rol);
  const pedidos = usePedidosStore((s) => s.pedidos);
  const cotizaciones = useCotizacionesStore((s) => s.cotizaciones);

  // ── Badges comprador ───────────────────────────────────────────────────────
  const misPedidoIds = new Set(
    pedidos.filter((p) => p.compradorId === COMPRADOR_ID).map((p) => p.id),
  );
  const misPedidosActivosBadge = pedidos.filter(
    (p) => p.compradorId === COMPRADOR_ID && (p.estado === 'abierto' || p.estado === 'en_negociacion'),
  ).length;
  const cotizacionesPendientesBadge = cotizaciones.filter(
    (c) => misPedidoIds.has(c.pedidoId) && c.estado === 'pendiente',
  ).length;

  // ── Badges proveedor ───────────────────────────────────────────────────────
  const pedidosDisponiblesBadge = pedidos.filter(
    (p) => p.estado === 'abierto' || p.estado === 'en_cotizacion',
  ).length;
  const misCotizacionesNegociacionBadge = cotizaciones.filter(
    (c) => (PROV_IDS as readonly string[]).includes(c.proveedorId) && c.estado === 'en_negociacion',
  ).length;

  const navItemsComprador: NavItem[] = [
    { label: 'Dashboard', ruta: '/comprador', icono: IconLayoutDashboard },
    { label: 'Mis pedidos', ruta: '/comprador/pedidos', icono: IconClipboardList, badge: misPedidosActivosBadge, matchPrefix: '/comprador/pedidos/' },
    { label: 'Cotizaciones recibidas', ruta: '/comprador/cotizaciones-recibidas', icono: IconFileInvoice, badge: cotizacionesPendientesBadge },
    { label: 'Mis compras', ruta: '/comprador/mis-compras', icono: IconShoppingCart },
  ];

  const navItemsProveedor: NavItem[] = [
    { label: 'Dashboard', ruta: '/proveedor', icono: IconLayoutDashboard },
    { label: 'Explorar pedidos', ruta: '/proveedor/explorar', icono: IconSearch, badge: pedidosDisponiblesBadge, matchPrefix: '/proveedor/pedidos/' },
    { label: 'Mis cotizaciones', ruta: '/proveedor/cotizaciones', icono: IconFileInvoice, badge: misCotizacionesNegociacionBadge },
    { label: 'Mis ventas', ruta: '/proveedor/mis-ventas', icono: IconShoppingCart },
  ];

  const navItems = rol === 'comprador' ? navItemsComprador : navItemsProveedor;

  const isActive = (item: NavItem) =>
    pathname === item.ruta ||
    (item.matchPrefix != null && pathname.startsWith(item.matchPrefix));

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
          <Badge color={rol === 'comprador' ? 'green' : 'blue'}>
            {rol === 'comprador' ? 'Comprador' : 'Proveedor'}
          </Badge>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto pt-3 pb-2">
        {/* Dashboard (primer ítem siempre) */}
        {(() => {
          const dashItem = navItems[0];
          const esActivo = isActive(dashItem);
          const Icono = dashItem.icono;
          return (
            <div key={dashItem.ruta} className="relative px-3 mb-0.5">
              {esActivo && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-ep-green rounded-r-full" />
              )}
              <button
                onClick={() => navigate(dashItem.ruta)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-lg relative transition-colors duration-150 ${
                  esActivo
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <Icono size={17} stroke={esActivo ? 2 : 1.75} className={esActivo ? 'text-ep-green' : 'text-current'} />
                <span className="flex-1 text-left">{dashItem.label}</span>
              </button>
            </div>
          );
        })()}

        {/* Botón destacado: Publicar pedido (solo comprador) */}
        {rol === 'comprador' && (
          <div className="px-3 mt-3 mb-1">
            <button
              onClick={() => navigate('/comprador/publicar')}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 ${
                pathname === '/comprador/publicar'
                  ? 'bg-ep-green text-white shadow-md'
                  : 'bg-ep-green/90 text-white hover:bg-ep-green shadow-sm hover:shadow-md'
              }`}
            >
              <IconPlus size={16} stroke={2.5} />
              Publicar pedido
            </button>
          </div>
        )}

        {/* Separador + label MIS VISTAS */}
        <div className="px-5 pt-4 pb-1.5">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
              Mis vistas
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        </div>

        {/* Ítems de vistas (índice 1 en adelante) */}
        {navItems.slice(1).map((item) => {
          const esActivo = isActive(item);
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
                <Icono size={17} stroke={esActivo ? 2 : 1.75} className={esActivo ? 'text-ep-green' : 'text-current'} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="bg-ep-amber text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
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
