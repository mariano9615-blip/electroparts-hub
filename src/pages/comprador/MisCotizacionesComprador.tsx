import { Card } from '../../components/ui/Card';

export default function MisCotizacionesComprador() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ep-text-primary">Cotizaciones</h1>
        <p className="text-sm text-ep-text-secondary mt-1">
          Revisá y comparás las cotizaciones recibidas por tus pedidos.
        </p>
      </div>
      <Card>
        <p className="text-sm text-ep-text-muted">Implementación en Sesión 3</p>
      </Card>
    </div>
  );
}
