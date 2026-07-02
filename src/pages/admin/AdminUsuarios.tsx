import { useEffect, useMemo, useState } from 'react';
import {
  IconPlus,
  IconSearch,
  IconPencil,
  IconLock,
  IconTrash,
  IconCrown,
  IconUsers,
  IconAlertTriangle,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
} from '@tabler/icons-react';
import { PageHeader, Badge, Button, Input, Select, Modal, EmptyState } from '../../components/ui';
import { useUsuariosStore } from '../../store/useUsuariosStore';
import { formatFecha } from '../../utils/formatters';
import type { Usuario, UsuarioFormData } from '../../types';

type UsuarioSeguro = Omit<Usuario, 'passwordHash'>;
type BadgeColor = 'green' | 'blue' | 'amber' | 'red' | 'gray';
type CampoOrden = 'nombre' | 'usuario' | 'ultimaModificacion';

const POR_PAGINA = 10;

const ROL_COLOR: Record<Usuario['rol'], BadgeColor> = {
  admin: 'red',
  comprador: 'blue',
  proveedor: 'green',
};

const ROL_LABEL: Record<Usuario['rol'], string> = {
  admin: 'Admin',
  comprador: 'Comprador',
  proveedor: 'Proveedor',
};

const FILTRO_ROL_OPTIONS = [
  { value: '', label: 'Todos los roles' },
  { value: 'comprador', label: 'Comprador' },
  { value: 'proveedor', label: 'Proveedor' },
  { value: 'admin', label: 'Admin' },
];

const FILTRO_ESTADO_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'activos', label: 'Activos' },
  { value: 'inactivos', label: 'Inactivos' },
];

const ROL_FORM_OPTIONS = [
  { value: 'comprador', label: 'Comprador' },
  { value: 'proveedor', label: 'Proveedor' },
];

const FORM_VACIO: UsuarioFormData = {
  usuario: '',
  password: '',
  passwordConfirm: '',
  rol: 'comprador',
  nombre: '',
  empresa: '',
  activo: true,
};

interface ErroresAlta {
  nombre?: string;
  usuario?: string;
  password?: string;
  passwordConfirm?: string;
}

function validarAlta(form: UsuarioFormData, usuarios: UsuarioSeguro[]): ErroresAlta {
  const errores: ErroresAlta = {};
  if (form.nombre.trim().length < 3) errores.nombre = 'Mínimo 3 caracteres';

  const usuarioLimpio = form.usuario.trim();
  if (usuarioLimpio.length < 4) errores.usuario = 'Mínimo 4 caracteres';
  else if (/\s/.test(usuarioLimpio)) errores.usuario = 'No puede contener espacios';
  else if (!/^[a-zA-Z0-9_]+$/.test(usuarioLimpio)) errores.usuario = 'Solo letras, números y guión bajo';
  else if (usuarios.some((u) => u.usuario.toLowerCase() === usuarioLimpio.toLowerCase()))
    errores.usuario = 'Este nombre de usuario ya está en uso';

  if (form.password.length < 6) errores.password = 'Mínimo 6 caracteres';
  if (form.passwordConfirm !== form.password) errores.passwordConfirm = 'Las contraseñas no coinciden';

  return errores;
}

function validarEdicion(form: UsuarioFormData): { nombre?: string } {
  const errores: { nombre?: string } = {};
  if (form.nombre.trim().length < 3) errores.nombre = 'Mínimo 3 caracteres';
  return errores;
}

function validarPassword(password: string, passwordConfirm: string): {
  password?: string;
  passwordConfirm?: string;
} {
  const errores: { password?: string; passwordConfirm?: string } = {};
  if (password.length < 6) errores.password = 'Mínimo 6 caracteres';
  if (passwordConfirm !== password) errores.passwordConfirm = 'Las contraseñas no coinciden';
  return errores;
}

export default function AdminUsuarios() {
  const usuarios = useUsuariosStore((s) => s.usuarios);
  const cargando = useUsuariosStore((s) => s.cargando);
  const error = useUsuariosStore((s) => s.error);
  const cargarUsuarios = useUsuariosStore((s) => s.cargarUsuarios);
  const crearUsuario = useUsuariosStore((s) => s.crearUsuario);
  const editarUsuario = useUsuariosStore((s) => s.editarUsuario);
  const cambiarPassword = useUsuariosStore((s) => s.cambiarPassword);
  const toggleActivo = useUsuariosStore((s) => s.toggleActivo);
  const eliminarUsuario = useUsuariosStore((s) => s.eliminarUsuario);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [pagina, setPagina] = useState(1);
  const [ordenCampo, setOrdenCampo] = useState<CampoOrden>('ultimaModificacion');
  const [ordenDir, setOrdenDir] = useState<'asc' | 'desc'>('desc');

  const [modalAlta, setModalAlta] = useState(false);
  const [modalEdicion, setModalEdicion] = useState<UsuarioSeguro | null>(null);
  const [modalPassword, setModalPassword] = useState<UsuarioSeguro | null>(null);
  const [modalEliminar, setModalEliminar] = useState<UsuarioSeguro | null>(null);
  const [popoverToggle, setPopoverToggle] = useState<string | null>(null);

  const [form, setForm] = useState<UsuarioFormData>(FORM_VACIO);
  const [tocado, setTocado] = useState<Partial<Record<keyof UsuarioFormData, boolean>>>({});
  const [passwordForm, setPasswordForm] = useState({ password: '', passwordConfirm: '' });
  const [passwordTocado, setPasswordTocado] = useState({ password: false, passwordConfirm: false });
  const [guardando, setGuardando] = useState(false);

  const [aviso, setAviso] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(t);
  }, [aviso]);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroRol, filtroEstado]);

  const filtrados = useMemo(() => {
    let lista = usuarios;
    const q = busqueda.trim().toLowerCase();
    if (q) {
      lista = lista.filter(
        (u) =>
          u.nombre.toLowerCase().includes(q) ||
          u.usuario.toLowerCase().includes(q) ||
          (u.empresa ?? '').toLowerCase().includes(q),
      );
    }
    if (filtroRol) lista = lista.filter((u) => u.rol === filtroRol);
    if (filtroEstado) lista = lista.filter((u) => (filtroEstado === 'activos' ? u.activo : !u.activo));

    const dir = ordenDir === 'asc' ? 1 : -1;
    return [...lista].sort((a, b) => {
      if (ordenCampo === 'ultimaModificacion') {
        return (new Date(a.ultimaModificacion).getTime() - new Date(b.ultimaModificacion).getTime()) * dir;
      }
      return a[ordenCampo].localeCompare(b[ordenCampo]) * dir;
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado, ordenCampo, ordenDir]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const paginados = filtrados.slice((paginaSegura - 1) * POR_PAGINA, paginaSegura * POR_PAGINA);

  function handleOrdenar(campo: CampoOrden) {
    if (ordenCampo === campo) {
      setOrdenDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrdenCampo(campo);
      setOrdenDir('asc');
    }
  }

  function abrirAlta() {
    setForm(FORM_VACIO);
    setTocado({});
    setModalAlta(true);
  }

  function abrirEdicion(u: UsuarioSeguro) {
    setForm({
      usuario: u.usuario,
      password: '',
      passwordConfirm: '',
      rol: u.rol === 'admin' ? 'comprador' : u.rol,
      nombre: u.nombre,
      empresa: u.empresa ?? '',
      activo: u.activo,
    });
    setTocado({});
    setModalEdicion(u);
  }

  function abrirPassword(u: UsuarioSeguro) {
    setPasswordForm({ password: '', passwordConfirm: '' });
    setPasswordTocado({ password: false, passwordConfirm: false });
    setModalPassword(u);
  }

  const erroresAlta = useMemo(() => validarAlta(form, usuarios), [form, usuarios]);
  const altaValida = Object.keys(erroresAlta).length === 0;

  const erroresEdicion = useMemo(() => validarEdicion(form), [form]);
  const edicionValida = Object.keys(erroresEdicion).length === 0;

  const erroresPassword = useMemo(
    () => validarPassword(passwordForm.password, passwordForm.passwordConfirm),
    [passwordForm],
  );
  const passwordValida = Object.keys(erroresPassword).length === 0;

  async function handleCrear() {
    if (!altaValida) return;
    setGuardando(true);
    const res = await crearUsuario(form);
    setGuardando(false);
    if (res.ok) {
      setModalAlta(false);
      setAviso({ tipo: 'success', mensaje: `Usuario "${form.nombre}" creado correctamente` });
    } else {
      setAviso({ tipo: 'error', mensaje: res.error ?? 'No se pudo crear el usuario' });
    }
  }

  async function handleEditar() {
    if (!modalEdicion || !edicionValida) return;
    setGuardando(true);
    const res = await editarUsuario(modalEdicion.id, {
      nombre: form.nombre,
      rol: form.rol,
      empresa: form.empresa,
      activo: form.activo,
    });
    setGuardando(false);
    if (res.ok) {
      setModalEdicion(null);
      setAviso({ tipo: 'success', mensaje: `Usuario "${form.nombre}" actualizado` });
    } else {
      setAviso({ tipo: 'error', mensaje: res.error ?? 'No se pudo editar el usuario' });
    }
  }

  async function handleCambiarPassword() {
    if (!modalPassword || !passwordValida) return;
    setGuardando(true);
    const res = await cambiarPassword(modalPassword.id, passwordForm.password);
    setGuardando(false);
    if (res.ok) {
      setModalPassword(null);
      setAviso({ tipo: 'success', mensaje: `Contraseña actualizada para ${modalPassword.nombre}` });
    } else {
      setAviso({ tipo: 'error', mensaje: res.error ?? 'No se pudo cambiar la contraseña' });
    }
  }

  async function handleEliminar() {
    if (!modalEliminar) return;
    setGuardando(true);
    await eliminarUsuario(modalEliminar.id);
    setGuardando(false);
    setAviso({ tipo: 'success', mensaje: `Usuario "${modalEliminar.nombre}" eliminado` });
    setModalEliminar(null);
  }

  async function handleToggle(u: UsuarioSeguro) {
    await toggleActivo(u.id);
    setPopoverToggle(null);
    setAviso({ tipo: 'success', mensaje: `Usuario "${u.nombre}" ${u.activo ? 'desactivado' : 'activado'}` });
  }

  return (
    <div>
      <PageHeader
        titulo="Gestión de usuarios"
        descripcion="Alta, edición y administración de usuarios de la plataforma"
        accion={
          <Button variant="primary" onClick={abrirAlta}>
            <IconPlus size={16} />
            Nuevo usuario
          </Button>
        }
      />

      {aviso && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
            aviso.tipo === 'success'
              ? 'bg-ep-green-light border-ep-green text-ep-green-dark'
              : 'bg-ep-red-light border-ep-red text-ep-red-dark'
          }`}
        >
          {aviso.tipo === 'success' ? <IconCheck size={16} /> : <IconAlertTriangle size={16} />}
          {aviso.mensaje}
        </div>
      )}

      {error ? (
        <EmptyState
          icono={IconAlertTriangle}
          titulo="No se pudieron cargar los usuarios"
          mensaje="Ocurrió un error al conectarse con el servidor"
          accion={{ label: 'Reintentar', onClick: cargarUsuarios }}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[220px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ep-text-muted pointer-events-none">
                <IconSearch size={16} />
              </div>
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, usuario o empresa..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-ep-surface rounded-lg border border-ep-border text-ep-text-primary placeholder:text-ep-text-muted outline-none focus:border-ep-green focus:ring-1 focus:ring-ep-green transition-colors duration-150"
              />
            </div>
            <Select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              options={FILTRO_ROL_OPTIONS}
              className="w-44"
            />
            <Select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              options={FILTRO_ESTADO_OPTIONS}
              className="w-44"
            />
            <span className="text-xs text-ep-text-muted ml-auto">
              {filtrados.length} usuario{filtrados.length !== 1 ? 's' : ''}
            </span>
          </div>

          {cargando ? (
            <div className="bg-ep-surface border border-ep-border rounded-lg overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-ep-border last:border-0">
                  <div className="h-4 w-24 bg-ep-surface-raised rounded animate-pulse" />
                  <div className="h-4 w-32 bg-ep-surface-raised rounded animate-pulse" />
                  <div className="h-4 w-28 bg-ep-surface-raised rounded animate-pulse" />
                  <div className="h-4 w-16 bg-ep-surface-raised rounded animate-pulse ml-auto" />
                </div>
              ))}
            </div>
          ) : usuarios.length === 0 ? (
            <EmptyState
              icono={IconUsers}
              titulo="Sin usuarios"
              mensaje="Todavía no hay usuarios cargados en la plataforma"
              accion={{ label: 'Crear primer usuario', onClick: abrirAlta }}
            />
          ) : filtrados.length === 0 ? (
            <EmptyState
              icono={IconSearch}
              titulo="Sin resultados"
              mensaje="No se encontraron usuarios con esos filtros"
            />
          ) : (
            <>
              <div className="bg-ep-surface border border-ep-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ep-border text-left">
                      <th className="px-4 py-3 text-xs font-semibold text-ep-text-muted uppercase tracking-wide">
                        #
                      </th>
                      <th
                        className="px-4 py-3 text-xs font-semibold text-ep-text-muted uppercase tracking-wide cursor-pointer select-none"
                        onClick={() => handleOrdenar('usuario')}
                      >
                        Usuario {ordenCampo === 'usuario' && (ordenDir === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        className="px-4 py-3 text-xs font-semibold text-ep-text-muted uppercase tracking-wide cursor-pointer select-none"
                        onClick={() => handleOrdenar('nombre')}
                      >
                        Nombre {ordenCampo === 'nombre' && (ordenDir === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-ep-text-muted uppercase tracking-wide">
                        Empresa
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-ep-text-muted uppercase tracking-wide">
                        Rol
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-ep-text-muted uppercase tracking-wide">
                        Estado
                      </th>
                      <th
                        className="px-4 py-3 text-xs font-semibold text-ep-text-muted uppercase tracking-wide cursor-pointer select-none"
                        onClick={() => handleOrdenar('ultimaModificacion')}
                      >
                        Última modificación {ordenCampo === 'ultimaModificacion' && (ordenDir === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-ep-text-muted uppercase tracking-wide text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginados.map((u, i) => {
                      const esAdmin = u.rol === 'admin';
                      return (
                        <tr key={u.id} className="border-b border-ep-border last:border-0 hover:bg-ep-surface-raised/60 transition-colors duration-150">
                          <td className="px-4 py-3 text-xs text-ep-text-muted">
                            {(paginaSegura - 1) * POR_PAGINA + i + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 font-mono text-xs text-ep-text-primary">
                              {esAdmin && <IconCrown size={13} className="text-ep-amber-dark flex-shrink-0" />}
                              {u.usuario}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-ep-text-primary">{u.nombre}</td>
                          <td className="px-4 py-3 text-ep-text-secondary">{u.empresa ?? '—'}</td>
                          <td className="px-4 py-3">
                            <Badge color={ROL_COLOR[u.rol]}>{ROL_LABEL[u.rol]}</Badge>
                          </td>
                          <td className="px-4 py-3 relative">
                            <button
                              type="button"
                              disabled={esAdmin}
                              onClick={() => setPopoverToggle(popoverToggle === u.id ? null : u.id)}
                              className={esAdmin ? 'cursor-not-allowed' : 'cursor-pointer'}
                              title={esAdmin ? 'El administrador no puede ser eliminado ni desactivado' : undefined}
                            >
                              <Badge color={u.activo ? 'green' : 'gray'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge>
                            </button>
                            {popoverToggle === u.id && (
                              <div className="absolute z-20 left-4 top-full mt-1 bg-ep-surface border border-ep-border rounded-lg shadow-lg p-3 w-56">
                                <p className="text-xs text-ep-text-primary mb-2">
                                  {u.activo ? `¿Desactivar a ${u.nombre}?` : `¿Activar a ${u.nombre}?`}
                                </p>
                                <div className="flex gap-2 justify-end">
                                  <Button variant="secondary" size="sm" onClick={() => setPopoverToggle(null)}>
                                    No
                                  </Button>
                                  <Button variant="primary" size="sm" onClick={() => handleToggle(u)}>
                                    Sí
                                  </Button>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-ep-text-muted">
                            {formatFecha(u.ultimaModificacion)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => abrirEdicion(u)}
                                className="text-ep-text-secondary hover:text-ep-blue transition-colors duration-150"
                                aria-label="Editar"
                                title="Editar"
                              >
                                <IconPencil size={16} />
                              </button>
                              <button
                                onClick={() => abrirPassword(u)}
                                className="text-ep-text-secondary hover:text-ep-blue transition-colors duration-150"
                                aria-label="Cambiar contraseña"
                                title="Cambiar contraseña"
                              >
                                <IconLock size={16} />
                              </button>
                              <button
                                onClick={() => !esAdmin && setModalEliminar(u)}
                                disabled={esAdmin}
                                className={esAdmin ? 'text-ep-text-disabled cursor-not-allowed' : 'text-ep-red hover:text-ep-red-dark transition-colors duration-150'}
                                aria-label="Eliminar"
                                title={esAdmin ? 'El administrador no puede ser eliminado ni desactivado' : 'Eliminar'}
                              >
                                <IconTrash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-ep-text-muted">
                  Mostrando {(paginaSegura - 1) * POR_PAGINA + 1}-
                  {Math.min(paginaSegura * POR_PAGINA, filtrados.length)} de {filtrados.length} usuarios
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={paginaSegura <= 1}
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  >
                    <IconChevronLeft size={14} />
                    Anterior
                  </Button>
                  {Array.from({ length: totalPaginas }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPagina(i + 1)}
                      className={`w-7 h-7 text-xs font-medium rounded-lg transition-colors duration-150 ${
                        paginaSegura === i + 1
                          ? 'bg-ep-blue text-white'
                          : 'text-ep-text-secondary hover:bg-ep-surface-raised'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={paginaSegura >= totalPaginas}
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  >
                    Siguiente
                    <IconChevronRight size={14} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Modal alta */}
      <Modal
        open={modalAlta}
        onClose={() => setModalAlta(false)}
        title="Nuevo usuario"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalAlta(false)}>
              Cancelar
            </Button>
            <Button variant="primary" loading={guardando} disabled={!altaValida} onClick={handleCrear}>
              Crear usuario
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nombre completo"
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            onBlur={() => setTocado({ ...tocado, nombre: true })}
            error={tocado.nombre ? erroresAlta.nombre : undefined}
          />
          <Input
            label="Usuario"
            required
            value={form.usuario}
            onChange={(e) => setForm({ ...form, usuario: e.target.value })}
            onBlur={() => setTocado({ ...tocado, usuario: true })}
            error={tocado.usuario ? erroresAlta.usuario : undefined}
            hint="Sin espacios — solo letras, números y guión bajo"
          />
          <Select
            label="Rol"
            required
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value as UsuarioFormData['rol'] })}
            options={ROL_FORM_OPTIONS}
          />
          <Input
            label="Empresa"
            value={form.empresa ?? ''}
            onChange={(e) => setForm({ ...form, empresa: e.target.value })}
          />
          <Input
            label="Contraseña"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onBlur={() => setTocado({ ...tocado, password: true })}
            error={tocado.password ? erroresAlta.password : undefined}
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            required
            value={form.passwordConfirm}
            onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
            onBlur={() => setTocado({ ...tocado, passwordConfirm: true })}
            error={tocado.passwordConfirm ? erroresAlta.passwordConfirm : undefined}
          />
          <label className="flex items-center gap-2 text-sm text-ep-text-primary">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              className="rounded border-ep-border"
            />
            Usuario activo
          </label>
        </div>
      </Modal>

      {/* Modal edición */}
      <Modal
        open={modalEdicion !== null}
        onClose={() => setModalEdicion(null)}
        title={`Editar usuario — ${modalEdicion?.nombre ?? ''}`}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalEdicion(null)}>
              Cancelar
            </Button>
            <Button variant="primary" loading={guardando} disabled={!edicionValida} onClick={handleEditar}>
              Guardar cambios
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Usuario" value={form.usuario} onChange={() => {}} disabled />
          <Input
            label="Nombre completo"
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            onBlur={() => setTocado({ ...tocado, nombre: true })}
            error={tocado.nombre ? erroresEdicion.nombre : undefined}
          />
          <Select
            label="Rol"
            required
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value as UsuarioFormData['rol'] })}
            options={ROL_FORM_OPTIONS}
          />
          <Input
            label="Empresa"
            value={form.empresa ?? ''}
            onChange={(e) => setForm({ ...form, empresa: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm text-ep-text-primary">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              className="rounded border-ep-border"
            />
            Usuario activo
          </label>
        </div>
      </Modal>

      {/* Modal cambio de contraseña */}
      <Modal
        open={modalPassword !== null}
        onClose={() => setModalPassword(null)}
        title={`Cambiar contraseña — ${modalPassword?.nombre ?? ''}`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalPassword(null)}>
              Cancelar
            </Button>
            <Button variant="primary" loading={guardando} disabled={!passwordValida} onClick={handleCambiarPassword}>
              Cambiar contraseña
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nueva contraseña"
            type="password"
            required
            value={passwordForm.password}
            onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
            onBlur={() => setPasswordTocado({ ...passwordTocado, password: true })}
            error={passwordTocado.password ? erroresPassword.password : undefined}
          />
          <Input
            label="Confirmar nueva contraseña"
            type="password"
            required
            value={passwordForm.passwordConfirm}
            onChange={(e) => setPasswordForm({ ...passwordForm, passwordConfirm: e.target.value })}
            onBlur={() => setPasswordTocado({ ...passwordTocado, passwordConfirm: true })}
            error={passwordTocado.passwordConfirm ? erroresPassword.passwordConfirm : undefined}
          />
        </div>
      </Modal>

      {/* Modal eliminar */}
      <Modal
        open={modalEliminar !== null}
        onClose={() => setModalEliminar(null)}
        title="Eliminar usuario"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalEliminar(null)}>
              Cancelar
            </Button>
            <Button variant="danger" loading={guardando} onClick={handleEliminar}>
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm text-ep-text-secondary">
          ¿Estás seguro que querés eliminar a {modalEliminar?.nombre} (@{modalEliminar?.usuario})? Esta acción no
          se puede deshacer.
        </p>
      </Modal>
    </div>
  );
}
