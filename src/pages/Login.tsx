import { useState, useRef } from 'react';
import { IconBolt, IconAlertCircle } from '@tabler/icons-react';
import { Card, Input, Button } from '../components/ui';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setCargando(true);

    setTimeout(() => {
      const ok = useAuthStore.getState().login(usuario, password);
      if (!ok) {
        setCargando(false);
        setError(true);
        // Aplicar shake y removerlo después de 400ms para que pueda repetirse
        const card = cardRef.current;
        if (card) {
          card.classList.add('shake');
          setTimeout(() => card.classList.remove('shake'), 400);
        }
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-ep-bg flex items-center justify-center p-4">
      <div ref={cardRef} className="max-w-sm w-full">
        <Card padding="lg">
          <div className="flex flex-col items-center">
            <div className="text-ep-green">
              <IconBolt size={32} />
            </div>
            <h1 className="text-xl font-bold text-ep-text-primary text-center mt-3">
              ElectroParts Hub
            </h1>
            <p className="text-sm text-ep-text-muted text-center mt-1">
              Marketplace B2B · Electrónica
            </p>
          </div>

          <div className="mt-6 mb-6 border-t border-ep-border" />

          <form onSubmit={handleSubmit}>
            <Input
              label="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="admin"
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="mt-4"
            />

            {error && (
              <div className="bg-ep-red-light border border-ep-red rounded-lg px-3 py-2 mt-4 flex items-center gap-2">
                <div className="text-ep-red flex-shrink-0">
                  <IconAlertCircle size={16} />
                </div>
                <span className="text-sm text-ep-red">Usuario o contraseña incorrectos</span>
              </div>
            )}

            <Button
              variant="primary"
              fullWidth
              type="submit"
              loading={cargando}
              className="mt-6"
            >
              Ingresar
            </Button>
          </form>

          <p className="text-xs text-ep-text-muted text-center mt-6">
            ElectroParts Hub v0.1.0
          </p>
        </Card>
      </div>
    </div>
  );
}
