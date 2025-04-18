// 📄 AppRouter.jsx — Routage simplifié avec logout
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import App from './App';
import CartView from './CartView';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <div style={{ textAlign: 'right', padding: '1rem' }}>
      <button onClick={handleLogout}>🔓 Se déconnecter</button>
    </div>
  );
}

export default function AppRouter() {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  return (
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route
              path="/"
              element={
                <>
                  <LogoutButton />
                  <App />
                </>
              }
            />
            <Route
              path="/panier"
              element={
                <>
                  <LogoutButton />
                  <CartView />
                </>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
