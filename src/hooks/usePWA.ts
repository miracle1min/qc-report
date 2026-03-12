import { useState, useEffect, useCallback } from 'react';
import { registerSW } from 'virtual:pwa-register';

interface PWAState {
  needRefresh: boolean;
  offlineReady: boolean;
  canInstall: boolean;
  updateApp: () => void;
  installApp: () => Promise<void>;
  dismissUpdate: () => void;
}

export function usePWA(): PWAState {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        setOfflineReady(true);
      },
    });
    setUpdateSW(() => update);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setCanInstall(false);
    }
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const updateApp = useCallback(() => {
    if (updateSW) {
      updateSW();
      // Force reload after a short delay
      setTimeout(() => window.location.reload(), 300);
    }
  }, [updateSW]);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setCanInstall(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const dismissUpdate = useCallback(() => {
    setNeedRefresh(false);
  }, []);

  return { needRefresh, offlineReady, canInstall, updateApp, installApp, dismissUpdate };
}
