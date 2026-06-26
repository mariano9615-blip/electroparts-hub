import { Card } from '../../components/ui/Card';

export default function PedidosDisponibles() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ep-text-primary">Pedidos disponibles</h1>
        <p className="text-sm text-ep-text-secondary mt-1">
          Explorá pedidos abiertos y enviá tus cotizaciones.
        </p>
      </div>
      <Card>
        <p className="text-sm text-ep-text-muted">Implementación en Sesión 3</p>
      </Card>
    </div>
  );
}
