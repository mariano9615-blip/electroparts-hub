// Utilidad de sonidos de notificación via Web Audio API — sin dependencias externas

type TipoSonido = 'pedido' | 'cotizacion' | 'mensaje';

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  return _ctx;
}

function beep(freq: number, durMs: number): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durMs / 1000);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + durMs / 1000);
      osc.onended = () => resolve();
    } catch {
      resolve();
    }
  });
}

export function playNotificationSound(tipo: TipoSonido): void {
  if (localStorage.getItem('ep_sonido_silenciado') === 'true') return;
  try {
    if (tipo === 'pedido') {
      beep(880, 150);
    } else if (tipo === 'cotizacion') {
      beep(660, 100).then(() => beep(880, 100));
    } else if (tipo === 'mensaje') {
      beep(440, 80);
    }
  } catch (e) {
    console.warn('playNotificationSound:', e);
  }
}
