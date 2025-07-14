// © 2024–2025 Harnisch LLC. All rights reserved.
// Developed in partnership with BadderSports and SwingBadder.
// Unauthorized commercial use or branding is prohibited.

import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';
import WARValueCalculator from './WARValueCalculator';

const App = () => {
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    // Check URL on load and listen for changes
    const checkForAdmin = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true') {
        const password = prompt('Enter admin password:');
        if (password === 'badderadmin2024') {
          setShowAdmin(true);
        } else {
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
        if (password === 'badderadmin2024') {
          setShowAdmin(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (showAdmin) {
    return <AdminDashboard />;
  }
  
  return <WARValueCalculator />;
};

export default App;
