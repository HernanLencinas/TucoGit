import { useState, useEffect } from 'react';
import { compareVersions, fetchLatestRelease, GitHubRelease } from '@/renderer/utils/updateUtils';

/**
 * Hook para gestionar la verificación automática de actualizaciones.
 */
export const useAutoUpdate = () => {
    const [localVersion, setLocalVersion] = useState<string>('0.0.0');
    const [latestRelease, setLatestRelease] = useState<GitHubRelease | null>(null);
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

    useEffect(() => {
        const checkVersion = async () => {
            let version = '0.0.0';
            let attempts = 0;

            // Sistema de reintentos para obtener la versión local
            while (attempts < 10) {
                if (window.electronAPI?.getAppVersion) {
                    try {
                        version = await window.electronAPI.getAppVersion();
                        if (version && version !== '0.0.0') break;
                    } catch (e) {
                        console.error('Error fetching app version:', e);
                    }
                }
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            setLocalVersion(version);

            // Verificación en GitHub
            const release = await fetchLatestRelease();
            if (release) {
                setLatestRelease(release);
                if (compareVersions(version, release.tag_name) === 1) {
                    setIsUpdateAvailable(true);
                }
            }
        };

        checkVersion();
    }, []); // Solo al montar

    return {
        localVersion,
        latestRelease,
        isUpdateAvailable,
        platform: (window.electronAPI as any)?.platform || 'unknown'
    };
};
