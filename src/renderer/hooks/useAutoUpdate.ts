import { useState, useEffect, useCallback } from 'react';
import { compareVersions, fetchLatestRelease, GitHubRelease } from '@/renderer/utils/updateUtils';

/**
 * Hook para gestionar la verificación automática de actualizaciones.
 */
export const useAutoUpdate = () => {
    const [localVersion, setLocalVersion] = useState<string>('0.0.0');
    const [latestRelease, setLatestRelease] = useState<GitHubRelease | null>(null);
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const checkVersion = useCallback(async () => {
        setIsChecking(true);
        try {
            let version = localVersion;

            if (version === '0.0.0') {
                let attempts = 0;
                // Sistema de reintentos para obtener la versión local
                while (attempts < 5) {
                    if (window.electronAPI?.getAppVersion) {
                        try {
                            const v = await window.electronAPI.getAppVersion();
                            if (v && v !== '0.0.0') {
                                version = v;
                                break;
                            }
                        } catch (e) {
                            console.error('Error fetching app version:', e);
                        }
                    }
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                setLocalVersion(version);
            }

            // Verificación en GitHub
            const release = await fetchLatestRelease();
            if (release) {
                setLatestRelease(release);
                if (compareVersions(version, release.tag_name) === 1) {
                    setIsUpdateAvailable(true);
                } else {
                    setIsUpdateAvailable(false);
                }
            }
        } finally {
            setIsChecking(false);
        }
    }, [localVersion]);

    useEffect(() => {
        checkVersion();
    }, []); // Solo al montar

    return {
        localVersion,
        latestRelease,
        isUpdateAvailable,
        isChecking,
        checkVersion,
        platform: (window.electronAPI as any)?.platform || 'unknown'
    };
};
