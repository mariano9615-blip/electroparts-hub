import { Card } from '../../components/ui/Card';

export default function PublicarPedido() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ep-text-primary">Publicar pedido</h1>
        <p className="text-sm text-ep-text-secondary mt-1">
          Describí lo que necesitás y recibí cotizaciones de proveedores verificados.
        </p>
      </div>
      <Card>
        <p className="text-sm text-ep-text-muted">Implementación en Sesión 3</p>
      </Card>
    </div>
  );
}
