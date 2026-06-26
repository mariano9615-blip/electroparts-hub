import { Card } from '../../components/ui/Card';

export default function DashboardComprador() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ep-text-primary">Dashboard</h1>
        <p className="text-sm text-ep-text-secondary mt-1">
          Resumen de actividad de tu cuenta compradora.
        </p>
      </div>
      <Card>
        <p className="text-sm text-ep-text-muted">Implementación en Sesión 3</p>
      </Card>
    </div>
  );
}
