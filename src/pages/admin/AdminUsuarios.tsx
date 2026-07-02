import { IconUserCircle, IconPlus } from '@tabler/icons-react';
import { PageHeader, Badge, Button } from '../../components/ui';

const USUARIOS_FIJOS = [
  { usuario: 'admin', rol: 'Admin' },
  { usuario: 'comprador', rol: 'Comprador' },
  { usuario: 'proveedor', rol: 'Proveedor' },
];

export default function AdminUsuarios() {
  return (
    <div>
      <PageHeader
        titulo="Usuarios"
        descripcion="Usuarios fijos de la plataforma"
        accion={
          <div title="Próximamente">
            <Button variant="secondary" disabled>
              <IconPlus size={16} />
              Agregar usuario
            </Button>
          </div>
        }
      />

      <div className="bg-ep-surface border border-ep-border rounded-lg divide-y divide-ep-border">
        {USUARIOS_FIJOS.map((u) => (
          <div key={u.usuario} className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 bg-ep-surface-raised rounded-full flex items-center justify-center flex-shrink-0 text-ep-text-muted">
              <IconUserCircle size={22} stroke={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ep-text-primary">{u.usuario}</p>
              <p className="text-xs text-ep-text-muted">{u.rol}</p>
            </div>
            <Badge color="green">Activo</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
