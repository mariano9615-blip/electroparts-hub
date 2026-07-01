import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'ep_sonido_silenciado';

export function useNotificationSound() {
  const [silenciado, setSilenciado] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true',
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(silenciado));
  }, [silenciado]);

  const toggleSilencio = useCallback(() => setSilenciado((v) => !v), []);

  return { silenciado, toggleSilencio };
}
