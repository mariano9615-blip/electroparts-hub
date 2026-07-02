import { supabase } from './supabaseClient';

// Reemplaza el polling de 5s de AppRouter cuando VITE_DATA_SOURCE === 'supabase'.
// Se activa en Parte B.

export function suscribirRealtime(callbacks: {
  onPedidoChange: () => void;
  onCotizacionChange: () => void;
  onOrdenChange: () => void;
  onMensajeChange: () => void;
  onNotificacionChange: () => void;
  onCalificacionChange: () => void;
}) {
  const channel = supabase
    .channel('electroparts-cambios')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, callbacks.onPedidoChange)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cotizaciones' },
      callbacks.onCotizacionChange,
    )
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ordenes' }, callbacks.onOrdenChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'mensajes' }, callbacks.onMensajeChange)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notificaciones' },
      callbacks.onNotificacionChange,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'calificaciones' },
      callbacks.onCalificacionChange,
    )
    .subscribe();

  // Retorna función de limpieza
  return () => supabase.removeChannel(channel);
}
