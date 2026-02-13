
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter } from 'react-router-dom';
import { ModalProvider } from './components/ModalSystem';
import { GlobalTracker } from './components/layout/GlobalTracker';
import { DeepLinkHandler } from './components/layout/DeepLinkHandler';
import AppRoutes from './routes/AppRoutes';
import { useAuthSync } from './hooks/useAuthSync';
import { USE_MOCKS } from './mocks';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
import { configControl } from './services/admin/ConfigControl';
import { hydrationManager } from './services/sync/HydrationManager';

const Maintenance = lazy(() => import('./pages/Maintenance').then(m => ({ default: m.Maintenance })));

const DemoModeBadge = () => {
    if (!USE_MOCKS) return null;
    return (
        <div className="fixed bottom-24 left-4 z-[100] animate-fade-in pointer-events-none">
            <div className="flex items-center gap-2 bg-yellow-500/10 backdrop-blur-md border border-yellow-500/50 px-3 py-1.5 rounded-full shadow-lg">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Modo Visualização</span>
            </div>
        </div>
    );
};

const LoadingFallback: React.FC = () => (
    <div className="h-screen w-full bg-[#0c0f14] flex flex-col items-center justify-center gap-4">
        <i className="fa-solid fa-circle-notch fa-spin text-[#00c2ff] text-2xl"></i>
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[3px]">
            Carregando...
        </span>
    </div>
);

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isHydrated, setIsHydrated] = useState(hydrationManager.isFullyHydrated());

  useAuthSync();

  useEffect(() => {
    const unsub = hydrationManager.subscribe(setIsHydrated);
    
    const initializeApp = async () => {
      const bootTimeout = setTimeout(() => {
        if (!isReady) {
            console.warn("⏱️ [Boot] Timeout de segurança atingido. Forçando entrada...");
            setIsReady(true);
            setIsMaintenance(false);
        }
      }, 5000);

      try {
        const getParam = (key: string) => {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.has(key)) return searchParams.get(key);
            
            const hashPart = window.location.hash.split('?')[1];
            if (hashPart) {
                const hashParams = new URLSearchParams(hashPart);
                return hashParams.get(key);
            }
            return null;
        };

        const forceOpen = getParam('ignoreMaintenance') === 'true' || getParam('force') === 'true';
        const config = await configControl.boot();
        const shouldShowMaintenance = config.maintenanceMode === true && !USE_MOCKS && !forceOpen;
        
        setIsMaintenance(shouldShowMaintenance);
      } catch (e) {
        console.error("Erro no boot do sistema:", e);
        setIsMaintenance(false);
      } finally {
        clearTimeout(bootTimeout);
        setIsReady(true);
        if (USE_MOCKS || !localStorage.getItem('auth_token')) {
            setIsHydrated(true);
        }
      }
    };
    
    initializeApp();
    return () => unsub();
  }, []);

  if (!isReady || (!isHydrated && !USE_MOCKS)) {
    return <LoadingFallback />;
  }

  if (isMaintenance) {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Maintenance />
        </Suspense>
    );
  }

  return (
    <GlobalErrorBoundary>
      <ModalProvider>
        <HashRouter>
          <GlobalTracker />
          <DeepLinkHandler />
          <DemoModeBadge />
          <AppRoutes />
        </HashRouter>
      </ModalProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
