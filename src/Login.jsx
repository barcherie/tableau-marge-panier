// 📄 Login.jsx — version avec logs complets pour debug
import React, { useState } from 'react';
import './App.css';

const HARDCODED_EMAIL = 'valentin.flausse@gmail.com';
const HASHED_PASSWORD = '1cad2e38996844775e10650a95fbc488bc90c4e2a68cd065923de83e4f56f163';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const hashedInput = await hashPassword(password);

    console.log('🧪 Email saisi :', email);
    console.log('🔐 Mot de passe saisi :', password);
    console.log('🔍 Hash généré :', hashedInput);
    console.log('🎯 Hash attendu  :', HASHED_PASSWORD);

    if (email === HARDCODED_EMAIL && hashedInput === HASHED_PASSWORD) {
      console.log('✅ Authentification réussie');
      localStorage.setItem('isAuthenticated', 'true');
      window.location.href = '/';
    } else {
      console.warn('❌ Authentification échouée');
      setErrorMsg('Email ou mot de passe incorrect.');
    }
  };

  return (
    <div className="login-container">
      <h2>Connexion</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Se connecter</button>
        {errorMsg && <div className="error-msg">{errorMsg}</div>}
      </form>
    </div>
  );
}
