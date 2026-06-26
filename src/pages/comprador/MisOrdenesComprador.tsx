import { Card } from '../../components/ui/Card';

export default function MisOrdenesComprador() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ep-text-primary">Mis órdenes</h1>
        <p className="text-sm text-ep-text-secondary mt-1">
          Seguí el estado de tus compras confirmadas.
        </p>
      </div>
      <Card>
        <p className="text-sm text-ep-text-muted">Implementación en Sesión 3</p>
      </Card>
    </div>
  );
}
