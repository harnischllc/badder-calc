// Version management for BadderCalc PWA
// Update this version number when deploying new versions

export const APP_VERSION = '1.4.0';
export const BUILD_DATE = new Date().toISOString();

// Version comparison utility
export const compareVersions = (version1, version2) => {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1 = v1Parts[i] || 0;
    const v2 = v2Parts[i] || 0;
    
    if (v1 > v2) return 1;
    if (v1 < v2) return -1;
  }
  
  return 0;
};

// Check if a version is newer
export const isNewerVersion = (newVersion, currentVersion) => {
  return compareVersions(newVersion, currentVersion) > 0;
};

// Get version info for debugging
export const getVersionInfo = () => {
  return {
    version: APP_VERSION,
    buildDate: BUILD_DATE,
    userAgent: navigator.userAgent,
    isPWA: window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true
  };
}; 