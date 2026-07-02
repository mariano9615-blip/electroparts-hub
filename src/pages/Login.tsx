import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBolt, IconAlertCircle } from '@tabler/icons-react';
import { Card, Input, Button } from '../components/ui';
import { useAuthStore } from '../store/useAuthStore';
import type { RolUsuario } from '../types';

const RUTA_POR_ROL: Record<RolUsuario, string> = {
  admin: '/admin',
  comprador: '/comprador',
  proveedor: '/proveedor',
};

const ACCESOS_RAPIDOS: { label: string; usuario: string }[] = [
  { label: 'Entrar como Admin', usuario: 'admin' },
  { label: 'Entrar como Comprador', usuario: 'comprador' },
  { label: 'Entrar como Proveedor', usuario: 'proveedor' },
];

export default function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const intentarLogin = (usuarioLogin: string, passwordLogin: string) => {
    setError(null);
    setCargando(true);

    setTimeout(async () => {
      const ok = await useAuthStore.getState().login(usuarioLogin, passwordLogin);
      if (ok) {
        const rol = useAuthStore.getState().rol!;
        navigate(RUTA_POR_ROL[rol]);
        return;
      }
      setCargando(false);
      setError(useAuthStore.getState().errorLogin ?? 'Usuario o contraseña incorrectos');
      const card = cardRef.current;
      if (card) {
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 400);
      }
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    intentarLogin(usuario, password);
  };

  const handleAccesoRapido = (usuarioDemo: string) => {
    setUsuario(usuarioDemo);
    setPassword('123456');
    intentarLogin(usuarioDemo, '123456');
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
                <span className="text-sm text-ep-red">{error}</span>
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

          <div className="mt-6 pt-5 border-t border-ep-border">
            <p className="text-[10px] text-ep-text-muted text-center uppercase tracking-widest mb-2.5">
              Acceso rápido demo
            </p>
            <div className="flex flex-col gap-1.5">
              {ACCESOS_RAPIDOS.map((acceso) => (
                <button
                  key={acceso.usuario}
                  type="button"
                  disabled={cargando}
                  onClick={() => handleAccesoRapido(acceso.usuario)}
                  className="w-full text-xs font-medium text-ep-text-secondary bg-ep-surface-raised hover:bg-ep-border rounded-lg py-1.5 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {acceso.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-ep-text-muted text-center mt-6">
            ElectroParts Hub v0.1.0
          </p>
        </Card>
      </div>
    </div>
  );
}
