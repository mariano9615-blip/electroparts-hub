-- ElectroParts Hub — Schema Supabase
-- Correr en: Supabase Dashboard → SQL Editor → New query
--
-- RLS (Row Level Security) queda desactivado en todas las tablas a propósito:
-- el proyecto usa su propio sistema de autenticación con bcrypt (tabla `usuarios`,
-- ver usuariosApi.validateCredentials en src/services/api.ts), no el auth nativo
-- de Supabase, así que no hay `auth.uid()` con el que escribir políticas de RLS.
-- El frontend accede con la clave anon; el control de acceso vive en la app.

-- USUARIOS
create table if not exists usuarios (
  id text primary key,
  usuario text unique not null,
  "passwordHash" text not null,
  rol text not null check (rol in ('admin', 'comprador', 'proveedor')),
  nombre text not null,
  empresa text,
  activo boolean not null default true,
  "fechaCreacion" timestamp with time zone not null default now(),
  "ultimaModificacion" timestamp with time zone not null default now()
);

-- PEDIDOS
create table if not exists pedidos (
  id text primary key,
  "compradorId" text not null,
  titulo text not null,
  descripcion text,
  cantidad numeric,
  unidad text,
  categoria text,
  "presupuestoMax" numeric,
  "fechaLimite" text,
  estado text not null default 'abierto',
  "cotizacionesRecibidas" integer not null default 0,
  "fechaCreacion" text,
  "cotizacionEnNegociacionId" text,
  "observacionBaja" text,
  "fechaBaja" text,
  "updatedAt" text,
  "createdAt" text
);

-- COTIZACIONES
create table if not exists cotizaciones (
  id text primary key,
  "pedidoId" text not null references pedidos(id) on delete cascade,
  "proveedorId" text not null,
  "proveedorNombre" text not null,
  precio numeric not null,
  "tiempoEntrega" text,
  notas text,
  "calificacionProveedor" numeric default 0,
  estado text not null default 'pendiente',
  "fechaCreacion" text
);

-- ORDENES
create table if not exists ordenes (
  id text primary key,
  "pedidoId" text not null,
  "cotizacionId" text not null,
  "compradorId" text not null,
  "proveedorId" text not null,
  "proveedorNombre" text not null,
  monto numeric not null,
  estado text not null default 'confirmada',
  "estadoPago" text not null default 'pendiente',
  "fechaConfirmacion" text,
  "chatHabilitado" boolean not null default false,
  "numeroSeguimiento" text,
  "fechaEnvio" text,
  "fechaEntrega" text,
  "comprobantePago" text,
  "fechaPagoConfirmado" text,
  calificado boolean default false,
  "calificacionId" text,
  "resolucionDisputa" text,
  "resolvedBy" text
);

-- MENSAJES
create table if not exists mensajes (
  id text primary key,
  "pedidoId" text not null,
  "cotizacionId" text,
  "autorRol" text not null check ("autorRol" in ('comprador', 'proveedor')),
  "autorNombre" text not null,
  texto text not null,
  timestamp text not null,
  leido boolean default false
);

-- NOTIFICACIONES
create table if not exists notificaciones (
  id text primary key,
  tipo text not null,
  titulo text not null,
  mensaje text not null,
  fecha text not null,
  leida boolean not null default false,
  "rolDestino" text not null,
  "entidadId" text
);

-- CALIFICACIONES
create table if not exists calificaciones (
  id text primary key,
  "ordenId" text not null references ordenes(id),
  "pedidoId" text not null,
  "compradorId" text not null,
  "proveedorId" text not null,
  "proveedorNombre" text not null,
  estrellas integer not null check (estrellas between 1 and 5),
  comentario text,
  "fechaCreacion" text not null
);

-- ROW LEVEL SECURITY (básico, sin auth nativa de Supabase)
-- Desactivar RLS en todas las tablas para usar anon key libremente
alter table usuarios disable row level security;
alter table pedidos disable row level security;
alter table cotizaciones disable row level security;
alter table ordenes disable row level security;
alter table mensajes disable row level security;
alter table notificaciones disable row level security;
alter table calificaciones disable row level security;
