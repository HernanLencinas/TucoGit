/**
 * Compara dos versiones semánticas.
 * 
 * @param v1 Versión 1 (ej. "0.1.310" o "v0.1.310")
 * @param v2 Versión 2 (ej. "0.1.350" o "v0.1.350")
 * @returns 1 si v2 > v1, -1 si v2 < v1, 0 si son iguales
 */
export const compareVersions = (v1: string, v2: string): number => {
    const cleanV1 = v1.replace(/^v/, '').split('.').map(n => parseInt(n, 10));
    const cleanV2 = v2.replace(/^v/, '').split('.').map(n => parseInt(n, 10));

    const maxLength = Math.max(cleanV1.length, cleanV2.length);

    for (let i = 0; i < maxLength; i++) {
        const num1 = cleanV1[i] || 0;
        const num2 = cleanV2[i] || 0;

        if (num2 > num1) return 1;
        if (num2 < num1) return -1;
    }

    return 0;
};

export interface ReleaseAsset {
    name: string;
    browser_download_url: string;
}

export interface GitHubRelease {
    tag_name: string;
    html_url: string;
    assets: ReleaseAsset[];
}

/**
 * Obtiene la última versión desde GitHub.
 */
export const fetchLatestRelease = async (): Promise<GitHubRelease | null> => {
    try {
        const response = await fetch('https://api.github.com/repos/HernanLencinas/TucoGit/releases');
        if (!response.ok) throw new Error('Failed to fetch releases');
        const releases: GitHubRelease[] = await response.json();
        return releases.length > 0 ? releases[0] : null;
    } catch (error) {
        console.error('Error fetching latest release:', error);
        return null;
    }
};

/**
 * Detecta el asset correspondiente al sistema operativo actual.
 */
export const getAssetForPlatform = (assets: ReleaseAsset[], platform: string): ReleaseAsset | null => {
    let extension = '';
    if (platform === 'darwin') extension = '.dmg';
    else if (platform === 'win32') extension = '.exe';
    else if (platform === 'linux') extension = '.AppImage';
    else return null;

    return assets.find(asset => asset.name.toLowerCase().endsWith(extension.toLowerCase())) || null;
};
