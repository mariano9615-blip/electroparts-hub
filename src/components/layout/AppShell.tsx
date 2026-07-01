import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastContainer } from '../ui/ToastContainer';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const toggleSidebar = () => setSidebarAbierto((v) => !v);
  const cerrarSidebar = () => setSidebarAbierto(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar desktop */}
      <div className="hidden md:flex md:w-64 md:flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Drawer mobile */}
      {sidebarAbierto && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={cerrarSidebar}
          />
          <div className="fixed left-0 top-0 z-50 h-full w-64 md:hidden">
            <Sidebar />
          </div>
        </>
      )}

      {/* Área de contenido principal */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto bg-ep-bg p-6">{children}</main>
      </div>

      {/* Toasts enterprise para notificación de pedidos nuevos */}
      <ToastContainer />
    </div>
  );
};
