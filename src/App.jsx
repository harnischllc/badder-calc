// © 2024–2025 Harnisch LLC. All rights reserved.
// Developed in partnership with BadderSports and SwingBadder.
// Unauthorized commercial use or branding is prohibited.

import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';
import WARValueCalculator from './WARValueCalculator';

const App = () => {
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check URL parameters on load
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminRoute = urlParams.get('admin') === 'true';
    
    if (isAdminRoute && !isAuthenticated) {
      const password = prompt('Enter admin password:');
      if (password === 'badderadmin2024') {
        setShowAdmin(true);
        setIsAuthenticated(true);
      } else {
        // Remove admin parameter and redirect
        window.location.href = window.location.origin + window.location.pathname;
      }
    }
  }, []);

  if (showAdmin) {
    return <AdminDashboard />;
  }
  
  return <WARValueCalculator />;
};

export default App;
