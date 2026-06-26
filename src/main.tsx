import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AppRouter } from './router/AppRouter';
import {
  PEDIDOS_INICIALES,
  COTIZACIONES_INICIALES,
  ORDENES_INICIALES,
  MENSAJES_INICIALES,
} from './data/mockData';
import {
  STORAGE_KEY_INITIALIZED,
  STORAGE_KEY_PEDIDOS,
  STORAGE_KEY_COTIZACIONES,
  STORAGE_KEY_ORDENES,
  STORAGE_KEY_MENSAJES,
} from './utils/constants';

function initializarDatos() {
  if (!localStorage.getItem(STORAGE_KEY_INITIALIZED)) {
    localStorage.setItem(STORAGE_KEY_PEDIDOS, JSON.stringify(PEDIDOS_INICIALES));
    localStorage.setItem(STORAGE_KEY_COTIZACIONES, JSON.stringify(COTIZACIONES_INICIALES));
    localStorage.setItem(STORAGE_KEY_ORDENES, JSON.stringify(ORDENES_INICIALES));
    localStorage.setItem(STORAGE_KEY_MENSAJES, JSON.stringify(MENSAJES_INICIALES));
    localStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
  }
}

initializarDatos();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
