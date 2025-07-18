import React, { useEffect, useState } from 'react';
import { APP_VERSION, getVersionInfo } from '../utils/version';

const PWAUpdateManager = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(APP_VERSION);

  useEffect(() => {
    // Log version info for debugging
    console.log('PWA Version Info:', getVersionInfo());
    
    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
      let swRegistration = null;

      // Register service worker
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          swRegistration = registration;
          console.log('Service Worker registered successfully');

          // Check for updates on page load
          checkForUpdates(registration);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            console.log('Service Worker update found');
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New Service Worker installed, update available');
                setUpdateAvailable(true);
              }
            });
          });

          // Handle controller change (when new SW takes over)
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('New Service Worker activated');
            // Add a small delay to ensure the new service worker is fully active
            setTimeout(() => {
              window.location.reload();
            }, 100);
          });
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });

      // Check for updates periodically (every 30 minutes)
      const updateInterval = setInterval(() => {
        if (swRegistration) {
          checkForUpdates(swRegistration);
        }
      }, 30 * 60 * 1000);

      // Also check for updates when the app becomes visible again
      const handleVisibilityChange = () => {
        if (!document.hidden && swRegistration) {
          console.log('App became visible, checking for updates...');
          checkForUpdates(swRegistration);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearInterval(updateInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, []);

  const checkForUpdates = (registration) => {
    registration.update()
      .then(() => {
        console.log('Update check completed');
      })
      .catch(error => {
        console.error('Update check failed:', error);
      });
  };

  const handleUpdate = () => {
    setIsUpdating(true);
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Send message to service worker to skip waiting
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      
      // The page will reload automatically when the new service worker takes over
      // due to the 'controllerchange' event listener
    } else {
      // Fallback: manual reload
      window.location.reload();
    }
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <span className="font-medium">
              {isUpdating ? 'Updating...' : 'A new version is available!'}
            </span>
            <div className="text-sm opacity-90">
              Current version: {currentVersion}
            </div>
          </div>
        </div>
        
        {!isUpdating && (
          <button
            onClick={handleUpdate}
            className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
          >
            Update Now
          </button>
        )}
      </div>
    </div>
  );
};

export default PWAUpdateManager; 