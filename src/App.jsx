// © 2024–2025 Harnisch LLC. All rights reserved.
// Developed in partnership with BadderSports and SwingBadder.
// Unauthorized commercial use or branding is prohibited.

import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';
import WARValueCalculator from './WARValueCalculator';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  const [showAdmin, setShowAdmin] = useState(false);
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'defaultPassword2024';

  useEffect(() => {
    // Check URL on load and listen for changes
    const checkForAdmin = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true') {
        const password = prompt('Enter admin password:');
        if (password === ADMIN_PASSWORD) {
          setShowAdmin(true);
        } else {
          alert('Invalid password');
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    };

    // Check on load
    checkForAdmin();

    // Listen for keyboard shortcut: Ctrl+Shift+A
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        const password = prompt('Enter admin password:');
        if (password === ADMIN_PASSWORD) {
          setShowAdmin(true);
        } else {
          alert('Invalid password');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [ADMIN_PASSWORD]);

  return (
    <ErrorBoundary>
      {showAdmin ? (
        <AdminDashboard onExit={() => setShowAdmin(false)} />
      ) : (
        <WARValueCalculator />
      )}
    </ErrorBoundary>
  );
};

export default App;
