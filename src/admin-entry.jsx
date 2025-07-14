// src/admin-entry.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import AdminDashboard from './components/AdminDashboard'
import './index.css'

// Check password immediately
const password = prompt('Enter admin password:');
if (password !== 'badderadmin2024') {
  window.location.href = '/';
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <AdminDashboard />
    </React.StrictMode>,
  )
}
