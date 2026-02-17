
/**
 * Env Service
 * Detecta se o app está rodando em um ambiente de demonstração (como o preview da IA)
 * ou em um ambiente estável (localhost ou produção real).
 */
export const envService = {
    isDemoMode: (): boolean => {
        // Temporariamente desativado para permitir o desenvolvimento local.
        return false;
    },
    
    setForceMock: (enabled: boolean) => {
        localStorage.setItem('force_mock_mode', enabled ? 'true' : 'false');
        window.location.reload();
    }
};
